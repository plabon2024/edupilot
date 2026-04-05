'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ChangePasswordInput, changePasswordSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Key, Lock } from 'lucide-react';
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
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      setSuccessMessage('Password changed successfully! Redirecting…');
      reset();
      setTimeout(() => router.push('/profile'), 2000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to change password. Please try again.');
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

  if (!isAuthenticated) return null;

  const PasswordField = ({
    id,
    label,
    regKey,
    placeholder,
    show,
    onToggle,
    error,
  }: {
    id: string;
    label: string;
    regKey: 'currentPassword' | 'newPassword' | 'confirmPassword';
    placeholder: string;
    show: boolean;
    onToggle: () => void;
    error?: string;
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-foreground mb-2">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          {...register(regKey)}
          type={show ? 'text' : 'password'}
          id={id}
          placeholder={placeholder}
          className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
            error ? 'border-red-400 focus:ring-red-400/50' : 'border-border hover:border-muted-foreground/50'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Profile
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center">
              <Key className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Change Password</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Update your account password</p>
            </div>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="mb-5 flex gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-5 flex gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <PasswordField
              id="currentPassword"
              label="Current Password"
              regKey="currentPassword"
              placeholder="Enter your current password"
              show={showCurrent}
              onToggle={() => setShowCurrent(!showCurrent)}
              error={errors.currentPassword?.message}
            />
            <PasswordField
              id="newPassword"
              label="New Password"
              regKey="newPassword"
              placeholder="Enter your new password"
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              error={errors.newPassword?.message}
            />
            <PasswordField
              id="confirmPassword"
              label="Confirm New Password"
              regKey="confirmPassword"
              placeholder="Re-enter your new password"
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              error={errors.confirmPassword?.message}
            />

            {/* Requirements */}
            <div className="rounded-xl bg-muted/60 border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Password requirements
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                {[
                  'At least 8 characters',
                  'One uppercase (A–Z)',
                  'One lowercase (a–z)',
                  'One digit (0–9)',
                  'One special char (@$!%*?&)',
                ].map((req) => (
                  <li key={req} className="flex items-center gap-1.5">
                    <span className="text-violet-500">✓</span> {req}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.01] disabled:opacity-60 disabled:scale-100"
            >
              {isSubmitting ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
