/**
 * tokenUtils.ts
 *
 * Pure token inspection helpers — no browser or server-specific APIs.
 * Safe to import from both client components AND server-side middleware.
 *
 * ⚠️  Do NOT add 'use client' or 'use server' here.
 */

import { jwtDecode } from 'jwt-decode';

/**
 * Decode JWT token to get payload
 */
export const decodeToken = (token: string) => {
  try {
    return jwtDecode(token);
  } catch {
    console.error('Error decoding token');
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{exp?: number, [key: string]: unknown}>(token);
    if (!decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

/**
 * Check if token is expiring soon (within 5 minutes)
 */
export const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{exp?: number, [key: string]: unknown}>(token);
    if (!decoded.exp) return true;
    const fiveMinutesInMs = 5 * 60 * 1000;
    return decoded.exp * 1000 - Date.now() < fiveMinutesInMs;
  } catch {
    return true;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpirationTime = (token: string): number | null => {
  try {
    const decoded = jwtDecode<{exp?: number, [key: string]: unknown}>(token);
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

/**
 * Get time until token expires (in milliseconds)
 */
export const getTimeUntilExpiration = (token: string): number | null => {
  try {
    const expTime = getTokenExpirationTime(token);
    if (!expTime) return null;
    const timeRemaining = expTime - Date.now();
    return timeRemaining > 0 ? timeRemaining : 0;
  } catch {
    return null;
  }
};
