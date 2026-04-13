'use client';

import { getDefaultDashboardRoute } from '@/config/authRoutes';
import { clearAuthTokens, clearUserInfo, getAuthTokens, getUserInfo, setAuthTokens, setUserInfo } from '@/lib/authUtils';
import { authAPI } from '@/lib/axiosInstance';
import { isTokenExpired } from '@/lib/tokenUtils';
import { clearAuthCookies } from '@/services/auth.services';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  status?: string;
  needPasswordChange?: boolean;
  image?: string | null;
  isSubscribed?: boolean;
  subscriptionEndsAt?: string | null;
  createdAt?: string;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  googleLogin: (redirectPath?: string) => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      // Attempt to refresh tokens using cookie-based refresh flow.
      try {
        const refreshResponse = await authAPI.refreshToken();
        if (refreshResponse.data?.accessToken) {
          setAuthTokens(refreshResponse.data.accessToken, refreshResponse.data.refreshToken || '');
        }
      } catch (refreshError) {
        console.warn('Cookie-based refresh failed, trying session check:', refreshError);
      }

      const meResponse = await authAPI.getMe();
      if (meResponse.data?.user) {
        setUserInfo(meResponse.data.user);
        setUser(meResponse.data.user as User);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Token refresh failed:', err);
      return false;
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokens = getAuthTokens();
        const storedUser = getUserInfo();

        if (tokens?.accessToken && !isTokenExpired(tokens.accessToken)) {
          setIsAuthenticated(true);
          setUser(storedUser);
        } else {
          const success = await refreshAccessToken();
          if (!success) {
            clearAuthTokens();
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        clearAuthTokens();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [refreshAccessToken]);

  const register = useCallback(
    async (data: { name: string; email: string; password: string }) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await authAPI.register(data);

        if (response.data?.accessToken && response.data?.refreshToken) {
          setAuthTokens(response.data.accessToken, response.data.refreshToken);
          setUserInfo(response.data.user);
          setUser(response.data.user as User);
          setIsAuthenticated(true);

          // Navigate to default route based on role
          router.replace(getDefaultDashboardRoute(response.data?.user?.role));
        }
      } catch (err: unknown) {
        const axErr = err as AxiosError<{ message: string }>;
        const errorMessage = axErr.response?.data?.message || axErr.message || 'Error occurred';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const login = useCallback(
    async (data: { email: string; password: string }) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await authAPI.login(data);

        if (response.data?.accessToken && response.data?.refreshToken) {
          setAuthTokens(response.data.accessToken, response.data.refreshToken);
          setUserInfo(response.data.user);
          setUser(response.data.user as User);
          setIsAuthenticated(true);

          // Navigate to default route based on role
          router.replace(getDefaultDashboardRoute(response.data?.user?.role));
        }
      } catch (err: unknown) {
        const axErr = err as AxiosError<{ message: string }>;
        const errorMessage = axErr.response?.data?.message || axErr.message || 'Login failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      await clearAuthCookies();
      clearAuthTokens();
      clearUserInfo();
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      router.push('/login');
    }
  }, [router]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        setIsLoading(true);
        setError(null);
        await authAPI.changePassword({ currentPassword, newPassword });
        setError(null);
      } catch (err: unknown) {
        const axErr = err as AxiosError<{ message: string }>;
        const errorMessage = axErr.response?.data?.message || axErr.message || 'Password change failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const googleLogin = useCallback(
    async (redirectPath?: string) => {
      try {
        setIsLoading(true);
        setError(null);
        const params = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const url = `${baseUrl}/auth/login/google${params}`;
        
        // Navigate directly so the browser loads the returned HTML and executes the EJS
        window.location.href = url;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Google login failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        // Don't set isLoading(false) here because we are navigating away
      }
    },
    []
  );


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
    error,
  };
};
