"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Layers,
  FileText,
  Star,
  Target,
  Trophy,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { getDashboardProgress } from "@/services/progress.services";
import type { ProgressDashboard } from "@/services/progress.services";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay?: number;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl border border-border/50 bg-card px-5 py-4 shadow-sm transition-all hover:shadow-md"
      style={{ animation: `fadeInUp 0.4s ease-out ${delay}ms both` }}
    >
      <div
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="size-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/70">{sub}</p>}
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Correct endpoint: GET /api/v1/progress/dashboard
      const result = await getDashboardProgress();
      setData(result);
    } catch {
      setError("Failed to load progress data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const ov = data?.overview;
  const ra = data?.recentActivity;

  const quizCompletionPct =
    ov && ov.totalQuizzes > 0
      ? Math.round((ov.completedQuizzes / ov.totalQuizzes) * 100)
      : 0;
  const flashcardReviewPct =
    ov && ov.totalFlashcards > 0
      ? Math.round((ov.reviewedFlashcards / ov.totalFlashcards) * 100)
      : 0;

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <BarChart3 className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
              <p className="text-sm text-muted-foreground">
                Your learning overview and activity
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            id="refresh-progress-btn"
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
              <Button variant="outline" onClick={fetchData}>Retry</Button>
            </CardContent>
          </Card>
        ) : !data ? null : (
          <div className="space-y-8">
            {/* Overview Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <StatCard
                icon={FileText}
                label="Documents"
                value={ov!.totalDocuments}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
                delay={0}
              />
              <StatCard
                icon={Layers}
                label="Flashcard Sets"
                value={ov!.totalFlashcardSets}
                sub={`${ov!.totalFlashcards} total cards`}
                color="bg-gradient-to-br from-violet-500 to-purple-600"
                delay={60}
              />
              <StatCard
                icon={BrainCircuit}
                label="Quizzes"
                value={`${ov!.completedQuizzes}/${ov!.totalQuizzes}`}
                sub="completed"
                color="bg-gradient-to-br from-emerald-500 to-green-600"
                delay={120}
              />
              <StatCard
                icon={Trophy}
                label="Avg. Score"
                value={`${ov!.averageScore}%`}
                color="bg-gradient-to-br from-amber-500 to-orange-500"
                delay={180}
              />
            </div>

            {/* Progress bars */}
            <div
              className="grid gap-4 sm:grid-cols-2"
              style={{ animation: "fadeInUp 0.4s ease-out 200ms both" }}
            >
              {/* Quiz completion */}
              <Card className="border-border/60">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Target className="size-4 text-emerald-500" />
                      Quiz Completion
                    </div>
                    <Badge variant="outline" className="text-xs tabular-nums">
                      {quizCompletionPct}%
                    </Badge>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-1000"
                      style={{ width: `${quizCompletionPct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {ov!.completedQuizzes} of {ov!.totalQuizzes} quizzes completed
                  </p>
                </CardContent>
              </Card>

              {/* Flashcard review */}
              <Card className="border-border/60">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Layers className="size-4 text-violet-500" />
                      Flashcard Review
                    </div>
                    <Badge variant="outline" className="text-xs tabular-nums">
                      {flashcardReviewPct}%
                    </Badge>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-1000"
                      style={{ width: `${flashcardReviewPct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {ov!.reviewedFlashcards} of {ov!.totalFlashcards} cards reviewed ·{" "}
                    <Star className="inline size-3 fill-amber-400 text-amber-400" />{" "}
                    {ov!.starredFlashcards} starred
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div
              className="grid gap-6 sm:grid-cols-2"
              style={{ animation: "fadeInUp 0.4s ease-out 300ms both" }}
            >
              {/* Recent Documents */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="size-4 text-muted-foreground" />
                    Recent Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {ra!.documents.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      No documents yet.
                    </p>
                  ) : (
                    ra!.documents.map((doc, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2"
                      >
                        <FileText className="size-4 shrink-0 text-blue-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">
                            {doc.title || doc.fileName}
                          </p>
                          {doc.lastAccessed && (
                            <p className="mt-0.5 text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="size-2.5" />
                              {new Date(doc.lastAccessed).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="mt-1 w-full text-xs"
                    id="view-all-docs-btn"
                  >
                    <Link href="/documents">
                      View all documents
                      <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Quizzes */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <BrainCircuit className="size-4 text-muted-foreground" />
                    Recent Quizzes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {ra!.quizzes.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      No quizzes yet.
                    </p>
                  ) : (
                    ra!.quizzes.map((quiz, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2"
                      >
                        <div
                          className={`flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white ${
                            quiz.completedAt
                              ? quiz.score >= 80
                                ? "bg-emerald-500"
                                : quiz.score >= 50
                                ? "bg-blue-500"
                                : "bg-red-500"
                              : "bg-amber-500"
                          }`}
                        >
                          {quiz.completedAt ? `${quiz.score}%` : "—"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{quiz.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {quiz.totalQuestions}Q
                            {quiz.document?.title ? ` · ${quiz.document.title}` : ""}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="mt-1 w-full text-xs"
                    id="view-all-quizzes-btn"
                  >
                    <Link href="/quizzes">
                      View all quizzes
                      <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick links */}
            <div
              className="flex flex-wrap gap-3"
              style={{ animation: "fadeInUp 0.4s ease-out 400ms both" }}
            >
              <Button asChild variant="outline" size="sm" id="goto-flashcards">
                <Link href="/flashcards">
                  <Layers className="size-4" /> Flashcards
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" id="goto-quizzes">
                <Link href="/quizzes">
                  <BrainCircuit className="size-4" /> Quizzes
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" id="goto-documents">
                <Link href="/documents">
                  <FileText className="size-4" /> Documents
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" id="goto-pricing">
                <Link href="/pricing">
                  <TrendingUp className="size-4" /> Upgrade Plan
                </Link>
              </Button>
            </div>
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
