'use server';

import { cookies } from 'next/headers';

const baseURL = process.env.NEXT_PUBLIC_AUTH_URL || '';

/**
 * userService
 * Server-only service for getting user session information.
 */
export const userService = {
  getSession: async function () {
    try {
      const cookieStore = await cookies();

      const res = await fetch(`${baseURL}/api/auth/get-session`, {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: 'no-store',
      });

      const session = await res.json();

      if (session === null) {
        return { data: null, error: { message: 'Session is missing.' } };
      }

      return { data: session, error: null };
    } catch (err) {
      console.error('[userService.getSession] Error:', err);
      return { data: null, error: { message: 'Something Went Wrong' } };
    }
  },
};

/**
 * getNewTokensWithRefreshToken
 * Calls the backend to refresh tokens using a refresh token.
 * This is used by the middleware to proactively refresh tokens.
 *
 * @param refreshToken - The refresh token to use for token refresh
 * @returns true if tokens were successfully refreshed, false otherwise
 */
export async function getNewTokensWithRefreshToken(
  refreshToken: string
): Promise<boolean> {
  if (!baseURL) {
    console.error('[getNewTokensWithRefreshToken] NEXT_PUBLIC_AUTH_URL not set');
    return false;
  }

  try {
    const res = await fetch(`${baseURL}/api/v1/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    if (!res.ok) {
      console.warn(
        '[getNewTokensWithRefreshToken] Refresh failed with status:',
        res.status
      );
      return false;
    }

    // Tokens are set in httpOnly cookies by the backend,
    // so we don't need to extract them here.
    return true;
  } catch (err) {
    console.error('[getNewTokensWithRefreshToken] Error:', err);
    return false;
  }
}

/**
 * clearAuthCookies
 * Calls the backend to clear auth cookies (logout endpoint).
 * This is a best-effort operation and won't throw even if it fails.
 */
export async function clearAuthCookies(): Promise<void> {
  if (!baseURL) {
    console.error('[clearAuthCookies] NEXT_PUBLIC_AUTH_URL not set');
    return;
  }

  try {
    await fetch(`${baseURL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  } catch (err) {
    console.warn('[clearAuthCookies] Error clearing cookies:', err);
    // Non-fatal error — logout continues anyway
  }
}