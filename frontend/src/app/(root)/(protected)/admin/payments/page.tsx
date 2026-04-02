'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { adminAPI, PaymentQueryParams } from '@/services/admin.services';
import { AdminPayment } from '@/types/admin.types';
import {
  CreditCard, Banknote, History, Search, Filter, ChevronDown,
  RefreshCw, X, Eye, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

// ── Status Badge ──────────────────────────────────────────────────────────────
function PaymentStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    SUCCEEDED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    FAILED:    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    REFUNDED:  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    PENDING:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function PaymentDetailModal({
  payment,
  onClose,
  onRefund,
}: {
  payment: AdminPayment;
  onClose: () => void;
  onRefund: (id: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const handleRefund = async () => {
    if (!window.confirm('Mark this payment as REFUNDED?')) return;
    setLoading(true);
    try { await onRefund(payment.id); onClose(); }
    finally { setLoading(false); }
  };

  const field = (label: string, value: React.ReactNode) => (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30">
      <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wide">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-background border border-border/60 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Payment Detail</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5 break-all">
              {payment.transactionId || payment.stripeSessionId || payment.id}
            </p>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          {field('Status',       <PaymentStatusBadge status={payment.status} />)}
          {field('Amount',       <span className="text-green-600 font-bold">${(payment.amount || 0).toFixed(2)} {payment.currency || 'USD'}</span>)}
          {field('Plan',         payment.subscriptionPlan || 'Custom')}
          {field('User ID',      <span className="font-mono text-xs break-all">{payment.userId}</span>)}
          {field('Session ID',   <span className="font-mono text-xs break-all truncate">{payment.stripeSessionId || '—'}</span>)}
          {field('Date',         new Date(payment.createdAt).toLocaleString())}
        </div>

        {/* Action */}
        {(payment.status === 'SUCCEEDED' || payment.status === 'COMPLETED') && (
          <div className="pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-xs border-orange-400/60 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
              disabled={loading}
              onClick={handleRefund}
            >
              <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
              Mark as Refunded
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPaymentsPage() {
  const [payments,  setPayments]  = useState<AdminPayment[]>([]);
  const [meta,      setMeta]      = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page,      setPage]      = useState(1);
  const [selected,  setSelected]  = useState<AdminPayment | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [sort,         setSort]         = useState('createdAt:desc');

  const buildParams = useCallback((): PaymentQueryParams => ({
    page,
    limit: 10,
    sort,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(userIdFilter ? { userId: userIdFilter } : {}),
    ...(dateFrom     ? { dateFrom }             : {}),
    ...(dateTo       ? { dateTo }               : {}),
  }), [page, sort, statusFilter, userIdFilter, dateFrom, dateTo]);

  const fetchPayments = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getPayments({ ...buildParams(), page: p });
      setPayments(res.data.data.data);
      setMeta(res.data.data.meta);
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  useEffect(() => { fetchPayments(page); }, [page, fetchPayments]);

  const applyFilters = () => { setPage(1); fetchPayments(1); };
  const resetFilters = () => {
    setStatusFilter(''); setUserIdFilter(''); setDateFrom(''); setDateTo('');
    setSort('createdAt:desc'); setPage(1); fetchPayments(1);
  };

  const handleRefund = async (paymentId: string) => {
    await adminAPI.updatePaymentStatus(paymentId, 'REFUNDED');
    setPayments(ps => ps.map(p => p.id === paymentId ? { ...p, status: 'REFUNDED' } : p));
    if (selected?.id === paymentId) setSelected(s => s ? { ...s, status: 'REFUNDED' } : s);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            Revenue & Payments
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor, filter, and manage all subscription transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Banknote className="w-8 h-8 text-green-500 opacity-40" />
          {meta && (
            <span className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{meta.total}</span> transactions
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-lg">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Status */}
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <select
                id="payment-status-filter"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="pl-8 pr-7 py-2 text-sm bg-muted/50 border border-border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Statuses</option>
                <option value="SUCCEEDED">Succeeded</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                id="payment-sort"
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="px-3 pr-7 py-2 text-sm bg-muted/50 border border-border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="createdAt:desc">Newest first</option>
                <option value="createdAt:asc">Oldest first</option>
                <option value="amount:desc">Highest amount</option>
                <option value="amount:asc">Lowest amount</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>

            {/* User ID */}
            <div className="flex-1 min-w-[180px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="payment-user-id"
                type="text"
                placeholder="Filter by User ID…"
                value={userIdFilter}
                onChange={e => setUserIdFilter(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <input
                id="payment-date-from"
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="py-2 px-3 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-muted-foreground text-sm">→</span>
              <input
                id="payment-date-to"
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="py-2 px-3 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Buttons */}
            <Button size="sm" onClick={applyFilters} className="bg-green-600 hover:bg-green-700 text-white h-9">
              <Search className="w-3.5 h-3.5 mr-1.5" /> Filter
            </Button>
            <Button size="sm" variant="outline" onClick={resetFilters} className="h-9">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading && (!payments || payments.length === 0) ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-b-2 border-green-600 animate-spin" />
            </div>
          ) : (!payments || payments.length === 0) ? (
            <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
              <History className="w-12 h-12 mb-4 opacity-50 text-green-500" />
              <p className="font-medium">No transactions match your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="font-mono text-xs max-w-[130px] truncate" title={payment.transactionId || payment.stripeSessionId}>
                            {payment.transactionId || payment.stripeSessionId || `${payment.id.substring(0, 12)}…`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {payment.user ? (
                          <div>
                            <div className="font-medium">{payment.user.name}</div>
                            <div className="text-xs text-muted-foreground">{payment.user.email}</div>
                          </div>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px] block" title={payment.userId}>
                            {payment.userId}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-green-600">
                        ${(payment.amount || 0).toFixed(2)} {payment.currency || 'USD'}
                      </td>
                      <td className="px-6 py-4"><PaymentStatusBadge status={payment.status} /></td>
                      <td className="px-6 py-4 text-xs font-medium">{payment.subscriptionPlan || 'Custom'}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2"
                            asChild
                          >
                            <Link href={`/admin/payments/${payment.id}`}>
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </Link>
                          </Button>
                          {(payment.status === 'SUCCEEDED' || payment.status === 'COMPLETED') && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2 border-orange-400/60 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                              onClick={() => handleRefund(payment.id)}
                            >
                              Refund
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="p-4 border-t border-border/50 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page <span className="font-semibold">{meta.page}</span> of {meta.totalPages}
                {' '}· {meta.total} transactions
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
                  Previous
                </Button>
                <Button variant="outline" onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages || isLoading}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selected && (
        <PaymentDetailModal
          payment={selected}
          onClose={() => setSelected(null)}
          onRefund={handleRefund}
        />
      )}
    </div>
  );
}
