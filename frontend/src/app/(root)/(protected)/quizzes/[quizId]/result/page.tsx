"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
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
  Trophy,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ChevronLeft,
  Lightbulb,
  LayoutDashboard,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/v1";

interface ResultItem {
  questionIndex: number;
  question: string;
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
  explanation: string;
}

interface QuizResultData {
  quiz: {
    id: string;
    title: string;
    score: number;
    totalQuestions: number;
    completedAt: string;
    document: { title?: string; fileName?: string } | null;
  };
  results: ResultItem[];
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? "#10b981" : score >= 50 ? "#3b82f6" : "#ef4444";
  const label =
    score >= 80 ? "Excellent!" : score >= 60 ? "Good Job!" : score >= 40 ? "Keep Trying" : "Needs Work";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-36">
        <svg className="size-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r={radius}
            fill="none" strokeWidth="10"
            className="stroke-muted"
          />
          <circle
            cx="60" cy="60" r={radius}
            fill="none" strokeWidth="10"
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums">{score}%</span>
          <Trophy className="size-4 text-muted-foreground" />
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

export default function QuizResultPage() {
  const { quizId } = useParams<{ quizId: string }>();

  const [resultData, setResultData] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/quizzes/quiz/${quizId}/results`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        setResultData(res.data.data);
      } catch {
        setError("Could not load quiz results.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [quizId]);

  const toggleExpand = (idx: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-sm">Loading results…</p>
        </div>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md border-destructive/30 bg-destructive/5 text-center">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertCircle className="size-12 text-destructive/60" />
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button variant="outline" asChild>
              <Link href="/quizzes">Back to Quizzes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { quiz, results } = resultData;
  const correct = results.filter((r) => r.isCorrect).length;
  const total = quiz.totalQuestions;

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-muted/20">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {/* Back nav */}
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link href="/quizzes">
            <ChevronLeft className="size-4" />
            All Quizzes
          </Link>
        </Button>

        {/* Score Summary Card */}
        <Card className="mb-6 overflow-hidden border-border/60 shadow-md">
          <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent px-6 pt-6 pb-0">
            <div className="flex flex-col items-center gap-4 pb-6 sm:flex-row sm:items-start sm:gap-6">
              <ScoreGauge score={quiz.score} />
              <div className="flex-1 text-center sm:text-left">
                <div className="mb-1 flex items-center justify-center gap-1.5 sm:justify-start">
                  <BarChart3 className="size-4 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Quiz Results
                  </span>
                </div>
                <h1 className="text-xl font-bold sm:text-2xl">{quiz.title}</h1>
                {quiz.document && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {quiz.document.title || quiz.document.fileName}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                  <div className="rounded-lg border border-border/50 bg-background px-4 py-2 text-center">
                    <p className="text-xs text-muted-foreground">Correct</p>
                    <p className="text-xl font-bold text-emerald-600">{correct}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-background px-4 py-2 text-center">
                    <p className="text-xs text-muted-foreground">Incorrect</p>
                    <p className="text-xl font-bold text-red-500">{total - correct}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-background px-4 py-2 text-center">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">{total}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="flex flex-wrap justify-center gap-3 py-4 sm:justify-start">
            <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700" id="back-to-quizzes-btn">
              <Link href="/quizzes">
                <ChevronLeft className="size-4" /> Back to Quizzes
              </Link>
            </Button>
            <Button variant="outline" asChild id="dashboard-btn">
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" /> Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Detailed Question Review */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Question Review</h2>
          <span className="text-xs text-muted-foreground">
            Click a question to see explanation
          </span>
        </div>

        <div className="space-y-3">
          {results.map((item, i) => {
            const isOpen = expanded.has(i);
            return (
              <Card
                key={i}
                id={`result-item-${i}`}
                className={`border-border/60 transition-shadow hover:shadow-sm ${
                  item.isCorrect
                    ? "border-l-4 border-l-emerald-400"
                    : "border-l-4 border-l-red-400"
                }`}
                style={{ animation: `fadeInUp 0.3s ease-out ${i * 50}ms both` }}
              >
                <CardHeader
                  className="cursor-pointer pb-0"
                  onClick={() => toggleExpand(i)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {item.isCorrect ? (
                        <CheckCircle2 className="size-5 text-emerald-500" />
                      ) : (
                        <XCircle className="size-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardDescription className="text-xs mb-1">
                        Question {i + 1}
                      </CardDescription>
                      <CardTitle className="text-sm font-medium leading-snug">
                        {item.question}
                      </CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        item.isCorrect
                          ? "shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "shrink-0 border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
                      }
                    >
                      {item.isCorrect ? "✓ Correct" : "✗ Wrong"}
                    </Badge>
                  </div>
                </CardHeader>

                {isOpen && (
                  <CardContent className="pt-4 space-y-3">
                    {/* Options */}
                    <div className="space-y-2">
                      {item.options.map((opt, oi) => {
                        const isCorrect = opt === item.correctAnswer;
                        const isSelected = opt === item.selectedAnswer;
                        return (
                          <div
                            key={oi}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                              isCorrect
                                ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                                : isSelected && !isCorrect
                                ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
                                : "border-border/40 bg-muted/20"
                            }`}
                          >
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrect && (
                              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                            )}
                            {isSelected && !isCorrect && (
                              <XCircle className="size-4 shrink-0 text-red-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {item.explanation && (
                      <div className="flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50/60 px-3 py-3 text-sm dark:border-amber-800/30 dark:bg-amber-950/20">
                        <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        <p className="text-amber-800 dark:text-amber-300">
                          <span className="font-semibold">Explanation: </span>
                          {item.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
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
