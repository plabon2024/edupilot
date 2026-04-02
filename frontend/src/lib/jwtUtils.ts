'use client';

/**
 * JWT utilities for token handling
 * Note: This is designed for client-side usage with cookies
 */

export const jwtUtils = {
  /**
   * Verify JWT token (basic validation)
   * For actual verification, use backend
   */
  verifyToken: (
    token: string,
    _secretKey?: string
  ): { success: boolean; data?: unknown } => {
    try {
      // Just a basic structure check, actual verification happens on backend
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { success: false };
      }
      
      // Decode to get payload
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf8')
      );
      
      return { success: true, data: payload };
    } catch (error) {
      console.error('Token verification failed:', error);
      return { success: false };
    }
  },

  /**
   * Decode token without verification
   */
  decodeToken: (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      return JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf8')
      );
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },
};

/**
 * Server-side token operations (use with caution)
 */
export const setTokenInCookies = async (
  name: string,
  value: string,
  maxAge?: number
) => {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    
    cookieStore.set(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: maxAge || 7 * 24 * 60 * 60, // 7 days default
    });
  } catch (error) {
    console.error('Error setting token in cookies:', error);
  }
};

/**
 * Server-side token removal
 */
export const removeTokenFromCookies = async (name: string) => {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.delete(name);
  } catch (error) {
    console.error('Error removing token from cookies:', error);
  }
};
