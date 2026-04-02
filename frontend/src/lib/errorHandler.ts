'use client';

import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * Parse axios error to get user-friendly message
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Server responded with error
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Network error messages
    switch (error.code) {
      case 'ECONNREFUSED':
        return 'Unable to connect to server';
      case 'ENOTFOUND':
        return 'Server not found';
      case 'ETIMEDOUT':
        return 'Request timeout';
      default:
        return error.message || 'An error occurred';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * Get field-specific validation errors
 */
export const getFieldErrors = (error: unknown): Record<string, string> => {
  if (error instanceof AxiosError && error.response?.data?.errors) {
    return error.response.data.errors;
  }

  return {};
};

/**
 * Check if error is authentication-related
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 401 || error.response?.status === 403;
  }

  return false;
};

/**
 * Check if error is validation-related
 */
export const isValidationError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 400 || error.response?.status === 422;
  }

  return false;
};

/**
 * Format API error for logging
 */
export const formatErrorForLogging = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    return {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      code: error.code,
      details: error.response?.data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'Unknown error',
  };
};

/**
 * Retry logic for failed requests
 */
export const retryRequest = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
};
