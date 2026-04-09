'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import ThemeToggle from '@/components/ui/theme-toggle';
import { useAuth } from '@/hooks/useAuth';
import {
    BarChart3,
    Brain,
    ChevronDown,
    CreditCard,
    FileText,
    Layers,
    LayoutDashboard,
    LogOut,
    Menu,
    ShieldCheck,
    Sparkles,
    User,
    Users,
    Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

// ── Nav definitions ────────────────────────────────────────────────────────────
const USER_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/flashcards', label: 'Flashcards', icon: Layers },
  { href: '/quizzes', label: 'Quizzes', icon: Brain },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/payment', label: 'Billing', icon: CreditCard },
];

const ADMIN_NAV: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/documents', label: 'Documents', icon: FileText },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

const PUBLIC_NAV: NavItem[] = [
  { href: '/', label: 'Home', icon: Zap },
  { href: '/pricing', label: 'Pricing', icon: Sparkles },
];

// ── NavLink ────────────────────────────────────────────────────────────────────
function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: NavItem & { active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex items-center gap-1.5 text-sm font-medium px-0.5 py-1 transition-colors duration-200
        after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:rounded-full
        after:transition-all after:duration-300
        ${active
          ? 'text-violet-600 dark:text-violet-400 after:w-full after:bg-violet-500'
          : 'text-muted-foreground hover:text-foreground after:w-0 hover:after:w-full after:bg-violet-400'
        }`}
    >
      <Icon className='w-3.5 h-3.5 flex-shrink-0' />
      {label}
    </Link>
  );
}

// ── MobileNavLink ──────────────────────────────────────────────────────────────
function MobileNavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: NavItem & { active: boolean; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150
        ${active
          ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'
          : 'text-foreground/80 hover:bg-muted hover:text-foreground'
        }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-violet-500' : 'text-muted-foreground'}`} />
      {label}
      {active && <span className='ml-auto w-1.5 h-1.5 rounded-full bg-violet-500' />}
    </Link>
  );
}

// ── Logo ───────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link href='/' className='flex items-center gap-2 group flex-shrink-0'>
      <div className='relative w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 group-hover:scale-105 transition-all duration-300'>
        <Brain className='w-4 h-4 text-white' />
        <div className='absolute inset-0 rounded-xl ring-1 ring-white/20' />
      </div>
      <span className='font-extrabold text-lg tracking-tight'>
        EduPilot<span className='text-violet-600 dark:text-violet-400'>AI</span>
      </span>
    </Link>
  );
}

