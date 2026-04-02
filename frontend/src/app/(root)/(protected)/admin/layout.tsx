'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/users',      label: 'Users',       icon: Users },
  { href: '/admin/payments',   label: 'Payments',    icon: CreditCard },
  { href: '/admin/documents',  label: 'Documents',   icon: FileText },
  { href: '/admin/analytics',  label: 'Analytics',   icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [collapsed, setCollapsed]       = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated)       router.push('/login');
      else if (user?.role !== 'ADMIN') router.replace('/dashboard');
      else setIsAuthorized(true);
    }
  }, [user, isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-b-2 border-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen pt-16 bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 flex flex-col border-r border-border/50
          bg-background/80 backdrop-blur-xl transition-all duration-300
          ${collapsed ? 'w-16' : 'w-56'}`}
      >
        {/* Brand */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-border/40 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Panel
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${collapsed ? 'justify-center' : ''}
                  ${active
                    ? 'bg-violet-600/15 text-violet-600 dark:text-violet-400'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-violet-600 dark:text-violet-400' : ''}`} />
                {!collapsed && <span>{label}</span>}
                {!collapsed && active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center justify-center mx-auto mb-4 w-8 h-8 rounded-full border border-border bg-muted hover:bg-muted/80 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-56'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
