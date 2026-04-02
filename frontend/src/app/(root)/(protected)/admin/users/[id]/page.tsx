'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI } from '@/services/admin.services';
import { AdminUser, SubscriptionPlan } from '@/types/admin.types';
import {
  ArrowLeft, ShieldAlert, ShieldCheck, Trash2, CreditCard,
  User, Mail, Calendar, BarChart3, CheckCircle, XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}>{children}</span>;
}

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user,      setUser]      = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busy,      setBusy]      = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    adminAPI.getUserById(params.id)
      .then(res => setUser(res.data.data))
      .catch(() => setError('User not found.'))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); }
    catch { setError('Action failed. Please try again.'); }
    finally { setBusy(false); }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-b-2 border-violet-600 animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="font-medium">{error || 'User not found.'}</p>
        <Button variant="outline" onClick={() => router.push('/admin/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
        </Button>
      </div>
    );
  }

  const plans: SubscriptionPlan[] = ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">

      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.push('/admin/users')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to User Management
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{user.name}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">{user.id}</p>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: <User className="w-4 h-4 text-violet-500" />, label: 'Role',
            value: (
              <Badge className={user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}>
                {user.role}
              </Badge>
            )},
          { icon: <CheckCircle className="w-4 h-4 text-green-500" />, label: 'Status',
            value: (
              <Badge className={
                user.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                user.status === 'SUSPENDED' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                'bg-slate-100 text-slate-600'
              }>{user.status}</Badge>
            )},
          { icon: <CreditCard className="w-4 h-4 text-indigo-500" />, label: 'Subscription Plan', value: <span className="font-semibold">{user.subscriptionPlan}</span> },
          { icon: <BarChart3 className="w-4 h-4 text-blue-500" />,   label: 'Credits',            value: <span className="font-semibold">{user.creditBalance ?? 'N/A'}</span> },
          { icon: <Mail className="w-4 h-4 text-orange-500" />,      label: 'Email Verified',     value: user.isEmailVerified ? <span className="text-green-600 font-medium">✅ Yes</span> : <span className="text-red-500 font-medium">❌ No</span> },
          { icon: <Calendar className="w-4 h-4 text-muted-foreground" />, label: 'Joined',        value: new Date(user.createdAt).toLocaleString() },
          { icon: <Calendar className="w-4 h-4 text-muted-foreground" />, label: 'Last Updated',  value: new Date(user.updatedAt).toLocaleString() },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-xl">
            <div className="mt-0.5">{icon}</div>
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wide mb-1">{label}</p>
              <div className="text-sm">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-base">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Change subscription */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <CreditCard className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">Change Subscription Plan</span>
            <select
              defaultValue={user.subscriptionPlan}
              disabled={busy}
              onChange={e => {
                const plan = e.target.value;
                wrap(async () => {
                  await adminAPI.updateUserSubscription(user.id, plan);
                  setUser(u => u ? { ...u, subscriptionPlan: plan } : u);
                });
              }}
              className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {plans.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Role + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline" disabled={busy}
              onClick={() => wrap(async () => {
                const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
                await adminAPI.updateUserRole(user.id, newRole);
                setUser(u => u ? { ...u, role: newRole } : u);
              })}
            >
              {user.role === 'ADMIN'
                ? <><ShieldAlert className="w-4 h-4 mr-2 text-orange-500" /> Demote to User</>
                : <><ShieldCheck className="w-4 h-4 mr-2 text-violet-500" /> Promote to Admin</>}
            </Button>

            <Button
              variant="outline" disabled={busy}
              className={user.status === 'ACTIVE'
                ? 'border-red-400/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                : 'border-green-400/60 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30'}
              onClick={() => wrap(async () => {
                const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                await adminAPI.updateUserStatus(user.id, newStatus);
                setUser(u => u ? { ...u, status: newStatus } : u);
              })}
            >
              {user.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
            </Button>
          </div>

          {/* Delete */}
          <Button
            variant="destructive" className="w-full" disabled={busy}
            onClick={() => {
              if (!window.confirm(`Soft-delete ${user.name}? They won't be able to log in.`)) return;
              wrap(async () => {
                await adminAPI.deleteUser(user.id);
                router.push('/admin/users');
              });
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete User (Soft)
          </Button>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </CardContent>
      </Card>

    </div>
  );
}
