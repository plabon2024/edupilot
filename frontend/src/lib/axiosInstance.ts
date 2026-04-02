'use client';

import { getNewTokensWithRefreshToken } from '@/services/auth.services';
import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  console.warn('Warning: NEXT_PUBLIC_API_BASE_URL is not defined. API calls will fail at runtime.');
}

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization header
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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as import('axios').AxiosRequestConfig & { _retry?: boolean };

    // If we get a 401 and haven't already retried, try to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const success = await getNewTokensWithRefreshToken(refreshToken);
            if (success) {
              // Retry the original request
              const newAccessToken = localStorage.getItem('accessToken');
              if (newAccessToken && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              return axiosInstance(originalRequest);
            }
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth API Endpoints ──────────────────────────────────────

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
  // Register
  register: async (data: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Verify Email
  verifyEmail: async (data: { email: string; otp: string }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/verify-email', data);
    return response.data;
  },

  // Forget Password
  forgetPassword: async (data: { email: string }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/forget-password', data);
    return response.data;
  },

  // Reset Password
  resetPassword: async (data: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/reset-password', data);
    return response.data;
  },

  // Change Password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/change-password', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/logout');
    return response.data;
  },

  // Get Current User
  getMe: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.get<AuthResponse>('/auth/me');
    return response.data;
  },

  // Google Login
  googleLogin: async (redirectPath?: string): Promise<{ url: string }> => {
    const params = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
    const response = await axiosInstance.get<GoogleOAuthResponse>(
      `/auth/login/google${params}`,
      { maxRedirects: 0 }
    );
    if (response.data?.data?.url) {
      return { url: response.data.data.url };
    }
    throw new Error('Failed to get Google OAuth URL');
  },

  // Refresh Token
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/refresh-token');
    return response.data;
  },
};

export default axiosInstance;
