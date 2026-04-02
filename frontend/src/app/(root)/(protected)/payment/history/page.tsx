"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  ArrowLeft,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Inbox,
  RefreshCw,
  Ban,
} from "lucide-react";
import Link from "next/link";
import { getPaymentHistory } from "@/services/payment.services";
import type { Payment } from "@/services/payment.services";

// ── Status badge — uses backend enum casing (SUCCEEDED, PENDING, FAILED, CANCELLED)
function StatusBadge({ status }: { status: Payment["status"] }) {
  const config: Record<
    Payment["status"],
    { label: string; icon: React.ElementType; className: string }
  > = {
    SUCCEEDED: {
      label: "Succeeded",
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    PENDING: {
      label: "Pending",
      icon: Clock,
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
    },
    FAILED: {
      label: "Failed",
      icon: XCircle,
      className:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400",
    },
    CANCELLED: {
      label: "Cancelled",
      icon: Ban,
      className:
        "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400",
    },
  };
  const { label, icon: Icon, className } = config[status] ?? config.PENDING;

  return (
    <Badge variant="outline" className={className}>
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}

// ── Type badge — uses backend enum casing (SUBSCRIPTION, ONE_TIME, CREDIT)
function TypeBadge({ type }: { type: Payment["type"] }) {
  const config: Record<
    Payment["type"],
    { label: string; className: string }
  > = {
    SUBSCRIPTION: {
      label: "Subscription",
      className:
        "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-400",
    },
    ONE_TIME: {
      label: "One-time",
      className:
        "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400",
    },
    CREDIT: {
      label: "Credit",
      className:
        "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-400",
    },
  };
  const { label, className } = config[type] ?? config.ONE_TIME;

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-card/50 p-4 animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-6 w-20 rounded-md bg-muted" />
        <div className="h-6 w-16 rounded-md bg-muted" />
        <div className="h-5 w-16 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Correct endpoint: GET /api/v1/payments/history via axiosInstance
      const data = await getPaymentHistory();
      setPayments(data);
    } catch {
      setError("Failed to load payment history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-muted/20">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <Receipt className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Payment History
              </h1>
              <p className="text-sm text-muted-foreground">
                View all your past transactions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPayments}
              disabled={loading}
              id="refresh-payments-btn"
            >
              <RefreshCw
                className={`size-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="size-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <XCircle className="size-12 text-destructive/60" />
              <div>
                <p className="font-medium text-destructive">{error}</p>
              </div>
              <Button variant="outline" onClick={fetchPayments}>
                <RefreshCw className="size-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : payments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <Inbox className="size-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No payments yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your payment history will appear here once you make a
                  purchase.
                </p>
              </div>
              <Button asChild>
                <Link href="/pricing">View Plans</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="size-4 text-muted-foreground" />
                Transactions
              </CardTitle>
              <CardDescription>
                {payments.length} payment{payments.length !== 1 ? "s" : ""}{" "}
                found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <div
                    key={payment.id}
                    id={`payment-row-${index}`}
                    className="group flex flex-col gap-3 rounded-lg border border-border/50 bg-gradient-to-r from-card to-card/80 p-4 transition-all hover:border-border hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: "fadeInUp 0.4s ease-out both",
                    }}
                  >
                    {/* Left: description + date */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {payment.description || "Payment"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(payment.createdAt)}
                        {payment.months && payment.months > 1
                          ? ` · ${payment.months} months`
                          : ""}
                      </p>
                    </div>

                    {/* Right: badges + amount */}
                    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                      <TypeBadge type={payment.type} />
                      <StatusBadge status={payment.status} />
                      <span
                        className={`ml-auto min-w-[5rem] text-right font-semibold tabular-nums sm:ml-4 ${
                          payment.status === "FAILED"
                            ? "text-muted-foreground line-through"
                            : ""
                        }`}
                      >
                        {formatCurrency(payment.amount, payment.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
