"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  XCircle,
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
  RefreshCw,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const PAGE_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [phase, setPhase] = useState<"loading" | "valid" | "expired" | "invalid">("loading");
  const [showContent, setShowContent] = useState(false);
  const [remainingMs, setRemainingMs] = useState(PAGE_LIFETIME_MS);

  const validate = useCallback(async () => {
    if (!token) { setPhase("invalid"); return; }

    try {
      const res = await fetch(`${API}/api/v1/payments/session-token/${token}`);
      const json = await res.json();

      if (res.ok && json?.data?.valid) {
        setRemainingMs(json.data.remainingMs as number);
        setPhase("valid");
        setTimeout(() => setShowContent(true), 100);
      } else if (res.status === 410) {
        setPhase("expired");
      } else {
        setPhase("invalid");
      }
    } catch {
      setPhase("invalid");
    }
  }, [token]);

  useEffect(() => { void validate(); }, [validate]);

  // Countdown — redirect to pricing when it hits 0
  useEffect(() => {
    if (phase !== "valid") return;
    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          router.replace("/pricing");
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, router]);

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* ── Loading ── */
  if (phase === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="size-10 animate-spin text-amber-500" />
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  /* ── Expired or Invalid ── */
  if (phase === "expired" || phase === "invalid") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="size-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <CardTitle>
              {phase === "expired" ? "Link Expired" : "Invalid Link"}
            </CardTitle>
            <CardDescription className="mt-2">
              {phase === "expired"
                ? "This page link has expired. No charges were made to your account."
                : "This link is not valid or has already been used."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full">
              <Link href="/pricing">
                <RefreshCw className="size-4" />
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" />
                Go to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── Valid Failed Page ── */
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-b from-background via-red-50/20 to-background dark:via-red-950/5">
      {/* Subtle background lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-red-300/20 to-transparent dark:via-red-700/10" />
        <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-red-300/20 to-transparent dark:via-red-700/10" />
      </div>

      <div className="relative mx-auto flex max-w-lg flex-col items-center px-4 py-20 sm:px-6">
        {/* Failed icon */}
        <div
          className={`relative mb-8 transition-all duration-700 ${
            showContent
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-8 opacity-0 scale-50"
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute size-24 rounded-full bg-red-400/10 animate-pulse duration-[2000ms]" />
          </div>
          <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-600 shadow-2xl shadow-red-500/25">
            <XCircle className="size-10 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Countdown badge */}
        <div
          className={`mb-6 flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-4 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400 transition-all duration-700 delay-100 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Clock className="size-3.5" />
          This page expires in{" "}
          <span className="font-bold tabular-nums">{formatTime(remainingMs)}</span>
        </div>

        {/* Content card */}
        <Card
          className={`w-full border-red-200/50 bg-card/80 shadow-xl shadow-red-500/5 backdrop-blur-sm transition-all duration-700 delay-200 dark:border-red-800/30 ${
            showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold sm:text-3xl">
              Payment Not Completed
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Your payment was cancelled or didn&apos;t go through. Don&apos;t worry —
              no charges were made to your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Reassurance */}
            <div className="rounded-lg border border-emerald-200/50 bg-emerald-50/50 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/20">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    Your information is safe
                  </p>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400/70">
                    No payment was processed and no charges appear on your card.
                    You can try again anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* Page expiry notice */}
            <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-950/20">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <Clock className="mb-0.5 mr-1 inline size-3.5" />
                This page will redirect to pricing in{" "}
                <span className="font-bold tabular-nums">{formatTime(remainingMs)}</span>.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                size="lg"
                asChild
                id="try-again-btn"
              >
                <Link href="/pricing">
                  <RefreshCw className="size-4" />
                  Try Again
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                size="lg"
                asChild
                id="go-to-dashboard-btn"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Need help?{" "}
              <Link
                href="/support"
                className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
              >
                Contact our support team
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
