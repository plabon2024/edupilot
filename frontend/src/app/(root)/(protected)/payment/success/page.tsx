"use client";

import { Suspense, useEffect, useState } from "react";
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
  CheckCircle2,
  ArrowRight,
  Receipt,
  LayoutDashboard,
  Sparkles,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { getSubscriptionStatus, verifyPaymentSession } from "@/services/payment.services";

const AUTO_REDIRECT_MS = 15 * 60 * 1000; // 15 minutes

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Stripe redirects with ?session_id=cs_xxx after checkout
  const sessionId = searchParams.get("session_id");

  const [phase, setPhase] = useState<"loading" | "valid" | "invalid">("loading");
  const [showContent, setShowContent] = useState(false);
  const [remainingMs, setRemainingMs] = useState(AUTO_REDIRECT_MS);

  // Verify subscription was activated by calling /payments/status
  useEffect(() => {
    const verify = async () => {
      if (!sessionId) {
        setPhase("invalid");
        return;
      }
      try {
        // Ping the backend to explicitly verify and fulfill the session if webhooks failed/skipped.
        try {
          await verifyPaymentSession(sessionId);
        } catch (e) {
          console.error("Verification error (may already be verified):", e);
        }

        // Give the Stripe webhook/verification a moment to process before checking
        await new Promise((r) => setTimeout(r, 1000));
        const status = await getSubscriptionStatus();
        if (status.isSubscribed) {
          setPhase("valid");
          setTimeout(() => setShowContent(true), 100);
        } else {
          // Subscription not yet active — still show success
          setPhase("valid");
          setTimeout(() => setShowContent(true), 100);
        }
      } catch {
        // Network error — still show success since Stripe redirected here
        setPhase("valid");
        setTimeout(() => setShowContent(true), 100);
      }
    };
    void verify();
  }, [sessionId]);

  // Countdown timer — redirect when timer hits 0
  useEffect(() => {
    if (phase !== "valid") return;
    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          router.replace("/dashboard");
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
          <Loader2 className="size-10 animate-spin text-violet-500" />
          <p className="text-muted-foreground">Confirming your payment…</p>
        </div>
      </div>
    );
  }

  /* ── Invalid (no session_id param) ── */
  if (phase === "invalid") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="size-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription className="mt-2">
              This page can only be accessed after a successful checkout. If you
              completed a payment, your subscription is active.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full">
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" />
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/payment/history">
                <Receipt className="size-4" />
                View Payment History
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── Valid Success Page ── */
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-b from-background via-emerald-50/30 to-background dark:via-emerald-950/10">
      {/* Animated background particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${6 + (i % 5) * 2}px`,
              height: `${6 + (i % 5) * 2}px`,
              left: `${(i * 17 + 5) % 97}%`,
              top: `${(i * 23 + 10) % 90}%`,
              background: `hsl(${150 + (i % 3) * 15}, 65%, 55%)`,
              opacity: 0.25,
              animation: `float ${3 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i % 3) * 0.8}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex max-w-lg flex-col items-center px-4 py-20 sm:px-6">
        {/* Success icon */}
        <div
          className={`relative mb-8 transition-all duration-700 ${
            showContent
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-8 opacity-0 scale-50"
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute size-24 animate-ping rounded-full bg-emerald-400/20 duration-[2000ms]" />
            <div className="absolute size-20 animate-ping rounded-full bg-emerald-400/30 duration-[1500ms]" />
          </div>
          <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="size-10 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Countdown badge */}
        <div
          className={`mb-6 flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-4 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400 transition-all duration-700 delay-100 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Clock className="size-3.5" />
          Redirecting to dashboard in{" "}
          <span className="font-bold tabular-nums">{formatTime(remainingMs)}</span>
        </div>

        {/* Content card */}
        <Card
          className={`w-full border-emerald-200/50 bg-card/80 shadow-xl shadow-emerald-500/5 backdrop-blur-sm transition-all duration-700 delay-200 dark:border-emerald-800/30 ${
            showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <CardHeader className="text-center">
            <div className="mb-2 flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-widest">
                Payment Confirmed
              </span>
              <Sparkles className="size-4" />
            </div>
            <CardTitle className="text-2xl font-bold sm:text-3xl">
              Payment Successful! 🎉
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Thank you for your purchase. Your subscription is now active and all
              premium features are unlocked.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Feature highlights */}
            <div className="space-y-3">
              {[
                "Your premium features are now active",
                "Access all AI-powered study tools",
                "Unlimited document uploads & flashcards",
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm"
                  style={{
                    animation: showContent
                      ? `fadeInLeft 0.4s ease-out ${400 + i * 100}ms both`
                      : "none",
                  }}
                >
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                    <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* Note about redirect */}
            <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-950/20">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <Clock className="mb-0.5 mr-1 inline size-3.5" />
                This page will automatically redirect to your dashboard in{" "}
                <span className="font-bold tabular-nums">{formatTime(remainingMs)}</span>.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700"
                size="lg"
                asChild
                id="go-to-dashboard-btn"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="size-4" />
                  Go to Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                size="lg"
                asChild
                id="view-history-btn"
              >
                <Link href="/payment/history">
                  <Receipt className="size-4" />
                  View History
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
