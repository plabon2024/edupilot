'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Brain, LogOut, Menu, User, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener for dynamic navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return "/dashboard";
    return user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
  };

  // Nav link styles
  const navLinkClasses = "relative text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-300 " + 
                         "after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:origin-bottom-right " + 
                         "after:scale-x-0 after:bg-gradient-to-r after:from-violet-500 after:to-indigo-500 after:transition-transform " + 
                         "after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "py-3 bg-background/70 backdrop-blur-xl border-b border-white/10 dark:border-white/5 shadow-sm" 
        : "py-5 bg-transparent border-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 group-hover:scale-105 transition-all duration-300">
              <Brain className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-xl ring-1 ring-white/20"></div>
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:to-foreground transition-colors duration-300">
              EduPilot<span className="text-violet-600 dark:text-violet-400">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className={navLinkClasses}>Features</a>
              <a href="#how-it-works" className={navLinkClasses}>How It Works</a>
              <a href="#pricing" className={navLinkClasses}>Pricing</a>
              <a href="#faq" className={navLinkClasses}>FAQ</a>
            </nav>
          )}

          {/* Authenticated Nav */}
          {isAuthenticated && !isLoading && (
            <nav className="hidden md:flex items-center gap-6">
              <Link href={getDashboardLink()} className={navLinkClasses}>
                Dashboard
              </Link>
              {user?.role !== "ADMIN" ? (
                <>
                  <Link href="/documents" className={navLinkClasses}>
                    Documents
                  </Link>
                  <Link href="/flashcards" className={navLinkClasses}>
                    Flashcards
                  </Link>
                  <Link href="/quizzes" className={navLinkClasses}>
                    Quizzes
                  </Link>
                  <Link href="/progress" className={navLinkClasses}>
                    Progress
                  </Link>
                  <Link href="/payment" className={navLinkClasses}>
                    Billing
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/admin/users" className={navLinkClasses}>
                    Users
                  </Link>
                  <Link href="/admin/documents" className={navLinkClasses}>
                    Documents
                  </Link>
                  <Link href="/admin/payments" className={navLinkClasses}>
                    Payments
                  </Link>
                  <Link href="/admin/analytics" className={navLinkClasses}>
                    Analytics
                  </Link>
                </>
              )}
              <Link href="/pricing" className={navLinkClasses}>
                Pricing
              </Link>
            </nav>
          )}

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3 relative">
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="group flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border border-border/50 bg-background/50 hover:bg-muted/80 hover:border-violet-500/30 transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium leading-tight text-foreground">{user?.name?.split(' ')[0]}</span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-border bg-muted/30">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                          {user?.role === "ADMIN" ? "Administrator" : "Student user"}
                        </p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          View Profile
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors text-left mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-300">
                  Log In
                </Link>
                <Link href="/register">
                  <Button className="relative group overflow-hidden bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-foreground/20">
                    <span className="relative z-10 flex items-center gap-2 font-bold">
                      Let&apos;s Go <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute z-10 flex items-center gap-2 font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Let&apos;s Go <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors active:scale-95"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-6 pt-2 border-t border-border animate-in slide-in-from-top-4 duration-300">
            {!isAuthenticated && (
              <nav className="flex flex-col gap-1 py-2">
                {['Features', 'How It Works', 'Pricing', 'FAQ'].map((item) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="px-4 py-3 text-base font-medium rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </nav>
            )}

            {isAuthenticated && !isLoading && (
              <nav className="flex flex-col gap-1 py-2">
                <Link
                  href={getDashboardLink()}
                  className="px-4 py-3 text-base font-medium rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {user?.role !== "ADMIN" ? (
                  <>
                    <Link
                      href="/documents"
                      className="px-4 py-3 text-base font-medium rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Documents
                    </Link>
                    <Link
                      href="/flashcards"
                      className="px-4 py-3 text-base font-medium rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Flashcards
                    </Link>
                    <Link
                      href="/quizzes"
                      className="px-4 py-3 text-base font-medium rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Quizzes
                    </Link>
                    <Link
                      href="/progress"
                      className="px-4 py-3 text-base font-medium rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Progress
                    </Link>
                    <Link
                      href="/payment"
                      className="px-4 py-3 text-base font-medium rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Billing
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/admin/users"
                      className="px-4 py-3 text-base font-medium rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Users
                    </Link>
                    <Link
                      href="/admin/documents"
                      className="px-4 py-3 text-base font-medium rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Documents
                    </Link>
                    <Link
                      href="/admin/payments"
                      className="px-4 py-3 text-base font-medium rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Payments
                    </Link>
                    <Link
                      href="/admin/analytics"
                      className="px-4 py-3 text-base font-medium rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Analytics
                    </Link>
                  </>
                )}
                <Link
                  href="/pricing"
                  className="px-4 py-3 text-base font-medium rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
              </nav>
            )}

            {/* Mobile CTAs */}
            <div className="flex flex-col gap-3 px-4 mt-4">
              {isLoading ? (
                <div className="w-full h-12 rounded-xl bg-muted animate-pulse" />
              ) : isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{user?.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {user?.role === "ADMIN" ? "Administrator" : "Student user"}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block"
                    >
                      <Button variant="outline" className="w-full h-11 rounded-xl">
                        <User className="w-4 h-4 mr-2" /> Profile
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                      className="w-full h-11 rounded-xl"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Log Out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full h-12 rounded-xl text-base font-semibold">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button className="w-full h-12 rounded-xl text-base font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
