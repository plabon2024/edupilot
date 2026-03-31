"use client";

import { useEffect, useState } from "react";
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
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function PaymentCancelPage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-b from-background via-amber-50/20 to-background dark:via-amber-950/5">
      {/* Subtle animated background lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-300/20 to-transparent dark:via-amber-700/10" />
        <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-300/20 to-transparent dark:via-amber-700/10" />
      </div>

      <div className="relative mx-auto flex max-w-lg flex-col items-center px-4 py-20 sm:px-6">
        {/* Cancel icon */}
        <div
          className={`relative mb-8 transition-all duration-700 ${
            showContent
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-8 opacity-0 scale-50"
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute size-24 rounded-full bg-amber-400/10 animate-pulse duration-[2000ms]" />
          </div>
          <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl shadow-amber-500/25">
            <XCircle className="size-10 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Content card */}
        <Card
          className={`w-full border-amber-200/50 bg-card/80 shadow-xl shadow-amber-500/5 backdrop-blur-sm transition-all duration-700 delay-200 dark:border-amber-800/30 ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold sm:text-3xl">
              Payment Cancelled
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Your payment was not completed. Don&apos;t worry — no charges were
              made to your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Reassurance section */}
            <div className="rounded-lg border border-amber-200/50 bg-amber-50/50 p-4 dark:border-amber-800/30 dark:bg-amber-950/20">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Your information is safe
                  </p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/70">
                    No payment was processed and no charges appear on your card.
                    You can try again anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* Common reasons */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Common reasons for cancellation
              </p>
              {[
                "Changed your mind about the plan",
                "Want to review the features first",
                "Experienced a technical issue",
              ].map((reason, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm"
                  style={{
                    animation: showContent
                      ? `fadeInLeft 0.4s ease-out ${400 + i * 100}ms both`
                      : "none",
                  }}
                >
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted">
                    <HelpCircle className="size-3 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">{reason}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button className="flex-1" size="lg" asChild id="try-again-btn">
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

            {/* Help link */}
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

      {/* CSS animations */}
      <style>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
