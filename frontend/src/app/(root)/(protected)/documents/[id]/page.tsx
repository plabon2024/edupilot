"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText, BrainCircuit, Layers, MessageSquare, Loader2,
  AlertCircle, ChevronLeft, Sparkles, Send, CheckCircle2,
  XCircle, Lightbulb, BookOpen, ChevronRight, User, Bot
} from "lucide-react";
import {
  getDocument,
  type Document,
} from "@/services/document.services";
import {
  chatWithDocument,
  generateFlashcards,
  generateQuiz,
  generateSummary,
  explainConcept,
  getChatHistory,
  type ChatMessage,
} from "@/services/ai.services";
import axios from "axios";
import ReactMarkdown from "react-markdown";

type Tab = "chat" | "summary" | "explain";

const STATUS = {
  READY: {
    label: "Ready",
    icon: CheckCircle2,
    cls: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  PROCESSING: {
    label: "Processing…",
    icon: Loader2,
    cls: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    cls: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400",
  },
};

function getErrMsg(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.message ||
      err.response?.data?.error?.message ||
      fallback
    );
  }
  return fallback;
}

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("chat");

  // Chat state
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Summary state
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Explain state
  const [concept, setConcept] = useState("");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);

  // Generation state
  const [genFC, setGenFC] = useState(false);
  const [genQuiz, setGenQuiz] = useState(false);
  const [genMsg, setGenMsg] = useState<string | null>(null);

  // Load document + chat history
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        // GET /api/v1/documents/:id — auth via axiosInstance interceptor
        const docData = await getDocument(id);
        setDoc(docData);
      } catch {
        setError("Document not found.");
      } finally {
        setLoading(false);
      }
    };

    const loadHistory = async () => {
      try {
        // GET /api/v1/ai/chat-history/:documentId — no AI credits consumed
        const history = await getChatHistory(id);
        setMsgs(history.map((m) => ({ role: m.role.toLowerCase() as "user" | "assistant", content: m.content })));
      } catch {
        // Non-fatal — chat history is optional
      }
    };

    load();
    loadHistory();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // POST /api/v1/ai/chat — consumes AI credits
  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const question = chatInput.trim();
    setChatInput("");
    setMsgs((p) => [...p, { role: "user", content: question }]);
    setChatLoading(true);
    try {
      const data = await chatWithDocument(id, question);
      setMsgs((p) => [...p, { role: "assistant", content: data?.answer || "" }]);
    } catch (err) {
      setMsgs((p) => [
        ...p,
        { role: "assistant", content: `⚠️ ${getErrMsg(err, "Failed to respond. Try again.")}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // POST /api/v1/ai/generate-summary — consumes AI credits
  const genSummary = async () => {
    setSummaryLoading(true);
    setSummary(null);
    try {
      const data = await generateSummary(id);
      setSummary(data?.summary || "");
    } catch (err) {
      setSummary(getErrMsg(err, "Failed to generate summary. Please try again."));
    } finally {
      setSummaryLoading(false);
    }
  };

  // POST /api/v1/ai/explain-concept — consumes AI credits
  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || explainLoading) return;
    setExplainLoading(true);
    setExplanation(null);
    try {
      const data = await explainConcept(id, concept.trim());
      setExplanation(data?.explanation || "");
    } catch (err) {
      setExplanation(getErrMsg(err, "Failed to explain. Try again."));
    } finally {
      setExplainLoading(false);
    }
  };

  // POST /api/v1/ai/generate-flashcards — consumes AI credits
  const handleGenerateFlashcards = async () => {
    setGenFC(true);
    setGenMsg(null);
    try {
      await generateFlashcards(id);
      setGenMsg("✅ Flashcards generated!");
    } catch (err) {
      setGenMsg(`❌ ${getErrMsg(err, "Failed. Try again.")}`);
    } finally {
      setGenFC(false);
    }
  };

  // POST /api/v1/ai/generate-quiz — consumes AI credits
  const handleGenerateQuiz = async () => {
    setGenQuiz(true);
    setGenMsg(null);
    try {
      await generateQuiz(id);
      setGenMsg("✅ Quiz generated!");
    } catch (err) {
      setGenMsg(`❌ ${getErrMsg(err, "Failed. Try again.")}`);
    } finally {
      setGenQuiz(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );

  if (error || !doc)
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertCircle className="size-10 text-destructive/60" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" asChild>
              <Link href="/documents">Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  const st = STATUS[doc.status];
  const StIcon = st.icon;

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" asChild className="mb-5 -ml-2">
          <Link href="/documents">
            <ChevronLeft className="size-4" />
            Documents
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* LEFT */}
          <div className="space-y-5">
            <Card className="border-border/60">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30">
                      <FileText className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate">{doc.title}</CardTitle>
                      <CardDescription className="truncate">{doc.fileName}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={st.cls}>
                    <StIcon
                      className={`size-3 ${doc.status === "PROCESSING" ? "animate-spin" : ""}`}
                    />
                    {st.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/documents/${id}/flashcard`}
                    className="group flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-3 text-sm transition-all hover:border-border hover:shadow-sm"
                  >
                    <Layers className="size-4 text-violet-500" />
                    <span className="font-semibold">{doc.flashcardCount}</span>
                    <span className="text-muted-foreground">flashcard sets</span>
                    <ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                  <Link
                    href="/quizzes"
                    className="group flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-3 text-sm transition-all hover:border-border hover:shadow-sm"
                  >
                    <BrainCircuit className="size-4 text-emerald-500" />
                    <span className="font-semibold">{doc.quizCount}</span>
                    <span className="text-muted-foreground">quizzes</span>
                    <ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </div>

                <div className="rounded-xl border border-violet-200/50 bg-violet-500/5 p-4 dark:border-violet-800/30">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="size-4 text-violet-500" />
                    <p className="text-sm font-semibold">Generate with AI</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={genFC || doc.status !== "READY"}
                      onClick={handleGenerateFlashcards}
                      id="gen-fc-btn"
                      className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                    >
                      {genFC ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Layers className="size-3.5" />
                      )}
                      {genFC ? "Generating…" : "Flashcards"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={genQuiz || doc.status !== "READY"}
                      onClick={handleGenerateQuiz}
                      id="gen-quiz-btn"
                    >
                      {genQuiz ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <BrainCircuit className="size-3.5" />
                      )}
                      {genQuiz ? "Generating…" : "Quiz"}
                    </Button>
                  </div>
                  {genMsg && <p className="mt-2 text-xs text-muted-foreground">{genMsg}</p>}
                  {doc.status !== "READY" && (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      Document must finish processing first.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {doc.filePath && (
              <Card className="overflow-hidden border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" /> PDF Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <iframe
                    src={doc.filePath}
                    title="Document"
                    className="h-[480px] w-full rounded-b-xl"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT: AI panel */}
          <Card className="flex flex-col border-border/60 min-h-[580px]">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-violet-500" /> AI Assistant
              </CardTitle>
              <div className="mt-3 flex rounded-lg border border-border/50 bg-muted/30 p-1">
                {(
                  [
                    { id: "chat", label: "Chat", icon: MessageSquare },
                    { id: "summary", label: "Summary", icon: BookOpen },
                    { id: "explain", label: "Explain", icon: Lightbulb },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    id={`tab-${t.id}`}
                    onClick={() => setTab(t.id as Tab)}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                      tab === t.id
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <t.icon className="size-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col pt-4 overflow-hidden">
              {/* CHAT TAB */}
              {tab === "chat" && (
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {msgs.length === 0 && (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <MessageSquare className="mx-auto mb-2 size-8 opacity-30" />
                          <p className="text-sm">Ask anything about this document</p>
                        </div>
                      </div>
                    )}
                    {msgs.map((m, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div
                          className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-full ${
                            m.role === "user"
                              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                        </div>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                            m.role === "user"
                              ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-tr-sm"
                              : "bg-muted text-foreground prose prose-sm dark:prose-invert max-w-none rounded-tl-sm shadow-sm"
                          }`}
                        >
                          {m.role === "user" ? (
                            m.content
                          ) : (
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          )}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="rounded-2xl bg-muted px-4 py-3">
                          <div className="flex gap-1">
                            {[0, 150, 300].map((d) => (
                              <span
                                key={d}
                                className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                                style={{ animationDelay: `${d}ms` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={sendChat} className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about this document…"
                      disabled={chatLoading || doc.status !== "READY"}
                      className="flex-1 rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
                      id="chat-input"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={chatLoading || !chatInput.trim() || doc.status !== "READY"}
                      id="chat-send-btn"
                      className="rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                    >
                      <Send className="size-4" />
                    </Button>
                  </form>
                </div>
              )}

              {/* SUMMARY TAB */}
              {tab === "summary" && (
                <div className="flex flex-1 flex-col gap-4">
                  <Button
                    onClick={genSummary}
                    disabled={summaryLoading || doc.status !== "READY"}
                    id="gen-summary-btn"
                    className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                  >
                    {summaryLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {summaryLoading ? "Generating…" : summary ? "Regenerate" : "Generate Summary"}
                  </Button>
                  {summary ? (
                    <div className="flex-1 overflow-y-auto rounded-xl border border-border/50 bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                  ) : (
                    !summaryLoading && (
                      <div className="flex flex-1 items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <BookOpen className="mx-auto mb-2 size-8 opacity-30" />
                          <p className="text-sm">Generate an AI summary of your PDF</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* EXPLAIN TAB */}
              {tab === "explain" && (
                <div className="flex flex-1 flex-col gap-4">
                  <form onSubmit={handleExplain} className="flex gap-2">
                    <input
                      type="text"
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                      placeholder="e.g. photosynthesis, quantum entanglement…"
                      disabled={explainLoading || doc.status !== "READY"}
                      className="flex-1 rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
                      id="explain-input"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={explainLoading || !concept.trim() || doc.status !== "READY"}
                      id="explain-btn"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                    >
                      {explainLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Lightbulb className="size-4" />
                      )}
                      Explain
                    </Button>
                  </form>
                  {explanation ? (
                    <div className="flex-1 overflow-y-auto rounded-xl border border-amber-200/50 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-950/10 p-4 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{explanation}</ReactMarkdown>
                    </div>
                  ) : (
                    !explainLoading && (
                      <div className="flex flex-1 items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <Lightbulb className="mx-auto mb-2 size-8 opacity-30" />
                          <p className="text-sm">Enter a concept to explain from this document</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
