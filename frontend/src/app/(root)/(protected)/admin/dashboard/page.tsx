'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI } from '@/services/admin.services';
import { AdminDashboardStats } from '@/types/admin.types';
import {
  Users, CreditCard, FileText, CheckCircle, Database,
  TrendingUp, BarChart3, UserCog, FolderOpen, ArrowRight,
  Activity, ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  title, value, icon, trend,
}: { title: string; value: string | number; icon: React.ReactNode; trend?: string }) {
  return (
    <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-xl transition-all hover:scale-[1.02] hover:shadow-violet-500/10">
      <CardContent className="p-5 sm:p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5 sm:space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{title}</p>
            <p className="text-2xl sm:text-3xl font-extrabold tabular-nums">{value}</p>
            {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
          </div>
          <div className="p-2.5 sm:p-3 bg-muted/50 rounded-xl flex-shrink-0">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Quick-nav Card ─────────────────────────────────────────────────────────────
function QuickNavCard({
  href, icon, label, description, accent,
}: { href: string; icon: React.ReactNode; label: string; description: string; accent: string }) {
  return (
    <Link href={href} className="group block">
      <Card className={`border-border/50 bg-background/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border-l-4 ${accent}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-muted/60 rounded-xl group-hover:bg-muted transition-colors">{icon}</div>
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [stats,     setStats]     = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(res => setStats(res.data.data))
      .catch(err => console.error('Failed to fetch admin stats', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-56 bg-muted rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  // Normalise all numeric fields – API may return undefined/null
  const totalUsers   = Number(stats.totalUsers)   || 0;
  const activeUsers  = Number(stats.activeUsers)  || 0;
  const totalRevenue = Number(stats.totalRevenue) || 0;
  const monthlyRevenue = Number(stats.monthlyRevenue) || 0;
  const totalDocuments = Number(stats.totalDocuments) || 0;
  const totalStorageUsed = Number(stats.totalStorageUsed) || 0;
  const storageUsedMB = (totalStorageUsed / (1024 * 1024)).toFixed(2);
  const inactiveUsers = totalUsers - activeUsers;
  const activationRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-[48px] sm:ml-[52px]">
            Monitor your platform&apos;s overall performance and user base.
          </p>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/40 border border-border/50 px-3 py-2 rounded-lg flex items-center gap-1.5 flex-shrink-0 self-start">
          <Activity className="w-3.5 h-3.5 text-green-500" />
          Live data
        </div>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon={<Users className="w-5 h-5 text-blue-500" />}
        />
        <StatCard
          title="Active Users"
          value={activeUsers.toLocaleString()}
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          trend={`${totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(0) : 0}% of total users`}
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={<CreditCard className="w-5 h-5 text-purple-500" />}
          trend={`$${monthlyRevenue.toFixed(2)} this month`}
        />
        <StatCard
          title="Total Documents"
          value={totalDocuments.toLocaleString()}
          icon={<FileText className="w-5 h-5 text-orange-500" />}
          trend={`${storageUsedMB} MB used`}
        />
      </div>

      {/* ── System Overview + Recent Users ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-5 h-5 text-violet-500" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Monthly Revenue',    value: `$${monthlyRevenue.toFixed(2)}`,     valueClass: 'text-green-500 font-bold' },
              { label: 'Total Storage Used', value: `${storageUsedMB} MB`,               valueClass: 'font-bold' },
              { label: 'Inactive Users',     value: String(inactiveUsers),               valueClass: 'font-bold text-orange-500' },
              { label: 'Activation Rate',    value: `${activationRate}%`,                valueClass: 'font-bold text-blue-500' },
            ].map(({ label, value, valueClass }) => (
              <div key={label} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span className={`text-sm ${valueClass}`}>{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentUsers && stats.recentUsers.length > 0 ? (
              <div className="space-y-2.5">
                {stats.recentUsers.slice(0, 5).map(user => (
                  <div key={user.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30 text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold leading-tight">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      user.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-6">No recent users found.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Navigation ── */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-foreground">Quick Navigation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickNavCard
            href="/admin/users"
            icon={<UserCog className="w-5 h-5 text-violet-500" />}
            label="User Management"
            description="Browse, filter & manage users"
            accent="border-l-violet-500"
          />
          <QuickNavCard
            href="/admin/payments"
            icon={<CreditCard className="w-5 h-5 text-green-500" />}
            label="Payments"
            description="Review & refund transactions"
            accent="border-l-green-500"
          />
          <QuickNavCard
            href="/admin/documents"
            icon={<FolderOpen className="w-5 h-5 text-indigo-500" />}
            label="Documents"
            description="Monitor user uploads"
            accent="border-l-indigo-500"
          />
          <QuickNavCard
            href="/admin/analytics"
            icon={<BarChart3 className="w-5 h-5 text-blue-500" />}
            label="Analytics"
            description="Growth, revenue & usage charts"
            accent="border-l-blue-500"
          />
        </div>
      </div>

    </div>
  );
}
