'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { ChangePasswordInput, changePasswordSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { changePassword, isLoading, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await changePassword(data.currentPassword, data.newPassword);

      setSuccessMessage('Password changed successfully! Redirecting...');
      reset();

      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-violet-600" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 flex gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Success</p>
                  <p className="text-sm">{successMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter your current password"
                  {...register('currentPassword')}
                  className={`w-full px-4 py-2 rounded-lg border bg-background transition-colors ${
                    errors.currentPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-violet-500'
                  } focus:outline-none focus:ring-2`}
                />
                {errors.currentPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="Enter your new password"
                  {...register('newPassword')}
                  className={`w-full px-4 py-2 rounded-lg border bg-background transition-colors ${
                    errors.newPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-violet-500'
                  } focus:outline-none focus:ring-2`}
                />
                {errors.newPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm your new password"
                  {...register('confirmPassword')}
                  className={`w-full px-4 py-2 rounded-lg border bg-background transition-colors ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-violet-500'
                  } focus:outline-none focus:ring-2`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Password must contain:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ At least 8 characters</li>
                  <li>✓ One uppercase letter (A-Z)</li>
                  <li>✓ One lowercase letter (a-z)</li>
                  <li>✓ One digit (0-9)</li>
                  <li>✓ One special character (@$!%*?&)</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </form>

            {/* Help Text */}
            <p className="text-xs text-muted-foreground text-center mt-4">
              Remember your new password for your next login
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
