'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LoginInput, loginSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Brain, Eye, EyeOff, Lock, Mail, Sparkles,
  ShieldCheck, User, Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

// ── Quick-login presets ─────────────────────────────────────
const QUICK_LOGINS = [
  {
    id: 'quick-admin',
    label: 'Admin',
    email: 'admin@gmail.com',
    password: '@123ADMINadmin',
    icon: ShieldCheck,
    colorClass: 'border-violet-500/40 bg-violet-500/5 hover:bg-violet-500/10 text-violet-600 dark:text-violet-400',
    dotClass: 'bg-violet-500',
  },
  {
    id: 'quick-user',
    label: 'Student',
    email: 'user@gmail.com',
    password: '@123USERuser',
    icon: User,
    colorClass: 'border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    dotClass: 'bg-indigo-500',
  },
] as const;

export default function LoginPage() {
  const { login: authLogin, googleLogin, isLoading, error: authError } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeQuick, setActiveQuick] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const watchedEmail = watch('email');

  const handleQuickLogin = (preset: typeof QUICK_LOGINS[number]) => {
    setValue('email', preset.email, { shouldValidate: true });
    setValue('password', preset.password, { shouldValidate: true });
    setActiveQuick(preset.id);
    setErrorMessage(null);
  };

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await authLogin(data);

      // ✅ Redirect to home
      router.push('/');

    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // ✅ Redirect to home after Google login
      await googleLogin('/');

    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Google login failed.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || isLoading;

  return (
    <div className="min-h-screen flex bg-background">

      {/* LEFT PANEL (unchanged) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center px-12">
          <Brain className="w-10 h-10 text-white mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-4">EduPilot AI</h2>
          <p className="text-white/80 text-lg">
            Turn any document into flashcards, quizzes & a private AI tutor.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">

          <h1 className="text-3xl font-black mb-6">Sign in</h1>

          {/* Quick login */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {QUICK_LOGINS.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleQuickLogin(preset)}
                  className="p-3 border rounded-xl flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Error */}
          {(errorMessage || authError) && (
            <div className="mb-4 text-red-500 text-sm">
              {errorMessage || authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <input
              {...register('email')}
              type="email"
              placeholder="Email"
              className="w-full p-3 border rounded-xl"
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}

            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full p-3 border rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}

            <Button type="submit" disabled={isDisabled} className="w-full">
              {isDisabled ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {/* Google */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isDisabled}
            variant="outline"
            className="w-full mt-4"
          >
            Continue with Google
          </Button>

          <p className="mt-4 text-sm text-center">
            Don’t have an account? <Link href="/register">Sign up</Link>
          </p>

        </div>
      </div>
    </div>
  );
}