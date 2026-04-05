'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AlertCircle } from 'lucide-react';

function OAuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const getErrorMessage = () => {
    switch (error) {
      case 'oauth_init_failed':
        return 'Failed to initialize OAuth login. Please try again.';
      case 'oauth_failed':
        return 'OAuth authentication failed. Please try again.';
      case 'state_mismatch':
        return 'Security validation failed. Please clear cookies and retry.';
      case 'access_denied':
        return 'You denied access to your account.';
      default:
        return errorDescription || 'An error occurred during authentication.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Authentication Error</CardTitle>
          <CardDescription>Something went wrong during the authentication process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {getErrorMessage()}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              Back to Login
            </Button>
            <Button
              onClick={() => router.push('/register')}
              variant="outline"
              className="w-full"
            >
              Create New Account
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Need help?{' '}
            <Link href="/login" className="text-violet-600 hover:text-violet-500 font-medium">
              Contact support
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
