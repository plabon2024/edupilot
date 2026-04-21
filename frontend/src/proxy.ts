import { NextRequest, NextResponse } from "next/server";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  type UserRole,
} from "./config/authRoutes";

// ── Edge-safe JWT decode ──────────────────────────────────────────────────────
// We only need the payload (no signature verification here — the backend
// is the authority). `jose` is Edge-compatible and already in package.json.
import { decodeJwt } from "jose";

/**
 * Safely decode a JWT and return the payload, or null on any error.
 * This does NOT verify the signature — it is used only for routing decisions.
 * The backend enforces actual security.
 */
function safeDecodeJwt(token: string): Record<string, unknown> | null {
  try {
    return decodeJwt(token) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Returns true if the token's `exp` claim is in the past. */
function isExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp;
  if (typeof exp !== "number") return true;
  return exp * 1000 < Date.now();
}

/** Returns true if the token expires within the next 5 minutes. */
function isExpiringSoon(payload: Record<string, unknown>): boolean {
  const exp = payload.exp;
  if (typeof exp !== "number") return true;
  return exp * 1000 - Date.now() < 5 * 60 * 1000;
}

// ── Token refresh ─────────────────────────────────────────────────────────────

async function refreshTokens(
  refreshToken: string,
  backendBaseUrl: string
): Promise<boolean> {
  try {
    const res = await fetch(`${backendBaseUrl}/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    return res.ok;
  } catch (err) {
    console.error("[middleware] Token refresh error:", err);
    return false;
  }
}

// ── Main middleware ───────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const pathWithQuery = `${pathname}${request.nextUrl.search}`;

    // Read tokens from cookies (set by the backend / login action).
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    const payload = accessToken ? safeDecodeJwt(accessToken) : null;
    const isValidAccessToken = !!payload && !isExpired(payload);
    const userRole: UserRole | null = isValidAccessToken
      ? ((payload as Record<string, unknown>).role as UserRole) ?? null
      : null;

    const routeOwner = getRouteOwner(pathname);
    const isAuth = isAuthRoute(pathname);

    // ── Proactive token refresh ──────────────────────────────────────────────
    if (isValidAccessToken && refreshToken && isExpiringSoon(payload!)) {
      const backendBaseUrl =
        process.env.NEXT_PUBLIC_AUTH_URL ??
        process.env.BACKEND_URL ??
        "";
      if (backendBaseUrl) {
        await refreshTokens(refreshToken, backendBaseUrl);
      }
      // Continue — the backend will set new cookies in set-cookie headers
      // if it can; we just let the request through either way.
    }

    // Rule 1: Logged-in users cannot visit auth pages (login / register / etc.)
    if (isAuth && isValidAccessToken) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), request.url)
      );
    }

    // Rule 2: Public route
    if (routeOwner === null) {
      // Special case: root "/" → redirect authenticated users to dashboard
      if (pathname === "/" && isValidAccessToken) {
        return NextResponse.redirect(
          new URL(getDefaultDashboardRoute(userRole as UserRole), request.url)
        );
      }
      return NextResponse.next();
    }

    // Rule 3: Protected route but no valid token → redirect to login
    if (!isValidAccessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathWithQuery);
      return NextResponse.redirect(loginUrl);
    }

    // Rule 4: Common protected route (any authenticated user)
    if (routeOwner === "COMMON") {
      return NextResponse.next();
    }

    // Rule 5: Role-specific protected route — enforce ownership
    if (routeOwner === "ADMIN" || routeOwner === "USER") {
      if (routeOwner !== userRole) {
        return NextResponse.redirect(
          new URL(getDefaultDashboardRoute(userRole as UserRole), request.url)
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[middleware] Unexpected error:", error);
    // Fail open — let the request through so the app can render an error page.
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};