// ── Main Navbar ────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setSheetOpen(false);
  };

  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAuthenticated ? (isAdmin ? ADMIN_NAV : USER_NAV) : PUBLIC_NAV;

  // User initials for avatar
  const initials = user?.name
    ? user.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
    : 'U';

  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'py-2.5 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm'
          : 'py-4 bg-transparent'
        }`}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between gap-4'>
          {/* Logo */}
          <Logo />

          {/* ── Desktop Nav ── */}
          <nav className='hidden md:flex items-center gap-6' aria-label='Main navigation'>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/')
                }
              />
            ))}
          </nav>

          {/* ── Desktop Right ── */}
          <div className='hidden md:flex items-center gap-3'>
            <ThemeToggle />
            {isLoading ? (
              <div className='w-8 h-8 rounded-full bg-muted animate-pulse' />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className='flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-full border border-border/50 bg-background/50 hover:bg-muted hover:border-violet-500/40 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer'
                    aria-label='Open user menu'
                  >
                    <Avatar className='w-7 h-7'>
                      <AvatarFallback className='bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs font-bold'>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className='text-sm font-medium text-foreground leading-none'>
                      {firstName}
                    </span>
                    <ChevronDown className='w-3.5 h-3.5 text-muted-foreground' />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align='end' className='w-56 mt-2' sideOffset={8}>
                  {/* User info */}
                  <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col gap-0.5'>
                      <p className='text-sm font-semibold text-foreground'>{user?.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {isAdmin ? 'Administrator' : 'Student'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href='/profile' className='flex items-center gap-2 cursor-pointer'>
                      <User className='w-4 h-4' />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  {!isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href='/payment' className='flex items-center gap-2 cursor-pointer'>
                        <CreditCard className='w-4 h-4' />
                        Billing
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href='/admin/dashboard' className='flex items-center gap-2 cursor-pointer'>
                        <ShieldCheck className='w-4 h-4' />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className='text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer'
                  >
                    <LogOut className='w-4 h-4 mr-2' />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className='flex items-center gap-3'>
                <Link
                  href='/login'
                  className='text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200'
                >
                  Log In
                </Link>
                <Link href='/register'>
                  <Button className='relative group overflow-hidden rounded-full px-5 h-9 bg-foreground text-background hover:bg-foreground/90 font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25'>
                    <span className='relative z-10 flex items-center gap-1.5'>
                      Get Started <Sparkles className='w-3.5 h-3.5' />
                    </span>
                    <div className='absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full' />
                    <span className='absolute inset-0 z-10 flex items-center justify-center gap-1.5 font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm'>
                      Get Started <Sparkles className='w-3.5 h-3.5' />
                    </span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                className='md:hidden p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
                aria-label='Open navigation menu'
              >
                <Menu className='w-5 h-5' />
              </button>
            </SheetTrigger>

            <SheetContent side='right' className='w-[300px] sm:w-[340px] p-0 flex flex-col'>
              {/* Sheet header */}
              <SheetHeader className='px-5 pt-5 pb-4 border-b border-border/50'>
                <SheetTitle asChild>
                  <Logo />
                </SheetTitle>
              </SheetHeader>

              <div className='flex-1 overflow-y-auto px-3 py-4 space-y-1'>
                {/* Nav links */}
                {navItems.map((item) => (
                  <MobileNavLink
                    key={item.href}
                    {...item}
                    active={
                      item.href === '/'
                        ? pathname === '/'
                        : pathname === item.href || pathname.startsWith(item.href + '/')
                    }
                    onClick={() => setSheetOpen(false)}
                  />
                ))}
              </div>

              {/* Bottom auth section */}
              <div className='border-t border-border/50 px-5 py-5 space-y-3'>
                <div className='flex justify-center'>
                  <ThemeToggle className='w-full justify-center' />
                </div>
                {isLoading ? (
                  <div className='h-14 rounded-xl bg-muted animate-pulse' />
                ) : isAuthenticated ? (
                  <>
                    {/* User info card */}
                    <div className='flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/50 border border-border/40'>
                      <Avatar className='w-10 h-10 flex-shrink-0'>
                        <AvatarFallback className='bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-sm font-bold'>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0'>
                        <p className='text-sm font-semibold truncate'>{user?.name}</p>
                        <p className='text-xs text-muted-foreground capitalize'>
                          {isAdmin ? 'Administrator' : 'Student'}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className='grid grid-cols-2 gap-2'>
                      <Link
                        href='/profile'
                        onClick={() => setSheetOpen(false)}
                      >
                        <Button variant='outline' size='sm' className='w-full gap-2'>
                          <User className='w-3.5 h-3.5' />
                          Profile
                        </Button>
                      </Link>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={handleLogout}
                        className='w-full gap-2'
                      >
                        <LogOut className='w-3.5 h-3.5' />
                        Log Out
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className='grid grid-cols-1 gap-2.5'>
                    <Link href='/login' onClick={() => setSheetOpen(false)}>
                      <Button variant='outline' className='w-full h-11 font-semibold'>
                        Log In
                      </Button>
                    </Link>
                    <Link href='/register' onClick={() => setSheetOpen(false)}>
                      <Button className='w-full h-11 font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all duration-200'>
                        <Sparkles className='w-4 h-4 mr-2' />
                        Get Started Free
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
