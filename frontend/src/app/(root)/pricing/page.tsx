"use client";

import { useState } from "react";
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
  CheckCircle2,
  Zap,
  Crown,
  Star,
  ArrowRight,
  HelpCircle,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";
import { createCheckoutSession } from "@/services/payment.services";

const MONTHLY_PRICE = 9.99;

const FREE_FEATURES = [
  "5 document uploads",
  "50 AI flashcards / month",
  "10 quiz generations / month",
  "Basic AI chat",
  "Community support",
];

const PRO_FEATURES = [
  "Unlimited document uploads",
  "Unlimited AI flashcards",
  "Unlimited quizzes",
  "Advanced AI chat & concept explain",
  "Priority support",
  "Export to Anki / PDF",
  "Study analytics",
];

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes! You can cancel your subscription anytime from your account settings. You'll keep access until the end of your billing period.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, Amex) via Stripe. Payments are processed securely.",
  },
  {
    q: "Can I buy more than one month at once?",
    a: "Absolutely! On the Stripe checkout page you can increase the quantity to buy multiple months upfront — the total adjusts automatically.",
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "Your data is always safe. If you exceed free tier limits after downgrading, you won't lose content — you just can't add new items until you upgrade again.",
  },
];

export default function PricingPage() {
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = (MONTHLY_PRICE * months).toFixed(2);

  const handleSubscribe = async () => {
    setError(null);
    setLoading(true);
    try {
      // Uses axiosInstance — auth token injected automatically
      const { url } = await createCheckoutSession(months);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero */}
      <div className="mx-auto max-w-4xl px-4 pt-16 pb-10 text-center sm:px-6">
        <Badge
          variant="outline"
          className="mb-4 border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
        >
          <Star className="size-3" /> Simple, Transparent Pricing
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Invest in your{" "}
          <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
            learning
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          One plan. All features. Start free, upgrade anytime.
        </p>
      </div>

      {/* Cards */}
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">

          {/* Free Plan */}
          <div
            className="relative rounded-2xl border border-border/60 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            style={{ animation: "fadeInUp 0.4s ease-out 0ms both" }}
            id="plan-free"
          >
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="pb-4">
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg shadow-slate-500/20">
                  <Zap className="size-5 text-white" />
                </div>
                <CardTitle className="text-lg">Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-bold tabular-nums">$0</span>
                  <span className="mb-1 text-sm text-muted-foreground">/ mo</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full"
                  id="cta-free"
                >
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <ul className="space-y-2.5">
                  {FREE_FEATURES.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Pro Plan — subscription */}
          <div
            className="relative rounded-2xl border border-violet-400/60 shadow-xl shadow-violet-500/10 dark:border-violet-700/60 scale-[1.02] transition-all duration-300"
            style={{ animation: "fadeInUp 0.4s ease-out 100ms both" }}
            id="plan-pro"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md text-xs px-3">
                Most Popular
              </Badge>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />

            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="pb-4">
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                  <Crown className="size-5 text-white" />
                </div>
                <CardTitle className="text-lg">Pro</CardTitle>
                <CardDescription>For serious learners</CardDescription>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-bold tabular-nums">
                    ${MONTHLY_PRICE}
                  </span>
                  <span className="mb-1 text-sm text-muted-foreground">/ mo</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Month selector */}
                <div className="rounded-xl border border-violet-200/60 bg-violet-50/50 p-4 dark:border-violet-800/40 dark:bg-violet-950/20">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Select months
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <button
                      id="months-decrease"
                      onClick={() => setMonths((m) => Math.max(1, m - 1))}
                      disabled={months <= 1}
                      className="flex size-8 items-center justify-center rounded-full border border-border bg-background transition-all hover:bg-muted disabled:opacity-40"
                    >
                      <Minus className="size-3.5" />
                    </button>

                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold tabular-nums">{months}</span>
                      <span className="text-xs text-muted-foreground">
                        month{months > 1 ? "s" : ""}
                      </span>
                    </div>

                    <button
                      id="months-increase"
                      onClick={() => setMonths((m) => Math.min(24, m + 1))}
                      disabled={months >= 24}
                      className="flex size-8 items-center justify-center rounded-full border border-border bg-background transition-all hover:bg-muted disabled:opacity-40"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-lg font-bold text-violet-700 dark:text-violet-400">
                      ${total}
                    </span>
                  </div>

                  {months >= 6 && (
                    <p className="mt-2 text-center text-xs text-emerald-600 dark:text-emerald-400">
                      🎉 Great deal! {months} months of uninterrupted learning.
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-center text-sm text-destructive">{error}</p>
                )}

                <Button
                  id="cta-subscribe"
                  size="lg"
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Redirecting to Stripe…
                    </>
                  ) : (
                    <>
                      Get Subscription — ${total}
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <ul className="space-y-2.5">
                  {PRO_FEATURES.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-center text-xs text-muted-foreground">
                  Secured by{" "}
                  <span className="font-semibold text-foreground">Stripe</span>{" "}
                  · You can also adjust quantity on Stripe&apos;s page
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <p className="mt-2 text-muted-foreground">
              Got questions? We&apos;ve got answers.
            </p>
          </div>
          <div className="mx-auto max-w-2xl space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-border/60 bg-card"
                style={{ animation: `fadeInUp 0.35s ease-out ${i * 80}ms both` }}
              >
                <button
                  id={`faq-${i}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-muted/30"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="size-4 shrink-0 text-muted-foreground" />
                    {faq.q}
                  </span>
                  <span
                    className={`text-muted-foreground transition-transform duration-200 ${
                      openFaq === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="border-t border-border/40 px-5 py-4 text-sm text-muted-foreground">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div
          className="mt-16 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 p-8 text-center text-white shadow-xl shadow-violet-500/20"
          style={{ animation: "fadeInUp 0.4s ease-out 400ms both" }}
        >
          <h3 className="text-2xl font-bold">Ready to study smarter?</h3>
          <p className="mt-2 text-violet-100">
            Join thousands of students using EduPilot-AI to ace their exams.
          </p>
          <Button
            size="lg"
            className="mt-6 bg-white text-violet-700 hover:bg-white/90"
            onClick={handleSubscribe}
            disabled={loading}
            id="get-started-cta"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Get Started — ${total}
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
