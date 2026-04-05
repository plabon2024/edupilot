'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { RegisterInput, registerSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Brain, Eye, EyeOff, Lock, Mail, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function RegisterPage() {
  const { register: authRegister, isLoading, error: authError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const { confirmPassword: _, ...submitData } = data;
      await authRegister(submitData);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || isLoading;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — decorative panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 items-center justify-center overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="relative z-10 text-center px-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Start for Free</h2>
          <p className="text-white/80 text-lg font-medium max-w-xs mx-auto leading-relaxed">
            Join 10,000+ students who are already learning smarter with AI-powered study tools.
          </p>
          <ul className="mt-10 space-y-4 text-left max-w-xs mx-auto">
            {[
              'AI Flashcard generation from PDFs',
              'Adaptive quizzes that match your level',
              'Private AI tutor for every document',
              'No credit card required to start',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </span>
                <span className="text-white/90 text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">EduPilot AI</span>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 text-violet-600 dark:text-violet-400 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
              <Sparkles className="w-3 h-3" />
              Free forever — no card needed
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Create your account</h1>
            <p className="mt-2 text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-violet-600 hover:text-violet-500 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {(errorMessage || authError) && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {errorMessage || authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  autoComplete="name"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                    errors.name ? 'border-red-400 focus:ring-red-400/50' : 'border-border hover:border-muted-foreground/50'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                    errors.email ? 'border-red-400 focus:ring-red-400/50' : 'border-border hover:border-muted-foreground/50'
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                    errors.password ? 'border-red-400 focus:ring-red-400/50' : 'border-border hover:border-muted-foreground/50'
                  }`}
                  placeholder="Min. 8 chars, upper, lower, number, symbol"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                    errors.confirmPassword ? 'border-red-400 focus:ring-red-400/50' : 'border-border hover:border-muted-foreground/50'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isDisabled}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.01] disabled:opacity-60 disabled:scale-100 mt-2"
            >
              {isDisabled ? 'Creating Account…' : 'Create Free Account'}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            By signing up, you agree to our{' '}
            <span className="underline cursor-pointer hover:text-foreground transition-colors">Terms of Service</span>
            {' '}and{' '}
            <span className="underline cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
