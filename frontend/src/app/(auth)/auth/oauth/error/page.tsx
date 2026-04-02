'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OAuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const getErrorMessage = () => {
    switch (error) {
      case 'oauth_init_failed':
        return 'Failed to initialize OAuth login';
      case 'oauth_failed':
        return 'OAuth authentication failed';
      case 'state_mismatch':
        return 'Security validation failed';
      case 'access_denied':
        return 'You denied access to your account';
      default:
        return errorDescription || 'An error occurred during authentication';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold text-red-600">Authentication Error</CardTitle>
          <CardDescription>Something went wrong during the authentication process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold mb-1">Error:</p>
            <p>{getErrorMessage()}</p>
          </div>

          <div className="space-y-3">
            <Button onClick={() => router.push('/login')} className="w-full bg-blue-600 hover:bg-blue-700">
              Back to Login
            </Button>
            <Button
              onClick={() => router.push('/forgot-password')}
              variant="outline"
              className="w-full"
            >
              Reset Password
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OAuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OAuthErrorContent />
    </Suspense>
  );
}
