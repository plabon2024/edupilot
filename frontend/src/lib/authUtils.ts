'use client';

/**
 * Auth utilities for managing tokens and authentication state
 */

// ── Cookie helpers (for middleware visibility) ───────────────

/**
 * Mirror tokens into browser cookies so the Next.js middleware
 * (which runs server-side and cannot access localStorage) can
 * read them for authentication-aware routing.
 *
 * The cookies are NOT httpOnly so the browser can set/clear them
 * from client-side JS. Route protection logic in middleware is
 * purely for UX (redirects); real security lives on the backend.
 */
const isProduction = process.env.NODE_ENV === 'production';

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  const secure = isProduction ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

// ── Token Management ────────────────────────────────────────

/**
 * Set tokens in localStorage AND in browser cookies (for middleware).
 */
export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    // Mirror into cookies so the server-side middleware can read them.
    const ONE_DAY = 60 * 60 * 24;
    const SEVEN_DAYS = ONE_DAY * 7;
    setCookie('accessToken', accessToken, ONE_DAY);
    setCookie('refreshToken', refreshToken, SEVEN_DAYS);
  }
};

/**
 * Get tokens from localStorage
 */
export const getAuthTokens = () => {
  if (typeof window === 'undefined') return null;
  
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  };
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

/**
 * Clear all auth tokens from localStorage AND cookies.
 */
export const clearAuthTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Also clear middleware-visible cookies.
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
  }
};

// ── User Information Management ─────────────────────────────

/**
 * Set user info in localStorage
 */
export const setUserInfo = (user: unknown) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

/**
 * Get user info from localStorage
 */
export const getUserInfo = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

/**
 * Clear user info from localStorage
 */
export const clearUserInfo = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

// ── Auth State Helpers ──────────────────────────────────────

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
};

/**
 * Logout user (clear all auth data)
 */
export const logoutUser = () => {
  clearAuthTokens();
  clearUserInfo();
};

/**
 * Handle OAuth success
 */
export const handleOAuthSuccess = (token: string, user: unknown) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

/**
 * Handle OAuth error
 */
export const handleOAuthError = (error: string) => {
  console.error('OAuth error:', error);
  logoutUser();
};
