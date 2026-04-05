'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Menu,
  Brain,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users',     label: 'Users',     icon: Users },
  { href: '/admin/payments',  label: 'Payments',  icon: CreditCard },
  { href: '/admin/documents', label: 'Documents', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
] as const;

// ── Shared NavLink ─────────────────────────────────────────────────────────────

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
        ${collapsed ? 'justify-center' : ''}
        ${
          active
            ? 'bg-violet-600/15 text-violet-600 dark:text-violet-400'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
        }`}
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 ${active ? 'text-violet-600 dark:text-violet-400' : ''}`}
      />
      {!collapsed && <span>{label}</span>}
      {!collapsed && active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600" />
      )}
    </Link>
  );
}

// ── Logo ──────────────────────────────────────────────────────────────────────

function AdminLogo() {
  return (
    <Link href="/admin/dashboard" className="flex items-center gap-2 group">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-all duration-300 flex-shrink-0">
        <Brain className="w-4 h-4 text-white" />
      </div>
      <span className="font-extrabold text-lg tracking-tight leading-none">
        EduPilot<span className="text-violet-600 dark:text-violet-400">AI</span>
      </span>
    </Link>
  );
}

// ── Sidebar content (shared between desktop & mobile drawer) ──────────────────

function SidebarContent({
  pathname,
  collapsed,
  onNavClick,
}: {
  pathname: string;
  collapsed?: boolean;
  onNavClick?: () => void;
}) {
  return (
    <>
      {/* Brand */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-border/40 ${
          collapsed ? 'justify-center' : ''
        }`}
      >
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
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <SidebarLink
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={active}
              collapsed={collapsed}
              onClick={onNavClick}
            />
          );
        })}
      </nav>
    </>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  // Get current page label for mobile topbar
  const currentPage =
    NAV_ITEMS.find(
      ({ href }) => pathname === href || pathname.startsWith(href + '/')
    )?.label ?? 'Admin';

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated)          router.push('/login');
      else if (user?.role !== 'ADMIN') router.replace('/dashboard');
      else                             setIsAuthorized(true);
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

      {/* ── Desktop Sidebar (lg+) ── */}
      <aside
        className={`hidden lg:flex fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 flex-col border-r border-border/50
          bg-background/80 backdrop-blur-xl transition-all duration-300
          ${collapsed ? 'w-16' : 'w-56'}`}
      >
        <SidebarContent pathname={pathname} collapsed={collapsed} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center justify-center mx-auto mb-4 w-8 h-8 rounded-full border border-border bg-muted hover:bg-muted/80 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* ── Mobile Topbar + Drawer (< lg) ── */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 flex items-center gap-3 px-4 h-12 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="p-1.5 rounded-lg hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label="Open admin menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>

          <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
            <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/50">
              <SheetTitle asChild>
                <AdminLogo />
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              <SidebarContent
                pathname={pathname}
                onNavClick={() => setMobileOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-sm text-foreground">{currentPage}</span>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main
        className={`flex-1 transition-all duration-300
          pt-12 lg:pt-0
          ${collapsed ? 'lg:ml-16' : 'lg:ml-56'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
