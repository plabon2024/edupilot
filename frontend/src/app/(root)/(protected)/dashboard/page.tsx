"use client";

import { useEffect, useState } from "react";
import axios from "axios";
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
  FileText,
  BrainCircuit,
  Layers,
  Trophy,
  Star,
  CheckCircle2,
  Clock,
  BarChart3,
  BookOpen,
  ChevronRight,
  Loader2,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/v1";

interface DashboardData {
  overview: {
    totalDocuments: number;
    totalFlashcardSets: number;
    totalFlashcards: number;
    reviewedFlashcards: number;
    starredFlashcards: number;
    totalQuizzes: number;
    completedQuizzes: number;
    averageScore: number;
  };
  recentActivity: {
    documents: { id: string; title?: string; fileName: string; lastAccessed?: string }[];
    quizzes: {
      id: string;
      title: string;
      score: number;
      totalQuestions: number;
      completedAt: string | null;
    }[];
  };
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  gradient: string;
  shadow: string;
  sub?: string;
  index: number;
}

function StatCard({ label, value, icon: Icon, gradient, shadow, sub, index }: StatCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
      style={{ animation: `fadeInUp 0.4s ease-out ${index * 70}ms both` }}
    >
      <div className={`absolute -right-4 -top-4 size-20 rounded-full ${gradient} opacity-10 transition-all group-hover:opacity-20`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-3xl font-bold tabular-nums">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${gradient} ${shadow}`}>
          <Icon className="size-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="h-[108px] animate-pulse rounded-2xl border border-border/50 bg-muted/40" />
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/progress/dashboard`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setData(res.data.data);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const ov = data?.overview;

  const stats: StatCardProps[] = ov
    ? [
        {
          label: "Documents",
          value: ov.totalDocuments,
          icon: FileText,
          gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
          shadow: "shadow-lg shadow-blue-500/30",
          sub: "Uploaded PDFs",
          index: 0,
        },
        {
          label: "Flashcard Sets",
          value: ov.totalFlashcardSets,
          icon: Layers,
          gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
          shadow: "shadow-lg shadow-violet-500/30",
          sub: `${ov.totalFlashcards} total cards`,
          index: 1,
        },
        {
          label: "Quizzes",
          value: ov.totalQuizzes,
          icon: BrainCircuit,
          gradient: "bg-gradient-to-br from-emerald-500 to-green-600",
          shadow: "shadow-lg shadow-emerald-500/30",
          sub: `${ov.completedQuizzes} completed`,
          index: 2,
        },
        {
          label: "Avg. Score",
          value: `${ov.averageScore}%`,
          icon: Trophy,
          gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
          shadow: "shadow-lg shadow-amber-500/30",
          sub: "Across all quizzes",
          index: 3,
        },
        {
          label: "Cards Reviewed",
          value: ov.reviewedFlashcards,
          icon: CheckCircle2,
          gradient: "bg-gradient-to-br from-cyan-500 to-sky-600",
          shadow: "shadow-lg shadow-cyan-500/30",
          sub: `of ${ov.totalFlashcards} total`,
          index: 4,
        },
        {
          label: "Starred Cards",
          value: ov.starredFlashcards,
          icon: Star,
          gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
          shadow: "shadow-lg shadow-pink-500/30",
          sub: "Marked for review",
          index: 5,
        },
      ]
    : [];

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your study progress and recent activity
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboard}
            disabled={loading}
            id="refresh-dashboard-btn"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Quick Actions */}
        <div
          className="mb-8 rounded-2xl border border-border/50 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent p-5"
          style={{ animation: "fadeInUp 0.4s ease-out 420ms both" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="size-4 text-violet-500" />
            <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Quick Actions</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" asChild className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700">
              <Link href="/documents">
                <FileText className="size-3.5" /> View Documents
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/flashcards">
                <Layers className="size-3.5" /> Flashcards
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/quizzes">
                <BrainCircuit className="size-3.5" /> Quizzes
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/payment/history">
                <BarChart3 className="size-3.5" /> Billing
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Documents */}
          <Card
            className="border-border/60"
            style={{ animation: "fadeInUp 0.4s ease-out 490ms both" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="size-4 text-muted-foreground" />
                Recent Documents
              </CardTitle>
              <CardDescription>Your last accessed uploads</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />
                  ))}
                </div>
              ) : !data?.recentActivity.documents.length ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <FileText className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No documents yet</p>
                  <Button size="sm" asChild>
                    <Link href="/documents">Upload a Document</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.recentActivity.documents.map((doc, i) => (
                    <Link
                      key={doc.id}
                      href={`/documents/${doc.id}`}
                      className="group flex items-center justify-between rounded-lg border border-border/40 bg-card/50 px-3 py-2.5 transition-all hover:border-border hover:shadow-sm"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="size-4 shrink-0 text-blue-500" />
                        <span className="truncate text-sm font-medium">
                          {doc.title || doc.fileName}
                        </span>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Quizzes */}
          <Card
            className="border-border/60"
            style={{ animation: "fadeInUp 0.4s ease-out 560ms both" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="size-4 text-muted-foreground" />
                Recent Quizzes
              </CardTitle>
              <CardDescription>Your latest quiz activity</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />
                  ))}
                </div>
              ) : !data?.recentActivity.quizzes.length ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <BrainCircuit className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No quizzes yet</p>
                  <Button size="sm" asChild>
                    <Link href="/quizzes">Browse Quizzes</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.recentActivity.quizzes.map((quiz, i) => {
                    const done = !!quiz.completedAt;
                    return (
                      <Link
                        key={quiz.id}
                        href={done ? `/quizzes/${quiz.id}/result` : `/quizzes/${quiz.id}`}
                        className="group flex items-center justify-between rounded-lg border border-border/40 bg-card/50 px-3 py-2.5 transition-all hover:border-border hover:shadow-sm"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <BrainCircuit className="size-4 shrink-0 text-violet-500" />
                          <span className="truncate text-sm font-medium">{quiz.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {done ? (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                quiz.score >= 80
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                                  : quiz.score >= 50
                                  ? "border-blue-200 bg-blue-50 text-blue-700"
                                  : "border-red-200 bg-red-50 text-red-700"
                              }`}
                            >
                              <Trophy className="size-3" /> {quiz.score}%
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">
                              <Clock className="size-3" /> Pending
                            </Badge>
                          )}
                          <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
