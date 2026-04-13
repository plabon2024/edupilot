'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Brain, Upload, Zap, CheckCircle, ArrowRight, Sparkles,
  FileText, MessageSquare, TrendingUp, Star, Users, Clock,
  Shield, Play, ChevronRight, Cpu, Layers, BarChart3, Rocket,
  BookOpen, GraduationCap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TypeAnimation } from "react-type-animation";

// ── Scroll Reveal Hook ──────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Animated Counter ────────────────────────────────────────
function StatCard({
  value, suffix = "", label, icon: Icon,
}: { value: number; suffix?: string; label: string; icon: React.ElementType }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const duration = 2200;
        const tick = () => {
          const p = Math.min((Date.now() - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(ease * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="flex items-center gap-3 sm:gap-4 group">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-300 flex-shrink-0">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-violet-500" />
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-black text-foreground tabular-nums">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

// ── Floating Particle ───────────────────────────────────────
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  top: `${Math.sin(i * 2.5) * 40 + 50}%`,
  left: `${(i / 20) * 100}%`,
  duration: `${6 + (i % 5) * 2}s`,
  delay: `${(i * 0.4) % 6}s`,
  size: `${2 + (i % 3)}px`,
}));

// ══════════════════════════════════════════════════════════════
// SECTION 1 – HERO
// ══════════════════════════════════════════════════════════════
function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-16">
      {/* Deep background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] animate-pulse [animation-duration:10s]" />
        <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/12 rounded-full blur-[120px] animate-pulse [animation-duration:14s] [animation-delay:3s]" />
        <div className="absolute bottom-[-5%] left-[20%] w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-[160px] animate-pulse [animation-duration:18s] [animation-delay:6s]" />
      </div>

      {/* AI grid */}
      <div className="absolute inset-0 ai-grid [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />

      {/* Particles */}
      {mounted && PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-violet-400/50 pointer-events-none"
          style={{
            top: p.top, left: p.left,
            width: p.size, height: p.size,
            animation: `particle-float ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Text column ── */}
          <div className="text-left">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6 text-xs sm:text-sm font-semibold cursor-default animate-border-glow">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="bg-gradient-to-r from-violet-500 to-indigo-400 bg-clip-text text-transparent">
                Powered by Gemini AI
              </span>
              <span className="text-muted-foreground/60 px-0.5">·</span>
              <span className="text-muted-foreground text-xs hidden sm:inline">v2.0 live</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter text-foreground mb-5 leading-[1.05]">
              Learn Faster.
              <br />
              <span className="relative inline-flex items-center">
                <span className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 opacity-20 blur-2xl rounded-xl" />
                {mounted ? (
                  <TypeAnimation
                    sequence={[
                      "Forget Forgetting.", 2400,
                      "Ace Every Exam.", 2400,
                      "Master Any Topic.", 2400,
                      "Study Smarter.", 2400,
                    ]}
                    wrapper="span"
                    speed={55}
                    deletionSpeed={70}
                    repeat={Infinity}
                    className="shimmer-text relative"
                  />
                ) : (
                  <span className="shimmer-text relative">Study Smarter.</span>
                )}
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl mb-8 sm:mb-10 leading-relaxed">
              Drop any document and our AI instantly builds personalized{" "}
              <span className="text-foreground font-semibold">flashcards, adaptive quizzes,</span>{" "}
              and a{" "}
              <span className="text-foreground font-semibold">private AI tutor</span> — in seconds.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4 mb-10 sm:mb-14">
              <Link href="/register" className="w-full xs:w-auto">
                <Button
                  id="hero-cta-primary"
                  size="lg"
                  className="w-full xs:w-auto group relative h-13 sm:h-14 rounded-full px-7 sm:px-8 text-sm sm:text-base font-bold overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white border-0 shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] hover:scale-105 transition-all duration-300 animate-gradient"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Free Today
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full xs:w-auto">
                <Button
                  id="hero-cta-secondary"
                  size="lg"
                  variant="outline"
                  className="w-full xs:w-auto h-13 sm:h-14 rounded-full px-7 sm:px-8 text-sm sm:text-base font-bold gap-2 border-border/60 hover:border-violet-500/50 hover:bg-violet-500/5 backdrop-blur-sm transition-all duration-300"
                >
                  <Play className="w-4 h-4 text-violet-500" fill="currentColor" />
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-4 sm:gap-x-8 gap-y-3">
              {[
                { icon: CheckCircle, text: "No credit card needed" },
                { icon: Shield, text: "SOC 2 secure" },
                { icon: Clock, text: "Setup in 30 seconds" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: AI Orb ── */}
          <div className="hidden lg:flex items-center justify-center relative h-[480px] xl:h-[520px]">
            {/* Central glowing orb */}
            <div className="relative w-48 h-48 xl:w-56 xl:h-56 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 animate-glow-pulse shadow-[0_0_80px_rgba(139,92,246,0.6)]" />
              <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-xl flex items-center justify-center">
                <Brain className="w-16 h-16 xl:w-20 xl:h-20 text-violet-400 animate-ai-pulse drop-shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
              </div>
              <div className="absolute inset-[-24px] rounded-full border border-violet-500/20 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-[-48px] rounded-full border border-indigo-500/10 animate-[spin_30s_linear_infinite_reverse]" />
              <div className="absolute inset-0 animate-orbit">
                <div className="w-4 h-4 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
              </div>
              <div className="absolute inset-0 animate-orbit-reverse">
                <div className="w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              </div>
            </div>

            {/* Floating feature cards */}
            {[
              { cls: "top-8 left-4 animate-float", icon: Zap, iconColor: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", title: "Adaptive Quiz", sub: "AI-crafted in 3s" },
              { cls: "top-8 right-4 animate-float-delay", icon: BookOpen, iconColor: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", title: "Flashcards", sub: "Spaced repetition" },
              { cls: "bottom-16 left-0 animate-float delay-200", icon: BarChart3, iconColor: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", title: "Progress", sub: "+41% grade boost" },
              { cls: "bottom-16 right-0 animate-float-delay delay-300", icon: MessageSquare, iconColor: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", title: "AI Tutor", sub: "Cite-accurate" },
            ].map(({ cls, icon: Icon, iconColor, bg, border, title, sub }) => (
              <div key={title} className={`absolute ${cls} glass-card rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[155px] xl:min-w-[165px]`}>
                <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 sm:mt-20 pt-8 sm:pt-10 border-t border-border/30">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-4">
            <StatCard value={10000} suffix="+" label="Active Students" icon={Users} />
            <StatCard value={5000000} suffix="+" label="Flashcards Made" icon={Zap} />
            <StatCard value={41} suffix="%" label="Avg. Grade Jump" icon={TrendingUp} />
            <StatCard value={99} suffix="%" label="Happy Learners" icon={Star} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 2 – FEATURES
// ══════════════════════════════════════════════════════════════
const features = [
  { icon: Brain, title: "Instant Flashcards", description: "100-page PDFs → bite-sized spaced repetition flashcards in 12 seconds flat.", gradient: "from-violet-500 to-indigo-600", glow: "shadow-violet-500/30", tag: "Core AI" },
  { icon: Zap, title: "Adaptive Quizzes", description: "AI-crafted dynamic exams that map your weaknesses and adjust difficulty in real-time.", gradient: "from-amber-400 to-orange-500", glow: "shadow-amber-500/30", tag: "Smart Testing" },
  { icon: MessageSquare, title: "Private AI Tutor", description: "Chat directly with your document. Every answer is cited to the exact page — zero hallucinations.", gradient: "from-blue-500 to-cyan-500", glow: "shadow-blue-500/30", tag: "Conversational AI" },
  { icon: Cpu, title: "OCR Processing", description: "Equations, tables, figures — our ML pipeline extracts everything with pixel precision.", gradient: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/30", tag: "Document AI" },
  { icon: BarChart3, title: "Brain Analytics", description: "Visual dashboards show exactly what you know and predict exactly what you might fail.", gradient: "from-pink-500 to-rose-500", glow: "shadow-pink-500/30", tag: "Insights" },
  { icon: Layers, title: "Concept Simplifier", description: "Highlight anything confusing. Gemini explains it in plain English in under 3 seconds.", gradient: "from-purple-500 to-fuchsia-500", glow: "shadow-purple-500/30", tag: "ELI5 Mode" },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28 lg:py-32 relative bg-background overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20 reveal">
          <Badge variant="outline" className="mb-5 border-violet-500/30 text-violet-600 dark:text-violet-400 px-4 py-1.5 text-xs sm:text-sm rounded-full bg-violet-500/5 font-semibold">
            Platform Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight mb-5">
            A Supercomputer{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              for Your Memory
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
            We combined bleeding-edge LLM technology with cognitive science to create the ultimate study companion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="reveal group relative rounded-2xl sm:rounded-3xl glass-card p-6 sm:p-7 lg:p-8 hover:scale-[1.02] transition-all duration-500 overflow-hidden cursor-default"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className={`absolute -top-10 -right-10 w-36 h-36 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-10 blur-2xl rounded-full transition-opacity duration-500`} />
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-xl ${f.glow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border/50">{f.tag}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2.5 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{f.description}</p>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Learn more <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 3 – HOW IT WORKS
// ══════════════════════════════════════════════════════════════
const steps = [
  { step: "01", icon: Upload, title: "Drop Your Documents", desc: "Upload PDFs, lecture slides, or research papers. Bulk uploads up to 500MB supported.", color: "from-violet-500 to-indigo-600", glow: "shadow-violet-500/40", ring: "border-violet-500/30" },
  { step: "02", icon: Brain, title: "Gemini AI Ingestion", desc: "Our AI chunks, semantically indexes, and synthesizes core concepts from every single page.", color: "from-blue-500 to-cyan-500", glow: "shadow-blue-500/40", ring: "border-blue-500/30" },
  { step: "03", icon: Rocket, title: "Begin Mastering", desc: "Interact with flashcards, dynamic quizzes, and your personal AI tutor — all instantly.", color: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/40", ring: "border-emerald-500/30" },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/20 dark:bg-muted/10" />
      <div className="absolute inset-0 ai-grid opacity-50 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black,transparent)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 reveal">
          <Badge variant="outline" className="mb-5 border-blue-500/30 text-blue-600 dark:text-blue-400 px-4 py-1.5 text-xs sm:text-sm rounded-full bg-blue-500/5 font-semibold">
            Zero Setup Workflow
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight mb-5">
            From Syllabus to{" "}
            <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              A+ in 3 Steps
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            No setup, no configuration. Just upload and let AI do the heavy lifting.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-[3.5rem] left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px">
            <div className="w-full h-full bg-gradient-to-r from-violet-500/40 via-blue-500/40 to-emerald-500/40 [mask-image:repeating-linear-gradient(90deg,black,black_6px,transparent_6px,transparent_12px)]" />
          </div>

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="reveal group flex flex-col lg:items-center lg:text-center" style={{ transitionDelay: `${i * 150}ms` }}>
                {/* Mobile: horizontal layout */}
                <div className="flex lg:flex-col lg:items-center items-start gap-4 sm:gap-6 lg:gap-0">
                  <div className="relative flex-shrink-0 lg:mb-8 z-10">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center shadow-2xl ${s.glow} group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-background border-2 border-border flex items-center justify-center text-xs font-black text-foreground shadow-md">
                      {s.step}
                    </div>
                  </div>

                  {/* Mobile inline text */}
                  <div className="lg:hidden">
                    <h3 className="text-base sm:text-lg font-black mb-1.5">{s.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>

                {/* Desktop card */}
                <div className={`hidden lg:block glass-card rounded-3xl p-6 border ${s.ring} w-full group-hover:shadow-lg transition-all duration-500 mt-0`}>
                  <h3 className="text-xl sm:text-2xl font-black mb-3">{s.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 5 – PRICING (updated)
// ══════════════════════════════════════════════════════════════
const freeFeatures = [
  "Upload up to 5 PDFs",
  "5 AI actions per day",
  "AI Flashcard generation",
  "AI Quiz generation",
  "Document AI chat",
];

const proFeatures = [
  "Unlimited PDF uploads",
  "Unlimited AI generations",
  "Priority Gemini Engine queue",
  "Advanced adaptive quiz maker",
  "AI Concept Explainer (ELI5)",
  "Persistent chat history",
  "Detailed brain analytics dashboard",
  "Early access to new features",
];

function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 reveal px-4">
          <Badge variant="outline" className="mb-5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 text-xs sm:text-sm rounded-full bg-emerald-500/5 font-semibold">
            Transparent Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight mb-4">
            Invest in Your{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent sm:whitespace-nowrap">
              Education
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
            Stop failing classes. Start passing effortlessly.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch px-4">

          {/* ── Free ── */}
          <div className="reveal flex flex-col rounded-2xl sm:rounded-3xl glass-card p-7 sm:p-10 transition-all duration-500 group hover:shadow-xl order-2 md:order-1 border border-border/50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black">Basic Starter</h3>
                <p className="text-muted-foreground text-sm mt-1">Perfect to try the AI.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border mt-1">Free</span>
            </div>

            <div className="flex items-baseline gap-1 my-7 sm:my-8 text-foreground">
              <span className="text-5xl sm:text-6xl font-black tracking-tighter">$0</span>
              <span className="text-base sm:text-lg text-muted-foreground font-medium">/ forever</span>
            </div>

            <Link href="/register">
              <Button id="pricing-free-cta" variant="outline" className="w-full h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl mb-8 border-2 hover:bg-muted/50 hover:border-violet-500/40 transition-all duration-300">
                Get Basic Free
              </Button>
            </Link>

            <ul className="space-y-4 mb-auto">
              {freeFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-foreground/80">
                  <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-muted-foreground" />
                  </div>
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Pro ── */}
          <div className="reveal relative flex flex-col rounded-2xl sm:rounded-3xl p-7 sm:p-10 group md:-translate-y-4 order-1 md:order-2" style={{ transitionDelay: "100ms" }}>
            {/* Animated gradient border (Now visible even if badge overflows) */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-[2px]">
              <div className="absolute inset-[2px] rounded-[calc(1rem-2px)] sm:rounded-[calc(1.5rem-2px)] bg-background backdrop-blur-2xl" />
            </div>

            {/* Ambient glow */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(139,92,246,0.15)] group-hover:shadow-[0_0_80px_rgba(139,92,246,0.3)] transition-shadow duration-500" />

            {/* Popular badge - Fixed positioning and z-index */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold px-6 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-xl shadow-violet-500/40 border-2 border-background z-20 whitespace-nowrap">
              <Star className="w-3.5 h-3.5 fill-white" /> MOST POPULAR
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black">Pro Scholar</h3>
                  <p className="text-violet-600 dark:text-violet-400 text-sm mt-1 font-medium italic">Unlimited cognitive power.</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30 mt-1">Pro</span>
              </div>

              <div className="flex items-baseline gap-1 my-7 sm:my-8">
                <span className="text-5xl sm:text-6xl font-black tracking-tighter text-foreground">$9.99</span>
                <span className="text-base sm:text-lg text-muted-foreground font-medium">/ month</span>
              </div>

              <div className="mb-8 flex items-center gap-3 p-4 rounded-xl bg-violet-500/5 border border-violet-500/15">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0 border border-violet-500/20">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                </div>
                <p className="text-xs sm:text-sm text-foreground font-medium">
                  Buy 3 months & save 40% — <span className="text-violet-600 dark:text-violet-400 font-bold">just $5.99/mo</span>
                </p>
              </div>

              <Link href="/pricing">
                <Button id="pricing-pro-cta" className="w-full h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl mb-8 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white border-0 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all duration-300">
                  Upgrade to Pro
                </Button>
              </Link>

              <ul className="space-y-4 mb-auto">
                {proFeatures.map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm text-foreground">
                    <div className="w-5 h-5 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-violet-500" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center mt-10 sm:mt-12 text-muted-foreground text-xs sm:text-sm">
          Secure checkout via <span className="font-semibold text-foreground">Stripe</span>
          {" "}· Cancel anytime · No hidden fees · 14-day money-back guarantee
        </p>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 6 – CTA
// ══════════════════════════════════════════════════════════════
function CtaSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden relative p-8 sm:p-12 md:p-20 lg:p-24 text-center reveal">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-indigo-950 to-purple-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[300px] sm:h-[400px] bg-violet-600/40 blur-[100px] sm:blur-[120px] rounded-full animate-pulse [animation-duration:8s]" />
        <div className="absolute inset-0 ai-grid opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent,rgba(0,0,0,0.5))]" />

        <div className="relative z-10">
          <div className="inline-flex w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 items-center justify-center mb-6 sm:mb-8 animate-glow-pulse">
            <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-5 sm:mb-6 tracking-tighter leading-[1.05]">
            Stop Studying.
            <br />
            <span className="text-violet-300 neon-text">Start Knowing.</span>
          </h2>
          <p className="text-base sm:text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed">
            Join the elite students getting their time back while crushing their exams with AI.
          </p>

          <Link href="/register">
            <Button id="cta-launch-btn" size="lg" className="h-14 sm:h-16 px-8 sm:px-12 rounded-full text-base sm:text-lg font-black bg-white text-violet-900 hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.3)]">
              Launch EduPilot AI Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="mt-6 sm:mt-8 text-white/40 text-xs sm:text-sm font-medium">
            No credit card · 5 PDFs free · Set up in 30 seconds
          </p>

          <div className="mt-10 sm:mt-12 flex flex-wrap justify-center gap-3 sm:gap-4">
            {[{ icon: Users, label: "10k+ students" }, { icon: Star, label: "4.9/5 rating" }, { icon: Shield, label: "SOC 2 certified" }].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-xs sm:text-sm font-medium">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-300" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// HOME PAGE Export
// ══════════════════════════════════════════════════════════════
export default function HomePage() {
  useScrollReveal();
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CtaSection />
    </div>
  );
}
