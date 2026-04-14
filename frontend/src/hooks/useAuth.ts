'use client';

/**
 * useAuth.ts
 *
 * Central authentication hook for EduPilot AI.
 *
 * Responsibilities:
 *  - Initialize auth state from localStorage tokens on mount,
 *    then silently validate with the server via GET /auth/me.
 *  - Expose login, register, logout, changePassword, and googleLogin actions.
 *  - Proactively refresh tokens when the access token is expired.
 *  - Keep `user`, `isAuthenticated`, `isLoading`, and `error` in sync.
 */

import { getDefaultDashboardRoute } from '@/config/authRoutes';
import {
  clearAuthTokens,
  clearUserInfo,
  getAuthTokens,
  getUserInfo,
  setAuthTokens,
  setUserInfo,
} from '@/lib/authUtils';
import { authAPI } from '@/lib/axiosInstance';
import { isTokenExpired } from '@/lib/tokenUtils';
import { clearAuthCookies } from '@/services/auth.services';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

/** Shape of a fully authenticated user returned from the server. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  /** 'USER' | 'ADMIN' */
  role: string;
  emailVerified: boolean;
  status?: string;
  needPasswordChange?: boolean;
  image?: string | null;
  isSubscribed?: boolean;
  subscriptionEndsAt?: string | null;
  createdAt?: string;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  googleLogin: (redirectPath?: string) => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  /** Clear any pending error state. */
  clearError: () => void;
  error: string | null;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Internal helpers ───────────────────────────────────────────────────────

  /** Wipe all local auth state without triggering a redirect. */
  const clearLocalAuth = useCallback(() => {
    clearAuthTokens();
    clearUserInfo();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // ── Token refresh ─────────────────────────────────────────────────────────

  /**
   * Try to obtain a fresh access token using the stored refresh token.
   * After refreshing, re-fetches /auth/me to confirm the user is still active.
   *
   * Returns `true` on success, `false` on any failure.
   */
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      // Step 1: attempt a cookie-based token refresh via the backend.
      // This may succeed or fail depending on whether cookies are present.
      try {
        const refreshResponse = await authAPI.refreshToken();
        if (refreshResponse.data?.accessToken) {
          setAuthTokens(
            refreshResponse.data.accessToken,
            refreshResponse.data.refreshToken ?? ''
          );
        }
      } catch (refreshError) {
        // Cookie-based refresh failed — the interceptor in axiosInstance will
        // have already attempted a localStorage-based refresh. Continue anyway
        // and let /me determine if we have a valid session.
        console.warn('[useAuth] Cookie-based refresh failed:', refreshError);
      }

      // Step 2: confirm the session is valid by fetching the current user.
      // GET /auth/me returns `{ success, data: userObject }` — data IS the user.
      const meResponse = await authAPI.getMe();
      const refreshedUser = meResponse.data as AuthUser | null;
      if (refreshedUser?.id) {
        setUserInfo(refreshedUser);
        setUser(refreshedUser);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (err) {
      console.error('[useAuth] Token refresh failed:', err);
      return false;
    }
  }, []);

  // ── Auth initialisation ───────────────────────────────────────────────────

  /**
   * Run once on mount.
   *
   * Strategy:
   *  1. If localStorage has a valid (non-expired) access token, optimistically
   *     mark the user as authenticated using the cached user object so the UI
   *     renders immediately without a loading flicker.
   *  2. Regardless, call GET /auth/me in the background to validate the session
   *     server-side and refresh the user object. If /me fails (e.g. account
   *     suspended, token revoked) we clear all auth state.
   *  3. If there is no valid access token, attempt a full refresh cycle.
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokens = getAuthTokens();
        const storedUser = getUserInfo() as AuthUser | null;

        const hasValidToken =
          !!tokens?.accessToken && !isTokenExpired(tokens.accessToken);

        if (hasValidToken && storedUser) {
          // Optimistic hydration from cache — shows UI immediately.
          setUser(storedUser);
          setIsAuthenticated(true);
          setIsLoading(false);

          // Background server-side validation — non-blocking.
          // NOTE: GET /auth/me returns `{ success, data: userObject }` where
          // `data` IS the user directly (not nested as `data.user`).
          authAPI
            .getMe()
            .then((res) => {
              const freshUser = res.data as AuthUser | null;
              if (freshUser?.id) {
                setUserInfo(freshUser);
                setUser(freshUser);
              } else {
                // Server says session is no longer valid.
                clearLocalAuth();
              }
            })
            .catch(() => {
              // /me failed (401 etc.) — token revoked; clear local auth.
              clearLocalAuth();
            });

          return; // setIsLoading already called above
        }

        // No valid cached token — try to refresh.
        const success = await refreshAccessToken();
        if (!success) {
          clearLocalAuth();
        }
      } catch (err) {
        console.error('[useAuth] Auth initialization error:', err);
        clearLocalAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────

  const register = useCallback(
    async (data: { name: string; email: string; password: string }) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await authAPI.register(data);

        if (response.data?.accessToken && response.data?.refreshToken) {
          setAuthTokens(response.data.accessToken, response.data.refreshToken);
          setUserInfo(response.data.user);
          setUser(response.data.user as AuthUser);
          setIsAuthenticated(true);
          router.replace(getDefaultDashboardRoute(response.data?.user?.role));
        }
      } catch (err: unknown) {
        const axErr = err as AxiosError<{ message: string }>;
        const errorMessage =
          axErr.response?.data?.message ?? axErr.message ?? 'Registration failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // ── Login ─────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (data: { email: string; password: string }) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await authAPI.login(data);

        if (response.data?.accessToken && response.data?.refreshToken) {
          setAuthTokens(response.data.accessToken, response.data.refreshToken);
          setUserInfo(response.data.user);
          setUser(response.data.user as AuthUser);
          setIsAuthenticated(true);
          router.replace(getDefaultDashboardRoute(response.data?.user?.role));
        }
      } catch (err: unknown) {
        const axErr = err as AxiosError<{ message: string }>;
        const errorMessage =
          axErr.response?.data?.message ?? axErr.message ?? 'Login failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // ── Logout ────────────────────────────────────────────────────────────────

  /**
   * Logs the user out:
   *  1. Invalidates the server-side session (best-effort).
   *  2. Clears server-side cookies (best-effort).
   *  3. Clears localStorage tokens and React state.
   *  4. Navigates to /login.
   *
   * All cleanup steps run regardless of individual failures.
   */
  const logout = useCallback(async () => {
    setIsLoading(true);

    // Step 1 — server session invalidation (best-effort, non-blocking failure).
    try {
      await authAPI.logout();
    } catch (err) {
      console.warn('[useAuth] Server logout failed (continuing with local cleanup):', err);
    }

    // Step 2 — clear server-side cookies (best-effort).
    try {
      await clearAuthCookies();
    } catch (err) {
      console.warn('[useAuth] Cookie clear failed (continuing with local cleanup):', err);
    }

    // Step 3 — always clear local state.
    clearLocalAuth();
    setIsLoading(false);

    // Step 4 — redirect.
    router.push('/login');
  }, [router, clearLocalAuth]);

  // ── Change password ───────────────────────────────────────────────────────

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        setIsLoading(true);
        setError(null);
        await authAPI.changePassword({ currentPassword, newPassword });
      } catch (err: unknown) {
        const axErr = err as AxiosError<{ message: string }>;
        const errorMessage =
          axErr.response?.data?.message ?? axErr.message ?? 'Password change failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ── Google OAuth ──────────────────────────────────────────────────────────

  /**
   * Initiates the Google OAuth flow by redirecting the browser to the backend
   * OAuth initiation URL. The page will navigate away, so loading state is
   * intentionally left as `true`.
   */
  const googleLogin = useCallback(
    async (redirectPath?: string) => {
      try {
        setIsLoading(true);
        setError(null);
        const params = redirectPath
          ? `?redirect=${encodeURIComponent(redirectPath)}`
          : '';
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
        window.location.href = `${baseUrl}/auth/login/google${params}`;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Google login failed';
        setError(errorMessage);
        setIsLoading(false);
        throw new Error(errorMessage);
      }
      // ⚠️  Do NOT set isLoading(false) here — the browser is navigating away.
    },
    []
  );

  // ── Clear error ───────────────────────────────────────────────────────────

  const clearError = useCallback(() => setError(null), []);

  // ── Return ────────────────────────────────────────────────────────────────

  return {
    user,
    isLoading,
    isAuthenticated,
    register,
    login,
    logout,
    changePassword,
    googleLogin,
    refreshAccessToken,
    clearError,
    error,
  };
};
