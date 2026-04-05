'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Crown,
  Key,
  LogOut,
  Mail,
  Shield,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const isAdmin = user.role === 'ADMIN';
  const dashboardHref = isAdmin ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* Back nav */}
        <Link
          href={dashboardHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-6">My Profile</h1>

        {/* Hero card — avatar + name */}
        <div className="relative rounded-2xl border border-border bg-card overflow-hidden mb-4">
          {/* Gradient band */}
          <div className="h-20 sm:h-24 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600" />

          <div className="px-4 sm:px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-10 sm:-mt-12 mb-4 flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-background bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-xl overflow-hidden flex-shrink-0">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {/* Badges alongside avatar bottom */}
              <div className="pb-1 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  isAdmin
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                }`}>
                  <Shield className="w-3 h-3" />
                  {isAdmin ? 'Admin' : 'User'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
                {user.status && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    user.status === 'ACTIVE'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                  }`}>
                    {user.status}
                  </span>
                )}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{user.name}</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Email */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Mail className="w-3.5 h-3.5" /> Email
            </p>
            <p className="text-sm font-medium text-foreground break-all">{user.email}</p>
          </div>

          {/* Member since */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" /> Member Since
            </p>
            <p className="text-sm font-medium text-foreground">{formatDate(user.createdAt)}</p>
          </div>

          {/* User ID */}
          <div className="rounded-xl border border-border bg-card p-4 sm:col-span-2">
            <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <User className="w-3.5 h-3.5" /> User ID
            </p>
            <p className="text-xs font-mono text-foreground break-all">{user.id}</p>
          </div>
        </div>

        {/* Subscription card */}
        {user.isSubscribed && (
          <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 p-4 mb-4">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-violet-700 dark:text-violet-300 text-sm">Pro Scholar — Active</p>
                {user.subscriptionEndsAt && (
                  <p className="text-xs text-violet-600/80 dark:text-violet-400/80 mt-0.5">
                    Renews {formatDate(user.subscriptionEndsAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Password change required banner */}
        {user.needPasswordChange && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 mb-4">
            <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">Password Change Required</p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 mb-3">
              For security reasons, please update your password before continuing.
            </p>
            <Link href="/change-password">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs h-8">
                Change Password Now
              </Button>
            </Link>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/change-password" className="flex-1">
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl font-semibold gap-2 hover:bg-muted/60 transition-all"
            >
              <Key className="w-4 h-4" />
              Change Password
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="flex-1 h-11 rounded-xl font-semibold gap-2 transition-all hover:scale-[1.01]"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
