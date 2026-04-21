/**
 * jwtUtils.ts
 *
 * ⚠️  Do NOT add 'use client' here.
 *    - `setTokenInCookies` and `removeTokenFromCookies` use `next/headers`
 *      which is a server-only API.
 *    - `jwtUtils.verifyToken` / `decodeToken` are safe to import anywhere
 *      (they have no server or browser dependencies).
 */

// ── Client-safe helpers ──────────────────────────────────────

/**
 * Lightweight JWT utilities for structural validation and decoding.
 * Actual cryptographic verification must happen on the backend.
 *
 * Uses `jose` (Edge-compatible) for decoding — avoids the Node.js-only
 * `Buffer.from(..., 'base64url')` which is not available in Edge Runtime.
 */
export const jwtUtils = {
  /**
   * Perform a basic structural check and decode the JWT payload.
   * Does NOT cryptographically verify the signature — that is the
   * backend's responsibility.
   *
   * @returns `{ success: true, data: payload }` or `{ success: false }`
   */
  verifyToken: (
    token: string
  ): { success: boolean; data?: Record<string, unknown> } => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { success: false };
      }

      // Base64url → JSON payload
      // Use atob (available in both browser and Edge) instead of Buffer
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const payload = JSON.parse(atob(padded)) as Record<string, unknown>;

      return { success: true, data: payload };
    } catch (error) {
      console.error('Token verification failed:', error);
      return { success: false };
    }
  },

  /**
   * Decode a JWT without any verification.
   * Returns `null` if the token is malformed.
   */
  decodeToken: (token: string): Record<string, unknown> | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      return JSON.parse(atob(padded)) as Record<string, unknown>;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },
};

// ── Server-only helpers ──────────────────────────────────────
// The functions below use `next/headers` and MUST only be called
// from Server Components, Route Handlers, or Server Actions.

/**
 * Persist a token value in an HttpOnly cookie via the Next.js
 * server-side cookie store.
 *
 * @param name     Cookie name
 * @param value    Token string
 * @param maxAge   Lifetime in **seconds** (default: 7 days)
 */
export const setTokenInCookies = async (
  name: string,
  value: string,
  maxAge?: number
): Promise<void> => {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    cookieStore.set(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: maxAge ?? 7 * 24 * 60 * 60, // 7 days in seconds
    });
  } catch (error) {
    console.error('Error setting token in cookies:', error);
  }
};

/**
 * Delete a cookie from the server-side cookie store.
 *
 * @param name  Cookie name to remove
 */
export const removeTokenFromCookies = async (name: string): Promise<void> => {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.delete(name);
  } catch (error) {
    console.error('Error removing token from cookies:', error);
  }
};
