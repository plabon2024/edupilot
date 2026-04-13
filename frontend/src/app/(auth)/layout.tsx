'use client';

import { getDefaultDashboardRoute } from '@/config/authRoutes';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(getDefaultDashboardRoute(user?.role));
    }
  }, [user, isAuthenticated, isLoading, router]);

  return <>{children}</>;
}
