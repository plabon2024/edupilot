'use client';

/**
 * axiosInstance.ts
 *
 * Central Axios instance for all API calls from the browser.
 *
 * Token refresh strategy (401 response interceptor):
 *  1. Read refreshToken from localStorage.
 *  2. POST directly to the backend /auth/refresh-token endpoint
 *     (raw fetch — NOT via a 'use server' action, which cannot be
 *     called from client-side code).
 *  3. If the backend returns new tokens, store them in localStorage
 *     and retry the original request once.
 *  4. If refresh fails, clear all auth state so the user is
 *     effectively logged out on the next navigation.
 */

import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  console.warn(
    '[axiosInstance] Warning: NEXT_PUBLIC_API_BASE_URL is not defined. API calls will fail at runtime.'
  );
}

// ── Axios instance ───────────────────────────────────────────

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // forward cookies on every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach access token ────────────────

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Token refresh helper (browser-safe) ─────────────────────

/**
 * Calls the backend refresh-token endpoint directly using `fetch`.
 * Returns `true` when new tokens were successfully stored in localStorage.
 *
 * ⚠️  We deliberately use `fetch` here instead of a 'use server' action
 *     because server actions cannot be invoked from browser-side modules.
 */
async function refreshAccessTokenClientSide(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include', // forward existing cookies (session_token etc.)
      headers: {
        'Content-Type': 'application/json',
        // Send the refreshToken via Authorization header as well in case
        // the backend reads it from there as a fallback.
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!res.ok) {
      console.warn('[axiosInstance] Token refresh failed with status:', res.status);
      return false;
    }

    const body = (await res.json()) as {
      data?: { accessToken?: string; refreshToken?: string };
    };

    const { accessToken, refreshToken: newRefreshToken } = body.data ?? {};

    if (!accessToken) return false;

    // Persist new tokens
    localStorage.setItem('accessToken', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    return true;
  } catch (err) {
    console.error('[axiosInstance] Token refresh error:', err);
    return false;
  }
}

// ── Response interceptor — handle 401 / token expiry ────────

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as import('axios').AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh once per request to avoid infinite loops.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await refreshAccessTokenClientSide();

      if (refreshed) {
        // Attach the new token and retry the original request.
        const newAccessToken = localStorage.getItem('accessToken');
        if (newAccessToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return axiosInstance(originalRequest);
      }

      // Refresh failed — clear stale auth data so the app can redirect to login.
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth API surface ─────────────────────────────────────────

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user?: {
      id: string;
      email: string;
      name: string;
      role: string;
      emailVerified: boolean;
      status?: string;
      needPasswordChange?: boolean;
    };
    accessToken?: string;
    refreshToken?: string;
    /** Better-auth session token (returned alongside JWT tokens) */
    token?: string;
  };
}

export interface GoogleOAuthResponse {
  success: boolean;
  message?: string;
  data?: {
    url: string;
  };
}

export const authAPI = {
  /** Register a new user with name, email, and password. */
  register: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /** Authenticate with email and password. */
  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /** Change the authenticated user's password. */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/change-password', data);
    return response.data;
  },

  /** Invalidate the current session server-side. */
  logout: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/logout');
    return response.data;
  },

  /** Fetch the currently authenticated user's profile. */
  getMe: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.get<AuthResponse>('/auth/me');
    return response.data;
  },

  /** Exchange a valid refresh token for new access + refresh tokens. */
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/refresh-token');
    return response.data;
  },
};

export default axiosInstance;
