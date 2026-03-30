import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Brain,
  Upload,
  Zap,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Sparkles,
  FileText,
  MessageSquare,
  TrendingUp,
  Star,
  Users,
  Clock,
  Shield,
  Play
} from "lucide-react";

// ────────────────────────────────────────────────────────────
// Section 1 – HERO
// ────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Dynamic Animated Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px] animate-pulse [animation-duration:8s]" />
        <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse [animation-duration:10s] [animation-delay:2s]" />
        <div className="absolute bottom-[10%] left-[30%] w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[120px] animate-pulse [animation-duration:12s] [animation-delay:4s]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#8b5cf6 1px,transparent 1px),linear-gradient(90deg,#8b5cf6 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Grid gradient mask to fade top/bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center z-10">
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 bg-background/60 backdrop-blur-md border border-violet-500/30 text-violet-600 dark:text-violet-400 rounded-full px-5 py-2 text-sm font-semibold mb-10 shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_30px_rgba(139,92,246,0.25)] transition-shadow duration-500 cursor-default">
          <Sparkles className="w-4 h-4 animate-pulse text-violet-500" />
          <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">Gemini AI</span>
          <span className="text-muted-foreground px-1">•</span>
          <span>Smarter Learning V2.0</span>
        </div>

        {/* Headline */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-foreground mb-8 leading-[1.1]">
          Learn Faster.<br className="hidden sm:block" />
          <span className="relative inline-block mt-2">
            <span className="absolute -inset-2 bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 opacity-20 blur-3xl rounded-full" />
            <span className="relative bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Forget Forgetting.
            </span>
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
          Drop any document and let our AI engine instantly build your personalized
          <strong className="text-foreground font-semibold"> flashcards, adaptive quizzes, and private tutor.</strong>
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
          <Link href="/register">
            <Button
              size="lg"
              className="group relative h-16 rounded-full px-10 text-lg font-bold bg-foreground text-background hover:bg-foreground overflow-hidden hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-violet-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                Start Learning For Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button size="lg" variant="outline" className="h-16 rounded-full px-10 text-lg font-bold gap-2 border-2 hover:bg-muted/50 backdrop-blur-md transition-all duration-300">
              <Play className="w-5 h-5 text-violet-600" fill="currentColor" />
              Watch Demo
            </Button>
          </a>
        </div>

        {/* Trust metrics */}
        <div className="pt-8 border-t border-border/50 flex flex-wrap justify-center gap-x-12 gap-y-6 max-w-4xl mx-auto">
          {[
            { label: "Active Students", value: "10k+", icon: Users },
            { label: "Flashcards Generaetd", value: "5M+", icon: Zap },
            { label: "Avg. Grade Jump", value: "+41%", icon: TrendingUp },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center border border-violet-500/20">
                  <Icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black text-foreground">{stat.value}</div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Section 2 – FEATURES
// ────────────────────────────────────────────────────────────
const features = [
  {
    icon: Brain,
    title: "Instant Flashcards",
    description: "Transform 100-page dense PDFs into bite-sized spatial repetition flashcards in exactly 12 seconds.",
    color: "from-violet-500 to-indigo-600",
    shadow: "shadow-violet-500/20",
  },
  {
    icon: Zap,
    title: "Adaptive Quizzes",
    description: "AI-crafted dynamic exams that learn your weaknesses and adjust difficulty in real-time.",
    color: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/20",
  },
  {
    icon: MessageSquare,
    title: "Private AI Tutor",
    description: "Stuck on a concept? Chat directly with your document. The AI cites exact pages for every answer.",
    color: "from-blue-500 to-cyan-600",
    shadow: "shadow-blue-500/20",
  },
  {
    icon: FileText,
    title: "Lightning Processing",
    description: "Our OCR pipeline extracts exact equations, tables, and complex formats instantly.",
    color: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    icon: TrendingUp,
    title: "Brain Analytics",
    description: "Visual dashboards map precisely what you know and predict exactly what you might fail on.",
    color: "from-pink-500 to-rose-600",
    shadow: "shadow-pink-500/20",
  },
  {
    icon: Shield,
    title: "Concept Simplifier",
    description: "Highlight a confusing paragraph. Gemini AI will explain it like you're five years old.",
    color: "from-purple-500 to-fuchsia-600",
    shadow: "shadow-purple-500/20",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge variant="outline" className="mb-6 border-violet-500/30 text-violet-600 dark:text-violet-400 px-4 py-1.5 text-sm rounded-full bg-violet-500/5">
            Platform Capabilities
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            A Supercomputer for{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Your Memory
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            We combined bleeding-edge LLM technology with cognitive science to create the ultimate study companion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative rounded-3xl bg-background/50 border border-border/50 p-8 hover:bg-muted/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              >
                {/* Hover gradient backdrop */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-lg ${f.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Section 3 – HOW IT WORKS
// ────────────────────────────────────────────────────────────
function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-32 relative bg-zinc-50 dark:bg-zinc-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-6 border-blue-500/30 text-blue-600 dark:text-blue-400 px-4 py-1.5 text-sm rounded-full bg-blue-500/5">
            Zero Setup Workflow
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            From Syllabus to{" "}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent">
              A+ in Seconds
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-1 bg-gradient-to-r from-violet-500/30 via-blue-500/30 to-emerald-500/30 rounded-full" />

          {[
            {
              step: "1",
              icon: Upload,
              title: "Drop Your PDFs",
              desc: "Upload 100-page lectures, research papers, or syllabus documents securely to our cloud.",
              color: "text-violet-600 dark:text-violet-400",
              ring: "ring-violet-500/30 bg-violet-500/10",
            },
            {
              step: "2",
              icon: Brain,
              title: "AI Ingestion",
              desc: "Gemini AI instantly chunks, semantically indexes, and synthesizes the core concepts.",
              color: "text-blue-600 dark:text-blue-400",
              ring: "ring-blue-500/30 bg-blue-500/10",
            },
            {
              step: "3",
              icon: Star,
              title: "Begin Mastery",
              desc: "Interact via generated flashcards, dynamic quizzes, and conversational tutoring.",
              color: "text-emerald-600 dark:text-emerald-400",
              ring: "ring-emerald-500/30 bg-emerald-500/10",
            },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative z-10 flex flex-col items-center text-center group">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ring-4 ring-offset-4 ring-offset-background ${s.ring} group-hover:scale-110 transition-transform duration-500 shadow-xl backdrop-blur-md`}>
                  <Icon className={`w-10 h-10 ${s.color}`} />
                </div>
                <h3 className="text-2xl font-black mb-4">{s.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Section 4 – PRICING
// ────────────────────────────────────────────────────────────
function PricingSection() {
  return (
    <section id="pricing" className="py-32 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 text-sm rounded-full bg-emerald-500/5">
            Transparent Pricing
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            Invest in your{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Education
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">Stop failing classes. Start passing effortlessly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-xl p-10 hover:border-border/80 transition-colors">
            <h3 className="text-3xl font-black mb-2">Basic Starter</h3>
            <p className="text-muted-foreground mb-6">Perfect for testing the AI.</p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-black tracking-tighter">$0</span>
              <span className="text-lg text-muted-foreground font-medium">/ forever</span>
            </div>
            <Link href="/register">
              <Button variant="outline" className="w-full h-14 text-lg font-bold rounded-xl mb-8 border-2 hover:bg-muted">Get Basic Free</Button>
            </Link>
            <ul className="space-y-4">
              {[
                "Upload 5 PDFs total",
                "5 generative AI actions / day",
                "Standard Gemini Engine",
                "Basic flashcard viewer",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-3 font-medium text-foreground/80">
                  <CheckCircle className="w-5 h-5 text-muted-foreground" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Tier */}
          <div className="rounded-3xl border-2 border-violet-500 bg-gradient-to-b from-violet-500/10 to-background backdrop-blur-xl p-10 shadow-[0_0_50px_rgba(139,92,246,0.15)] relative transform md:-translate-y-4">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold px-6 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg shadow-violet-500/30 border border-white/20">
              <Star className="w-4 h-4" /> MOST POPULAR
            </div>
            <h3 className="text-3xl font-black mb-2">Pro Scholar</h3>
            <p className="text-violet-600 dark:text-violet-400 mb-6 font-medium">Unlimited cognitive power.</p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-black tracking-tighter">$12</span>
              <span className="text-lg text-muted-foreground font-medium">/ month</span>
            </div>
            <Link href="/upgrade">
              <Button className="w-full h-14 text-lg font-bold rounded-xl mb-8 bg-foreground text-background hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/20 transition-all duration-300">
                Upgrade to Pro
              </Button>
            </Link>
            <ul className="space-y-4">
              {[
                "Unlimited PDF uploads",
                "Unlimited AI Generations",
                "Priority Gemini Engine Queue",
                "Advanced Quiz Maker",
                "Detailed Knowledge Analytics"
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-3 font-medium text-foreground">
                  <CheckCircle className="w-5 h-5 text-violet-500" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Section 5 – CTA
// ────────────────────────────────────────────────────────────
function CtaSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto rounded-[3rem] overflow-hidden relative p-12 md:p-24 text-center border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-900" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-violet-500/50 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
            Stop Studying. <br />
            <span className="text-violet-300">Start Knowing.</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Join the elite students who are getting their time back while crushing their exams.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-16 px-10 rounded-full text-lg font-black bg-white text-violet-900 hover:bg-gray-100 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                Launch EduPilot AI
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-white/50 text-sm font-medium">No credit card required for Basic • Set up in 30s</p>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// HOME PAGE Export
// ────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CtaSection />
    </div>
  );
}
