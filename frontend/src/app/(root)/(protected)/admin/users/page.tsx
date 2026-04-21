'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { adminAPI } from '@/services/admin.services';
import { AdminUser, PaginatedResponse, SubscriptionPlan } from '@/types/admin.types';
import {
  ShieldAlert, ShieldCheck, UserCog, Ghost, Search, Filter,
  Trash2, X, ChevronDown, RefreshCw, Eye, CreditCard,
  ChevronLeft, ChevronRight, Mail, CalendarDays,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
type StatusFilter     = '' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
type SubscribedFilter = '' | 'true' | 'false';

// ── Badges ────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE:    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    INACTIVE:  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    SUSPENDED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
      role === 'ADMIN'
        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }`}>
      {role}
    </span>
  );
}

// ── Mobile User Card ──────────────────────────────────────────────────────────
function MobileUserCard({
  user,
  onStatusChange,
}: {
  user: AdminUser;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  return (
    <div className="p-4 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        {/* Avatar + name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </p>
          </div>
        </div>
        {/* Badges */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <StatusBadge status={user.status} />
          <RoleBadge role={user.role} />
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CreditCard className="w-3 h-3" />{user.isSubscribed ? 'Subscribed' : 'Free'}
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays className="w-3 h-3" />
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" asChild>
          <Link href={`/admin/users/${user.id}`}>
            <Eye className="w-3.5 h-3.5 mr-1" /> View
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`flex-1 h-8 text-xs ${
            user.status === 'ACTIVE'
              ? 'border-red-400/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
              : 'border-green-400/60 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30'
          }`}
          onClick={() => onStatusChange(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
        >
          {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
        </Button>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function UserDetailModal({
  user,
  onClose,
  onStatusChange,
  onRoleChange,
  onSubscriptionToggle,
  onDelete,
}: {
  user: AdminUser;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
  onRoleChange: (id: string, role: string) => Promise<void>;
  onSubscriptionToggle: (id: string, isSubscribed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const wrap = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full sm:max-w-lg bg-background border border-border/60 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5 break-all">{user.id}</p>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Role',         <RoleBadge key="r" role={user.role} />],
            ['Status',       <StatusBadge key="s" status={user.status} />],
            ['Subscribed',   <span key="p" className="font-semibold">{user.isSubscribed ? '✅ Yes' : '❌ No'}</span>],
            ['Ends At',      <span key="p2" className="font-semibold text-xs">{user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt).toLocaleDateString() : 'N/A'}</span>],
            ['Email Verify', <span key="e">{user.isEmailVerified ? '✅ Verified' : '❌ Not verified'}</span>],
            ['Joined',       <span key="j">{new Date(user.createdAt).toLocaleDateString()}</span>],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30">
              <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wide">{label}</span>
              {value}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2 border-t border-border/40">
          {/* Subscription */}
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium flex-1">Subscription</span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              disabled={loading}
              onClick={() => wrap(() => onSubscriptionToggle(user.id, !user.isSubscribed))}
            >
              {user.isSubscribed ? 'Cancel Subscription' : 'Activate Subscription'}
            </Button>
          </div>

          {/* Role + Status */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8"
              disabled={loading}
              onClick={() => wrap(() => onRoleChange(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN'))}
            >
              {user.role === 'ADMIN' ? <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> : <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />}
              {user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`flex-1 text-xs h-8 ${user.status === 'ACTIVE' ? 'border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30' : 'border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30'}`}
              disabled={loading}
              onClick={() => wrap(() => onStatusChange(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'))}
            >
              {user.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
            </Button>
          </div>

          {/* Delete */}
          <Button
            variant="destructive"
            size="sm"
            className="w-full text-xs h-8"
            disabled={loading}
            onClick={() => {
              if (!window.confirm(`Permanently delete ${user.name}? This is a soft delete.`)) return;
              wrap(() => onDelete(user.id));
              onClose();
            }}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete User
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({
  meta,
  page,
  isLoading,
  onPrev,
  onNext,
}: {
  meta: { page: number; totalPages: number; total: number };
  page: number;
  isLoading: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="p-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground order-2 sm:order-1">
        Page <span className="font-semibold">{meta.page}</span> of {meta.totalPages}
        {' '}· {meta.total} users
      </div>
      <div className="flex gap-2 order-1 sm:order-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={page === 1 || isLoading} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page === meta.totalPages || isLoading} className="gap-1">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users,     setUsers]     = useState<AdminUser[]>([]);
  const [meta,      setMeta]      = useState<PaginatedResponse<AdminUser>['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page,      setPage]      = useState(1);

  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState<StatusFilter>('');
  const [subscribed, setSubscribed] = useState<SubscribedFilter>('');
  const [selected,   setSelected]   = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getUsers({
        page: p, limit: 10,
        ...(search     ? { search }     : {}),
        ...(status     ? { status }     : {}),
        ...(subscribed ? { subscribed: subscribed === 'true' } : {}),
      });
      const payload = res.data?.data;
      if (Array.isArray(payload)) {
        setUsers(payload);
        setMeta(null);
      } else {
        setUsers(Array.isArray(payload?.data) ? payload.data : []);
        setMeta(payload?.meta ?? null);
      }
    } catch (err) {
      console.error('Failed to load users', err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, status, subscribed]);

  useEffect(() => { fetchUsers(page); }, [page, fetchUsers]);

  const applyFilters = () => { setPage(1); fetchUsers(1); };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    await adminAPI.updateUserStatus(userId, newStatus);
    setUsers(u => u.map(x => x.id === userId ? { ...x, status: newStatus } : x));
    if (selected?.id === userId) setSelected(s => s ? { ...s, status: newStatus } : s);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await adminAPI.updateUserRole(userId, newRole);
    setUsers(u => u.map(x => x.id === userId ? { ...x, role: newRole } : x));
    if (selected?.id === userId) setSelected(s => s ? { ...s, role: newRole } : s);
  };

  const handleSubscriptionToggle = async (userId: string, isSubscribed: boolean) => {
    await adminAPI.updateUserSubscription(userId, { isSubscribed });
    setUsers(u => u.map(x => x.id === userId ? { ...x, isSubscribed } : x));
    if (selected?.id === userId) setSelected(s => s ? { ...s, isSubscribed } : s);
  };

  const handleDelete = async (userId: string) => {
    await adminAPI.deleteUser(userId);
    setUsers(u => u.filter(x => x.id !== userId));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View, filter, and manage all registered platform users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UserCog className="w-8 h-8 text-indigo-500 opacity-40" />
          {meta && (
            <span className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{meta.total}</span> total users
            </span>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            {/* Search — full width on mobile */}
            <div className="w-full sm:flex-1 sm:min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="user-search"
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Status filter */}
              <div className="relative flex-1 sm:flex-none">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <select
                  id="user-status-filter"
                  value={status}
                  onChange={e => setStatus(e.target.value as StatusFilter)}
                  className="w-full pl-8 pr-7 py-2 text-sm bg-muted/50 border border-border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {/* Plan filter */}
              <div className="relative flex-1 sm:flex-none">
                <select
                  id="user-subscription-filter"
                  value={subscribed}
                  onChange={e => setSubscribed(e.target.value as SubscribedFilter)}
                  className="w-full px-3 pr-7 py-2 text-sm bg-muted/50 border border-border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">All Plans</option>
                  <option value="true">Subscribed</option>
                  <option value="false">Free</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {/* Buttons */}
              <Button size="sm" onClick={applyFilters} className="bg-violet-600 hover:bg-violet-700 text-white h-9 flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 mr-1.5" /> Search
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setSearch(''); setStatus(''); setSubscribed(''); setPage(1); fetchUsers(1); }}
                className="h-9 flex-1 sm:flex-none"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Table / Card List ── */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading && (!users || users.length === 0) ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-b-2 border-violet-600 animate-spin" />
            </div>
          ) : (!users || users.length === 0) ? (
            <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
              <Ghost className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">No users match your criteria.</p>
            </div>
          ) : (
            <>
              {/* ── Mobile card list (xs only) ── */}
              <div className="sm:hidden divide-y divide-border/50">
                {users.map(user => (
                  <MobileUserCard
                    key={user.id}
                    user={user}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>

              {/* ── Desktop table (sm+) ── */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Plan</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                        <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                        <td className="px-6 py-4 font-medium text-xs">{user.isSubscribed ? 'Subscribed' : 'Free'}</td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                              <Link href={`/admin/users/${user.id}`}>
                                <Eye className="w-3.5 h-3.5 mr-1" /> View/Manage
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-8 text-xs ${
                                user.status === 'ACTIVE'
                                  ? 'border-red-400/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                                  : 'border-green-400/60 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30'
                              }`}
                              onClick={() => handleStatusChange(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                            >
                              {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <Pagination
              meta={meta}
              page={page}
              isLoading={isLoading}
              onPrev={() => setPage(p => Math.max(1, p - 1))}
              onNext={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            />
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selected && (
        <UserDetailModal
          user={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onRoleChange={handleRoleChange}
          onSubscriptionToggle={handleSubscriptionToggle}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
