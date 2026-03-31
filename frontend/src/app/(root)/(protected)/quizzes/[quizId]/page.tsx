"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Send,
  Zap,
} from "lucide-react";
import Link from "next/link";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/v1";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

interface Quiz {
  id: string;
  title: string;
  totalQuestions: number;
  questions: Question[];
  completedAt: string | null;
  score: number;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  EASY: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  HARD: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400",
};

export default function TakeQuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Map: questionIndex → selected option string
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`${API_BASE}/quizzes/quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data: Quiz = res.data.data;
        if (data.completedAt) {
          // Already completed — redirect to results
          router.replace(`/quizzes/${quizId}/result`);
          return;
        }
        setQuiz(data);
      } catch {
        setError("Failed to load quiz. It may not exist or you may not have access.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, router]);

  const handleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    const unanswered = quiz.questions
      .map((_, i) => i)
      .filter((i) => !answers[i]);
    if (unanswered.length > 0) {
      setSubmitError(
        `Please answer all questions. ${unanswered.length} question(s) remaining.`
      );
      // Jump to first unanswered
      setCurrentIndex(unanswered[0]);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = Object.entries(answers).map(([qi, selected]) => ({
        questionIndex: Number(qi),
        selectedAnswer: selected,
      }));
      await axios.post(
        `${API_BASE}/quizzes/quiz/${quizId}/submit`,
        { answers: payload },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      router.push(`/quizzes/${quizId}/result`);
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Submission failed."
          : "Submission failed.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-sm">Loading quiz…</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
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

  const question = quiz.questions[currentIndex];
  const total = quiz.questions.length;
  const answered = Object.keys(answers).length;
  const progress = (answered / total) * 100;
  const selected = answers[currentIndex];

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-muted/20">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <BrainCircuit className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold leading-tight">
                {quiz.title}
              </h1>
              <p className="text-xs text-muted-foreground">
                {answered} of {total} answered
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="shrink-0">
            <Link href="/quizzes">
              <ChevronLeft className="size-4" />
              Back
            </Link>
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mb-6 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <Card
          key={currentIndex}
          className="border-border/60 shadow-sm"
          style={{ animation: "fadeIn 0.25s ease-out" }}
        >
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-widest">
                Question {currentIndex + 1} / {total}
              </CardDescription>
              {question.difficulty && (
                <Badge
                  variant="outline"
                  className={DIFFICULTY_COLOR[question.difficulty]}
                >
                  {question.difficulty}
                </Badge>
              )}
            </div>
            <CardTitle className="text-base font-semibold leading-snug sm:text-lg">
              {question.question}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {question.options.map((option, oi) => {
              const isSelected = selected === option;
              return (
                <button
                  key={oi}
                  id={`option-${oi}`}
                  onClick={() => handleSelect(option)}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                    isSelected
                      ? "border-violet-400 bg-violet-50 text-violet-900 shadow-sm ring-2 ring-violet-200 dark:border-violet-600 dark:bg-violet-950/50 dark:text-violet-100 dark:ring-violet-800"
                      : "border-border/60 bg-card hover:border-border hover:bg-muted/40"
                  }`}
                  style={{ animation: `fadeInLeft 0.2s ease-out ${oi * 50}ms both` }}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                        isSelected
                          ? "border-violet-500 bg-violet-500 text-white dark:border-violet-400 dark:bg-violet-400"
                          : "border-border bg-background"
                      }`}
                    >
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {option}
                    {isSelected && (
                      <CheckCircle2 className="ml-auto size-4 shrink-0 text-violet-500" />
                    )}
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            id="prev-question-btn"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          {/* Question dots */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {quiz.questions.map((_, i) => (
              <button
                key={i}
                id={`dot-${i}`}
                onClick={() => setCurrentIndex(i)}
                className={`size-2.5 rounded-full transition-all ${
                  i === currentIndex
                    ? "scale-125 bg-violet-500"
                    : answers[i]
                    ? "bg-violet-300 dark:bg-violet-700"
                    : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {currentIndex < total - 1 ? (
            <Button
              size="sm"
              onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
              id="next-question-btn"
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || answered < total}
              id="submit-quiz-btn"
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {submitting ? "Submitting…" : "Submit Quiz"}
            </Button>
          )}
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {submitError}
          </div>
        )}

        {/* Quick submit if all answered but not on last q */}
        {answered === total && currentIndex !== total - 1 && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              id="submit-all-btn"
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
              {submitting ? "Submitting…" : "All answered — Submit Now"}
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
