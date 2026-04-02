"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Crown,
  Calendar,
  Receipt,
  ArrowRight,
  Loader2,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import { getSubscriptionStatus } from "@/services/payment.services";
import type { SubscriptionStatus } from "@/services/payment.services";

export default function PaymentPage() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubscriptionStatus();
      setStatus(data);
    } catch {
      setError("Failed to load subscription status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const daysLeft = status?.subscriptionEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(status.subscriptionEndsAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-muted/20">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <CreditCard className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
              <p className="text-sm text-muted-foreground">
                Manage your EduPilot plan
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStatus}
            disabled={loading}
            id="refresh-status-btn"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card className="border-destructive/30 bg-destructive/5 text-center">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <AlertCircle className="size-8 text-destructive/60" />
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={fetchStatus}>Retry</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Subscription status card */}
            <Card
              className={`overflow-hidden border ${
                status?.isSubscribed
                  ? "border-violet-300/60 shadow-lg shadow-violet-500/10 dark:border-violet-700/40"
                  : "border-border/60"
              }`}
              style={{ animation: "fadeInUp 0.4s ease-out both" }}
            >
              {status?.isSubscribed && (
                <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-purple-600" />
              )}
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-11 items-center justify-center rounded-xl shadow-lg ${
                        status?.isSubscribed
                          ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/30"
                          : "bg-gradient-to-br from-slate-400 to-slate-500"
                      }`}
                    >
                      {status?.isSubscribed ? (
                        <Crown className="size-5 text-white" />
                      ) : (
                        <Zap className="size-5 text-white" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {status?.isSubscribed ? "Pro Plan" : "Free Plan"}
                      </CardTitle>
                      <CardDescription>
                        {status?.isSubscribed
                          ? "All premium features unlocked"
                          : "Basic features — upgrade to unlock more"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      status?.isSubscribed
                        ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
                        : "border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400"
                    }
                  >
                    {status?.isSubscribed ? "Active" : "Free"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {status?.isSubscribed && status.subscriptionEndsAt ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="size-3.5" />
                        Expires on
                      </div>
                      <p className="mt-1 font-semibold text-sm">
                        {formatDate(status.subscriptionEndsAt)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-3.5" />
                        Days remaining
                      </div>
                      <p
                        className={`mt-1 font-semibold text-sm tabular-nums ${
                          daysLeft <= 7 ? "text-amber-600 dark:text-amber-400" : ""
                        }`}
                      >
                        {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      You&apos;re on the free plan. Upgrade to unlock all AI-powered
                      study tools.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                    id="go-to-pricing-btn"
                  >
                    <Link href="/pricing">
                      <Crown className="size-4" />
                      {status?.isSubscribed ? "Extend Subscription" : "Upgrade to Pro"}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1" id="go-to-history-btn">
                    <Link href="/payment/history">
                      <Receipt className="size-4" />
                      Payment History
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pro features list */}
            {!status?.isSubscribed && (
              <Card
                className="border-violet-200/60 dark:border-violet-800/30"
                style={{ animation: "fadeInUp 0.4s ease-out 100ms both" }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="size-4 text-violet-500" />
                    What you get with Pro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {[
                      "Unlimited document uploads",
                      "Unlimited AI flashcards",
                      "Unlimited quiz generation",
                      "Advanced AI chat & explanations",
                      "Study analytics & progress",
                      "Priority support",
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
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
