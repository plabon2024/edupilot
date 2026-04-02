"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  FileText,
  Star,
  CheckCircle2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
  RefreshCw,
  AlertCircle,
  Eye,
  Filter,
} from "lucide-react";
import {
  getAllFlashcardSets,
  reviewFlashcard,
  toggleStarFlashcard,
} from "@/services/flashcard.services";
import type { FlashcardSet, FlashcardCard } from "@/services/flashcard.services";

const DIFF_COLOR: Record<string, string> = {
  EASY: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  HARD: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400",
};

export default function FlashcardsPage() {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState<"all" | "starred" | "unreviewed">("all");

  const fetchSets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Correct endpoint: GET /api/v1/flashcards
      const data = await getAllFlashcardSets();
      setSets(data);
      if (data.length > 0 && !selectedSet) setSelectedSet(data[0]);
    } catch {
      setError("Failed to load flashcards.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSets(); }, [fetchSets]);

  const filteredCards = (): FlashcardCard[] => {
    if (!selectedSet) return [];
    switch (filter) {
      case "starred": return selectedSet.cards.filter(c => c.isStarred);
      case "unreviewed": return selectedSet.cards.filter(c => c.reviewCount === 0);
      default: return selectedSet.cards;
    }
  };

  const cards = filteredCards();
  const current = cards[cardIndex];

  const next = () => { setFlipped(false); setCardIndex(i => Math.min(cards.length - 1, i + 1)); };
  const prev = () => { setFlipped(false); setCardIndex(i => Math.max(0, i - 1)); };
  const reset = () => { setCardIndex(0); setFlipped(false); };

  const markReviewed = async () => {
    if (!current) return;
    try {
      // Correct endpoint: POST /api/v1/flashcards/cards/:cardId/review
      await reviewFlashcard(current.id);
      const update = (s: FlashcardSet) => ({
        ...s,
        cards: s.cards.map(c => c.id === current.id ? { ...c, reviewCount: c.reviewCount + 1 } : c),
      });
      setSets(prev => prev.map(s => s.id === selectedSet?.id ? update(s) : s));
      setSelectedSet(prev => prev ? update(prev) : prev);
      next();
    } catch { /* silent */ }
  };

  const toggleStar = async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const card = selectedSet?.cards.find(c => c.id === cardId);
    if (!card) return;
    try {
      // Correct endpoint: PUT /api/v1/flashcards/cards/:cardId/star
      await toggleStarFlashcard(cardId);
      const update = (s: FlashcardSet) => ({
        ...s,
        cards: s.cards.map(c => c.id === cardId ? { ...c, isStarred: !c.isStarred } : c),
      });
      setSets(prev => prev.map(s => s.id === selectedSet?.id ? update(s) : s));
      setSelectedSet(prev => prev ? update(prev) : prev);
    } catch { /* silent */ }
  };

  const getDocName = (set: FlashcardSet) =>
    set.document?.title ?? set.document?.fileName ?? "Unknown Document";

  const totalReviewed = sets.reduce((acc, s) => acc + s.cards.filter(c => c.reviewCount > 0).length, 0);
  const totalStarred = sets.reduce((acc, s) => acc + s.cards.filter(c => c.isStarred).length, 0);
  const totalCards = sets.reduce((acc, s) => acc + s.cards.length, 0);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <Layers className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Flashcards</h1>
              <p className="text-sm text-muted-foreground">
                Study all your AI-generated flashcard sets
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchSets} disabled={loading} id="refresh-all-fc-btn">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Stats row */}
        {!loading && sets.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4" style={{ animation: "fadeInUp 0.35s ease-out both" }}>
            {[
              { label: "Total Sets", value: sets.length, icon: Layers, cls: "text-violet-500" },
              { label: "Cards Reviewed", value: `${totalReviewed}/${totalCards}`, icon: CheckCircle2, cls: "text-emerald-500" },
              { label: "Starred", value: totalStarred, icon: Star, cls: "text-amber-500" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3">
                <s.icon className={`size-5 shrink-0 ${s.cls}`} />
                <div>
                  <p className="text-xl font-bold tabular-nums">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card className="border-destructive/30 bg-destructive/5 text-center">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <AlertCircle className="size-8 text-destructive/60" />
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={fetchSets}>Retry</Button>
            </CardContent>
          </Card>
        ) : sets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-24 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <Inbox className="size-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No flashcards yet</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                  Open a document and use the AI tools to generate flashcard sets.
                </p>
              </div>
              <Button asChild>
                <Link href="/documents"><FileText className="size-4" />Browse Documents</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Set Sidebar */}
            <div className="space-y-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Sets ({sets.length})
              </p>
              <div className="space-y-1.5">
                {sets.map((s, i) => {
                  const reviewed = s.cards.filter(c => c.reviewCount > 0).length;
                  const pct = s.cards.length ? Math.round((reviewed / s.cards.length) * 100) : 0;
                  const isActive = selectedSet?.id === s.id;
                  const docName = getDocName(s);
                  return (
                    <button
                      key={s.id}
                      id={`set-btn-${i}`}
                      onClick={() => { setSelectedSet(s); setCardIndex(0); setFlipped(false); }}
                      className={`group w-full rounded-xl border p-3 text-left transition-all hover:shadow-sm ${
                        isActive
                          ? "border-violet-400/60 bg-violet-50/50 dark:border-violet-700/60 dark:bg-violet-950/20"
                          : "border-border/60 bg-card hover:border-border"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-violet-100 dark:bg-violet-900/50" : "bg-muted"}`}>
                          <Layers className={`size-3.5 ${isActive ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold">{docName}</p>
                          <p className="text-xs text-muted-foreground">{s.cards.length} cards</p>
                        </div>
                        {s.cards.some(c => c.isStarred) && (
                          <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{pct}% reviewed</p>
                    </button>
                  );
                })}
              </div>

              {/* Link to doc */}
              {selectedSet?.documentId && (
                <Button variant="ghost" size="sm" asChild className="mt-2 w-full justify-start text-xs">
                  <Link href={`/documents/${selectedSet.documentId}`}>
                    <FileText className="size-3.5" />
                    Open Document
                  </Link>
                </Button>
              )}
            </div>

            {/* Study View */}
            <div className="space-y-4">
              {selectedSet && (
                <>
                  {/* Top bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
                      <Filter className="ml-2 size-3 text-muted-foreground" />
                      {(["all", "starred", "unreviewed"] as const).map(f => (
                        <button
                          key={f}
                          id={`fc-filter-${f}`}
                          onClick={() => { setFilter(f); setCardIndex(0); setFlipped(false); }}
                          className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-all ${filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          {f === "starred" && "⭐ "}
                          {f === "unreviewed" && "🔵 "}
                          {f}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {cards.length > 0 ? `${cardIndex + 1} / ${cards.length}` : "0 cards"}
                    </span>
                  </div>

                  {cards.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                        <p className="text-sm text-muted-foreground">No cards match this filter.</p>
                        <Button size="sm" variant="outline" onClick={() => setFilter("all")}>Show All</Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Flip Card */}
                      <div style={{ perspective: "1000px" }}>
                        <div
                          id="main-flashcard"
                          onClick={() => setFlipped(f => !f)}
                          className="relative min-h-[260px] cursor-pointer select-none transition-all duration-500"
                          style={{
                            transformStyle: "preserve-3d",
                            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                          }}
                        >
                          {/* Front */}
                          <Card
                            className="absolute inset-0 flex flex-col items-center justify-center border-border/60 shadow-sm"
                            style={{ backfaceVisibility: "hidden" }}
                          >
                            <CardContent className="flex flex-col items-center gap-4 p-8 text-center w-full">
                              <Badge variant="outline" className="text-xs text-muted-foreground">Question</Badge>
                              <p className="text-xl font-semibold leading-snug">{current?.question}</p>
                              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                                {current?.difficulty && (
                                  <Badge variant="outline" className={DIFF_COLOR[current.difficulty]}>
                                    {current.difficulty}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs gap-1">
                                  <Eye className="size-3" /> {current?.reviewCount}×
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground animate-pulse">Click to flip</p>
                            </CardContent>
                          </Card>

                          {/* Back */}
                          <Card
                            className="absolute inset-0 flex flex-col items-center justify-center border-violet-300/60 bg-gradient-to-b from-violet-50/40 to-transparent shadow-sm dark:border-violet-700/40 dark:from-violet-950/20"
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                          >
                            <CardContent className="flex flex-col items-center gap-4 p-8 text-center w-full">
                              <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-400">
                                Answer
                              </Badge>
                              <p className="text-base leading-relaxed text-muted-foreground">{current?.answer}</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between gap-3">
                        <Button variant="outline" size="sm" onClick={prev} disabled={cardIndex === 0} id="fc-prev">
                          <ChevronLeft className="size-4" /> Prev
                        </Button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => current && toggleStar(current.id, e)}
                            id="fc-star"
                            className={`rounded-lg border p-2 transition-all hover:scale-110 ${
                              current?.isStarred
                                ? "border-amber-300 bg-amber-50 text-amber-500 dark:border-amber-700 dark:bg-amber-950/30"
                                : "border-border/50 text-muted-foreground hover:border-amber-300"
                            }`}
                          >
                            <Star className={`size-4 ${current?.isStarred ? "fill-amber-400" : ""}`} />
                          </button>
                          <button
                            onClick={markReviewed}
                            id="fc-mark-reviewed"
                            title="Mark reviewed & go next"
                            className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-600 transition-all hover:scale-110 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                          >
                            <CheckCircle2 className="size-4" />
                          </button>
                          <button
                            onClick={reset}
                            id="fc-reset"
                            className="rounded-lg border border-border/50 p-2 text-muted-foreground transition-all hover:scale-110 hover:border-border"
                          >
                            <RotateCcw className="size-4" />
                          </button>
                        </div>
                        <Button variant="outline" size="sm" onClick={next} disabled={cardIndex === cards.length - 1} id="fc-next">
                          Next <ChevronRight className="size-4" />
                        </Button>
                      </div>

                      {/* Progress dots */}
                      <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                        {cards.map((c, i) => (
                          <button
                            key={c.id}
                            onClick={() => { setCardIndex(i); setFlipped(false); }}
                            className={`size-2 rounded-full transition-all ${
                              i === cardIndex
                                ? "scale-125 bg-violet-500"
                                : c.reviewCount > 0
                                ? "bg-violet-300 dark:bg-violet-700"
                                : "bg-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
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
