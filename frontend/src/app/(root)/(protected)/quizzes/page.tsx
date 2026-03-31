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
  BrainCircuit,
  FileText,
  ChevronRight,
  Trophy,
  Clock,
  CheckCircle2,
  Loader2,
  Inbox,
  RefreshCw,
  XCircle,
  Target,
} from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/v1";

interface Document {
  id: string;
  title?: string;
  fileName: string;
  createdAt: string;
}

interface Quiz {
  id: string;
  title: string;
  totalQuestions: number;
  score: number;
  completedAt: string | null;
  createdAt: string;
  documentId: { id: string; title?: string; fileName: string };
}

function ScoreBadge({ score, completed }: { score: number; completed: boolean }) {
  if (!completed) {
    return (
      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
        <Clock className="size-3" /> Not taken
      </Badge>
    );
  }
  const color =
    score >= 80
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
      : score >= 50
      ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400"
      : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400";
  return (
    <Badge variant="outline" className={color}>
      <Trophy className="size-3" /> {score}%
    </Badge>
  );
}

function QuizCard({ quiz, index }: { quiz: Quiz; index: number }) {
  const completed = !!quiz.completedAt;
  return (
    <div
      className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
      style={{ animation: `fadeInUp 0.35s ease-out ${index * 60}ms both` }}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-200/50 dark:border-violet-800/30">
          <BrainCircuit className="size-4 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium leading-tight">{quiz.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {quiz.totalQuestions} questions •{" "}
            {new Date(quiz.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <ScoreBadge score={quiz.score} completed={completed} />
        {completed ? (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/quizzes/${quiz.id}/result`}>
              <CheckCircle2 className="size-3.5" /> Results
            </Link>
          </Button>
        ) : (
          <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700" asChild>
            <Link href={`/quizzes/${quiz.id}`}>
              <Target className="size-3.5" /> Take Quiz
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function QuizzesPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [quizMap, setQuizMap] = useState<Record<string, Quiz[]>>({});
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = () => ({ Authorization: `Bearer ${getToken()}` });

  // Load documents on mount
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/documents`, { headers: headers() });
        const docs: Document[] = res.data.data || [];
        setDocuments(docs);
        if (docs.length > 0) setSelectedDoc(docs[0].id);
      } catch {
        setError("Failed to load documents.");
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchDocs();
  }, []);

  // Load quizzes whenever selected doc changes
  useEffect(() => {
    if (!selectedDoc) return;
    if (quizMap[selectedDoc]) return; // already fetched

    const fetchQuizzes = async () => {
      setLoadingQuizzes(true);
      try {
        const res = await axios.get(`${API_BASE}/quizzes/${selectedDoc}`, { headers: headers() });
        setQuizMap((prev) => ({ ...prev, [selectedDoc]: res.data.data || [] }));
      } catch {
        setQuizMap((prev) => ({ ...prev, [selectedDoc]: [] }));
      } finally {
        setLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, [selectedDoc]);

  const currentQuizzes = selectedDoc ? quizMap[selectedDoc] ?? [] : [];
  const selectedDocName = documents.find((d) => d.id === selectedDoc);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
            <BrainCircuit className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quizzes</h1>
            <p className="text-sm text-muted-foreground">
              Test your knowledge on your uploaded documents
            </p>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-center gap-2 py-4 text-sm text-destructive">
              <XCircle className="size-4" /> {error}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Document Sidebar */}
          <Card className="h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="size-4 text-muted-foreground" />
                Documents
              </CardTitle>
              <CardDescription className="text-xs">
                Select a document to view its quizzes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingDocs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : documents.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground px-4">
                  No documents uploaded yet.
                </div>
              ) : (
                <div className="flex flex-col pb-2">
                  {documents.map((doc) => {
                    const quizCount = quizMap[doc.id]?.length ?? null;
                    const isActive = selectedDoc === doc.id;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc.id)}
                        className={`flex items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                          isActive ? "bg-muted font-medium" : ""
                        }`}
                      >
                        <span className="truncate text-sm">
                          {doc.title || doc.fileName}
                        </span>
                        {quizCount !== null && (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            {quizCount}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quiz List */}
          <div className="space-y-4">
            {selectedDocName && (
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-base truncate">
                  {selectedDocName.title || selectedDocName.fileName}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => {
                  if (selectedDoc) {
                    setQuizMap((prev) => { const next = { ...prev }; delete next[selectedDoc]; return next; });
                  }
                }}>
                  <RefreshCw className="size-3.5" /> Refresh
                </Button>
              </div>
            )}

            {loadingQuizzes ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-[72px] animate-pulse rounded-xl border border-border/50 bg-muted/40" />
                ))}
              </div>
            ) : !selectedDoc ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                  <Inbox className="size-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Select a document to view quizzes</p>
                </CardContent>
              </Card>
            ) : currentQuizzes.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                    <BrainCircuit className="size-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">No quizzes yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Open the document and use the AI tools to generate a quiz.
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/documents/${selectedDoc}`}>
                      Open Document
                      <ChevronRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {currentQuizzes.map((quiz, i) => (
                  <QuizCard key={quiz.id} quiz={quiz} index={i} />
                ))}
              </div>
            )}
          </div>
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
