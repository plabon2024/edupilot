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

  // Fill email + password fields from preset
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
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await googleLogin('/dashboard');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Google login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || isLoading;

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 items-center justify-center overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="relative z-10 text-center px-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">EduPilot AI</h2>
          <p className="text-white/80 text-lg font-medium max-w-xs mx-auto leading-relaxed">
            Turn any document into flashcards, quizzes &amp; a private AI tutor — instantly.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[['10k+', 'Students'], ['5M+', 'Flashcards'], ['+41%', 'Grade Jump']].map(([val, label]) => (
              <div key={label} className="bg-white/10 backdrop-blur-md rounded-2xl py-4 border border-white/20">
                <p className="text-2xl font-black text-white">{val}</p>
                <p className="text-xs text-white/70 font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>
          {/* Feature bullets */}
          <div className="mt-10 space-y-3 text-left max-w-xs mx-auto">
            {[
              { icon: Zap, text: 'AI flashcards in 12 seconds' },
              { icon: Brain, text: 'Smart adaptive quizzes' },
              { icon: Sparkles, text: 'Private AI tutor, always on' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">EduPilot AI</span>
          </div>

          {/* Header */}
          <div className="mb-7">
            <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 text-violet-600 dark:text-violet-400 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
              <Sparkles className="w-3 h-3" />
              Welcome back
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Sign in to your account
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-violet-600 hover:text-violet-500 font-semibold transition-colors">
                Sign up free
              </Link>
            </p>
          </div>

          {/* ── Quick Login Presets ── */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Quick Login (Demo)
            </p>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_LOGINS.map((preset) => {
                const Icon = preset.icon;
                const isActive = activeQuick === preset.id;
                return (
                  <button
                    key={preset.id}
                    id={preset.id}
                    type="button"
                    onClick={() => handleQuickLogin(preset)}
                    className={`
                      relative flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left
                      transition-all duration-200 group cursor-pointer
                      ${preset.colorClass}
                      ${isActive ? 'ring-2 ring-offset-2 ring-violet-500/50 scale-[1.02]' : 'hover:scale-[1.01]'}
                    `}
                  >
                    <div className={`w-8 h-8 rounded-lg border ${isActive ? preset.colorClass : 'bg-background/60 border-border'} flex items-center justify-center flex-shrink-0 transition-all duration-200`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-foreground">{preset.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{preset.email}</p>
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2">
                        <div className={`w-2 h-2 rounded-full ${preset.dotClass} animate-pulse`} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground/60 text-center">
              Click a preset to fill credentials, then sign in
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or sign in manually</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Error */}
          {(errorMessage || authError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {errorMessage || authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm ${errors.email
                      ? 'border-red-400 focus:ring-red-400/50'
                      : 'border-border hover:border-muted-foreground/40'
                    }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm ${errors.password
                      ? 'border-red-400 focus:ring-red-400/50'
                      : 'border-border hover:border-muted-foreground/40'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isDisabled}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.01] disabled:opacity-60 disabled:scale-100"
            >
              {isDisabled ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isDisabled}
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold gap-3 hover:bg-muted/60 transition-all text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {isDisabled ? 'Redirecting…' : 'Continue with Google'}
          </Button>
        </div>
      </div>
    </div>
  );
}
