'use client';

import { clearAuthTokens, clearUserInfo, getAuthTokens, getUserInfo, setAuthTokens, setUserInfo } from '@/lib/authUtils';
import { authAPI } from '@/lib/axiosInstance';
import { isTokenExpired } from '@/lib/tokenUtils';
import { clearAuthCookies, getNewTokensWithRefreshToken } from '@/services/auth.services';
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
      const tokens = getAuthTokens();
      if (!tokens?.refreshToken) return false;

      const success = await getNewTokensWithRefreshToken(tokens.refreshToken);
      return success;
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
        } else if (tokens?.refreshToken) {
          // Try to refresh token
          const success = await refreshAccessToken();
          if (success) {
            const newTokens = getAuthTokens();
            if (newTokens?.accessToken) {
              const newUser = getUserInfo();
              setIsAuthenticated(true);
              setUser(newUser);
            }
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

          // Navigate to dashboard
          router.push('/dashboard');
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

          // Navigate to dashboard
          router.push('/dashboard');
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
        const response = await authAPI.googleLogin(redirectPath);
        if (response.url) {
          // Redirect to Google OAuth
          window.location.href = response.url;
        }
      } catch (err: unknown) {
        const axErr = err as AxiosError<{ message: string }>;
        const errorMessage = axErr.response?.data?.message || axErr.message || 'Google login failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
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
