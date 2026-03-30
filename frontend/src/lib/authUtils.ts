'use client';

/**
 * Auth utilities for managing tokens and authentication state
 */

// ── Token Management ────────────────────────────────────────

/**
 * Set tokens in localStorage
 */
export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
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
 * Clear all auth tokens
 */
export const clearAuthTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// ── User Information Management ─────────────────────────────

/**
 * Set user info in localStorage
 */
export const setUserInfo = (user: any) => {
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
export const handleOAuthSuccess = (token: string, user: any) => {
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
