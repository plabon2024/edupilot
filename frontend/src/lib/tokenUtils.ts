'use client';

import { jwtDecode } from 'jwt-decode';

/**
 * Decode JWT token to get payload
 */
export const decodeToken = (token: string) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

/**
 * Check if token is expiring soon (within 5 minutes)
 */
export const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded.exp) return true;
    const fiveMinutesInMs = 5 * 60 * 1000;
    return decoded.exp * 1000 - Date.now() < fiveMinutesInMs;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpirationTime = (token: string): number | null => {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch (error) {
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
  } catch (error) {
    return null;
  }
};
