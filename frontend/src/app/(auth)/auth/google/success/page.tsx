'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { setAuthTokens } from '@/lib/authUtils';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function GoogleSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAccessToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleGoogleSuccess = async () => {
      try {
        const redirectPath = searchParams.get('redirect') || '/dashboard';
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get('accessToken');
        const refreshToken = hashParams.get('refreshToken');

        if (accessToken && refreshToken) {
          setAuthTokens(accessToken, refreshToken);
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }

        const success = await refreshAccessToken();

        if (success) {
          router.push(decodeURIComponent(redirectPath));
        } else {
          setError('Failed to authenticate with Google');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Google OAuth success error:', err);
        setError('An error occurred during authentication');
        setIsProcessing(false);
      }
    };

    handleGoogleSuccess();
  }, [searchParams, refreshAccessToken, router]);

  if (isProcessing && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Completing authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Back to Login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <GoogleSuccessContent />
    </Suspense>
  );
}
