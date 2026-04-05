/**
 * Auth Routes Configuration
 * Defines all authentication-related routes
 */

export type UserRole = "USER" | "ADMIN";

export type RouteConfig = {
  exact: string[];
  pattern: RegExp[];
};

export const authRoutes = {
  // Public auth routes
  login: "/login",
  register: "/register",
  
  // OAuth routes
  googleSuccess: "/auth/google/success",
  oauthError: "/auth/oauth/error",
};

export const commonProtectedRoutes: RouteConfig = {
  exact: ["/my-profile", "/change-password"],
  pattern: [],
};

export const adminProtectedRoutes: RouteConfig = {
  pattern: [/^\/admin\/dashboard/],
  exact: [],
};

export const userProtectedRoutes: RouteConfig = {
  pattern: [/^\/dashboard/],
  exact: ["/payment/success"],
};

export const publicRoutes = [
  "/",
  "/pricing",
  "/auth/google/success",
  "/auth/oauth/error",
];

/**
 * Determine if a route is an auth route
 */
export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(authRoutes).some((route) => route === pathname);
};

/**
 * Check if route matches the provided config
 */
export const isRouteMatches = (pathname: string, routes: RouteConfig): boolean => {
  if (routes.exact.includes(pathname)) {
    return true;
  }
  return routes.pattern.some((pattern: RegExp) => pattern.test(pathname));
};

/**
 * Get route owner based on pathname
 */
export const getRouteOwner = (
  pathname: string
): "ADMIN" | "USER" | "COMMON" | null => {
  if (isRouteMatches(pathname, adminProtectedRoutes)) {
    return "ADMIN";
  }

  if (isRouteMatches(pathname, userProtectedRoutes)) {
    return "USER";
  }

  if (isRouteMatches(pathname, commonProtectedRoutes)) {
    return "COMMON";
  }

  return null; // public route
};

/**
 * Determine if a route is protected
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return getRouteOwner(pathname) !== null;
};

/**
 * Determine if a route is public
 */
export const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );
};

/**
 * Get default redirect after login based on user role
 */
export const getDefaultDashboardRoute = (role?: string | UserRole): string => {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "USER":
    default:
      return "/dashboard";
  }
};

/**
 * Check if redirect is valid for user role
 */
export const isValidRedirectForRole = (redirectPath: string, role: UserRole): boolean => {
  const sanitizedRedirectPath = redirectPath.split("?")[0] || redirectPath;
  const routeOwner = getRouteOwner(sanitizedRedirectPath);

  if (routeOwner === null || routeOwner === "COMMON") {
    return true;
  }

  if (routeOwner === role) {
    return true;
  }

  return false;
};
