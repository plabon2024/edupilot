'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { VerifyEmailInput, verifyEmailSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, isLoading, error: authError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);

  const email = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email },
  });

  useEffect(() => {
    if (email) {
      setValue('email', email);
    }
  }, [email, setValue]);

  const onSubmit = async (data: VerifyEmailInput) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await verifyEmail(data.email, data.otp);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Email verification failed');
      setShowResend(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
          <CardDescription>Enter the OTP sent to your email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(errorMessage || authError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errorMessage || authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                disabled
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600 block w-full sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                One-Time Password (OTP)
              </label>
              <input
                {...register('otp')}
                type="text"
                id="otp"
                maxLength={6}
                className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest sm:text-sm ${
                  errors.otp ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="000000"
              />
              {errors.otp && (
                <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">Check your email for the 6-digit code</p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting || isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>

            {showResend && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowResend(false);
                  setErrorMessage(null);
                }}
              >
                Resend OTP
              </Button>
            )}
          </form>

          <p className="text-center text-sm text-gray-600">
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Back to Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
