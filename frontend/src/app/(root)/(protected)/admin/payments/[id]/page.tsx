'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI } from '@/services/admin.services';
import { AdminPayment } from '@/types/admin.types';
import {
  ArrowLeft, CreditCard, Calendar, DollarSign,
  User, AlertCircle, XCircle, CheckCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function StatusBadge({ status }: { status: string }) {
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

export default function AdminPaymentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [payment,   setPayment]   = useState<AdminPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busy,      setBusy]      = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    adminAPI.getPaymentById(params.id)
      .then(res => setPayment(res.data.data))
      .catch(() => setError('Payment not found.'))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-b-2 border-green-600 animate-spin" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="font-medium">{error || 'Payment not found.'}</p>
        <Button variant="outline" onClick={() => router.push('/admin/payments')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Payments
        </Button>
      </div>
    );
  }

  const handleRefund = async () => {
    if (!window.confirm('Mark this payment as REFUNDED?')) return;
    setBusy(true);
    try {
      await adminAPI.updatePaymentStatus(payment.id, 'REFUNDED');
      setPayment(p => p ? { ...p, status: 'REFUNDED' } : p);
    } catch {
      setError('Failed to update payment status.');
    } finally {
      setBusy(false);
    }
  };

  const canRefund = payment.status === 'SUCCEEDED' || payment.status === 'COMPLETED';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">

      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/admin/payments')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Payments
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Payment Detail</h1>
            <p className="text-muted-foreground text-xs font-mono mt-0.5 break-all">
              {payment.transactionId || payment.stripeSessionId || payment.id}
            </p>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: <CheckCircle className="w-4 h-4 text-green-500" />, label: 'Status',         value: <StatusBadge status={payment.status} /> },
          { icon: <DollarSign className="w-4 h-4 text-green-500" />,  label: 'Amount',         value: <span className="font-bold text-green-600 text-lg">${(payment.amount || 0).toFixed(2)} {payment.currency || 'USD'}</span> },
          { icon: <CreditCard className="w-4 h-4 text-indigo-500" />, label: 'Plan',           value: <span className="font-semibold">{payment.subscriptionPlan || 'Custom'}</span> },
          { icon: <User className="w-4 h-4 text-violet-500" />,       label: 'User ID',        value: <span className="font-mono text-xs break-all">{payment.userId}</span> },
          { icon: <CreditCard className="w-4 h-4 text-blue-500" />,   label: 'Transaction ID', value: <span className="font-mono text-xs break-all">{payment.transactionId || '—'}</span> },
          { icon: <CreditCard className="w-4 h-4 text-slate-400" />,  label: 'Session ID',     value: <span className="font-mono text-xs break-all">{payment.stripeSessionId || '—'}</span> },
          { icon: <Calendar className="w-4 h-4 text-muted-foreground" />, label: 'Created At', value: new Date(payment.createdAt).toLocaleString() },
          { icon: <Calendar className="w-4 h-4 text-muted-foreground" />, label: 'Updated At', value: new Date(payment.updatedAt).toLocaleString() },
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
      {canRefund && (
        <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full border-orange-400/60 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
              disabled={busy}
              onClick={handleRefund}
            >
              <AlertCircle className="w-4 h-4 mr-2" /> Mark as Refunded
            </Button>
            {error && <p className="text-sm text-red-500 text-center mt-3">{error}</p>}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
