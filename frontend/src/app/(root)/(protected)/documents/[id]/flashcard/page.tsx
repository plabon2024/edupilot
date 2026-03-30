"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, Star, CheckCircle2, RefreshCw,
  Layers, Loader2, AlertCircle, Inbox, RotateCcw, Eye, EyeOff,
  Trash2, Sparkles,
} from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/v1";

interface Card_ {
  id: string;
  question: string;
  answer: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  reviewCount: number;
  isStarred: boolean;
  lastReviewed?: string;
}
interface FlashcardSet {
  id: string;
  documentId: { title?: string; fileName?: string };
  cards: Card_[];
  createdAt: string;
}

const DIFF_COLOR: Record<string, string> = {
  EASY: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  HARD: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400",
};

export default function FlashcardStudyPage() {
  const { id } = useParams<{ id: string }>();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState<"all" | "starred" | "unreviewed">("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const token = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

  const fetchSets = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await axios.get(`${API_BASE}/flashcards/${id}`, { headers: authHeaders() });
      const data: FlashcardSet[] = r.data.data || [];
      setSets(data);
      if (data.length > 0 && !selectedSet) setSelectedSet(data[0]);
    } catch { setError("Failed to load flashcards."); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchSets(); }, [fetchSets]);

  const filteredCards = (): Card_[] => {
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
      await axios.post(`${API_BASE}/flashcards/${current.id}/review`, {}, { headers: authHeaders() });
      setSets(prev => prev.map(s =>
        s.id === selectedSet?.id
          ? { ...s, cards: s.cards.map(c => c.id === current.id ? { ...c, reviewCount: c.reviewCount + 1, lastReviewed: new Date().toISOString() } : c) }
          : s
      ));
      if (selectedSet) setSelectedSet(prev => prev ? { ...prev, cards: prev.cards.map(c => c.id === current.id ? { ...c, reviewCount: c.reviewCount + 1 } : c) } : prev);
      next();
    } catch { /* silent */ }
  };

  const toggleStar = async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.put(`${API_BASE}/flashcards/${cardId}/star`, {}, { headers: authHeaders() });
      const update = (s: FlashcardSet) => ({ ...s, cards: s.cards.map(c => c.id === cardId ? { ...c, isStarred: !c.isStarred } : c) });
      setSets(prev => prev.map(s => s.id === selectedSet?.id ? update(s) : s));
      setSelectedSet(prev => prev ? update(prev) : prev);
    } catch { /* silent */ }
  };

  const deleteSet = async (setId: string) => {
    if (!confirm("Delete this flashcard set? This cannot be undone.")) return;
    setDeleting(setId);
    try {
      await axios.delete(`${API_BASE}/flashcards/${setId}`, { headers: authHeaders() });
      const remaining = sets.filter(s => s.id !== setId);
      setSets(remaining);
      if (selectedSet?.id === setId) { setSelectedSet(remaining[0] || null); setCardIndex(0); setFlipped(false); }
    } catch { alert("Failed to delete."); }
    finally { setDeleting(null); }
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link href={`/documents/${id}`}><ChevronLeft className="size-4" />Document</Link>
            </Button>
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <Layers className="size-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Flashcards</h1>
              <p className="text-xs text-muted-foreground">{sets.length} set{sets.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchSets} disabled={loading} id="refresh-fc-btn">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
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
            <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Inbox className="size-7 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">No flashcards yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Go back to the document and use AI to generate flashcards.</p>
              </div>
              <Button asChild><Link href={`/documents/${id}`}><Sparkles className="size-4" />Generate Flashcards</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            {/* Sidebar: set list */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">Sets</p>
              {sets.map((s, i) => {
                const reviewed = s.cards.filter(c => c.reviewCount > 0).length;
                const pct = s.cards.length ? Math.round((reviewed / s.cards.length) * 100) : 0;
                const isActive = selectedSet?.id === s.id;
                return (
                  <div key={s.id} id={`set-${i}`}
                    className={`group relative rounded-xl border p-3 cursor-pointer transition-all ${isActive ? "border-violet-400/60 bg-violet-50/50 dark:border-violet-700/60 dark:bg-violet-950/20" : "border-border/60 bg-card hover:border-border hover:shadow-sm"}`}
                    onClick={() => { setSelectedSet(s); setCardIndex(0); setFlipped(false); }}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate flex-1">Set {i + 1}</p>
                      <button onClick={e => { e.stopPropagation(); deleteSet(s.id); }} disabled={deleting === s.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive rounded p-0.5">
                        {deleting === s.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.cards.length} cards</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{pct}% reviewed</p>
                  </div>
                );
              })}
            </div>

            {/* Study view */}
            <div className="space-y-4">
              {selectedSet && (
                <>
                  {/* Filters + progress */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
                      {(["all", "starred", "unreviewed"] as const).map(f => (
                        <button key={f} id={`filter-${f}`} onClick={() => { setFilter(f); setCardIndex(0); setFlipped(false); }}
                          className={`rounded-md px-3 py-1 text-xs font-medium transition-all capitalize ${filter === f ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
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
                      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                        <p className="text-sm text-muted-foreground">No cards match this filter.</p>
                        <Button size="sm" variant="outline" onClick={() => setFilter("all")}>Show All</Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Flip card */}
                      <div className="perspective-1000" style={{ perspective: "1000px" }}>
                        <div
                          id="flashcard"
                          onClick={() => setFlipped(f => !f)}
                          className="relative min-h-[280px] cursor-pointer select-none transition-all duration-500"
                          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                        >
                          {/* Front */}
                          <Card className="absolute inset-0 flex flex-col items-center justify-center border-border/60 shadow-md"
                            style={{ backfaceVisibility: "hidden" }}>
                            <CardContent className="flex flex-col items-center gap-4 p-6 text-center w-full">
                              <Badge variant="outline" className="text-xs text-muted-foreground">Question</Badge>
                              <p className="text-lg font-semibold leading-snug">{current?.question}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {current?.difficulty && (
                                  <Badge variant="outline" className={DIFF_COLOR[current.difficulty]}>{current.difficulty}</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  <Eye className="size-3" /> {current?.reviewCount}x reviewed
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground animate-pulse mt-2">Click to reveal answer</p>
                            </CardContent>
                          </Card>

                          {/* Back */}
                          <Card className="absolute inset-0 flex flex-col items-center justify-center border-violet-300/60 bg-gradient-to-b from-violet-50/30 to-transparent shadow-md dark:border-violet-700/40 dark:from-violet-950/20"
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                            <CardContent className="flex flex-col items-center gap-4 p-6 text-center w-full">
                              <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-400">Answer</Badge>
                              <p className="text-base leading-relaxed text-muted-foreground">{current?.answer}</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between gap-3">
                        <Button variant="outline" size="sm" onClick={prev} disabled={cardIndex === 0} id="fc-prev-btn">
                          <ChevronLeft className="size-4" /> Prev
                        </Button>

                        <div className="flex items-center gap-2">
                          <button onClick={e => current && toggleStar(current.id, e)} id="fc-star-btn"
                            className={`rounded-lg border p-2 transition-all hover:scale-110 ${current?.isStarred ? "border-amber-300 bg-amber-50 text-amber-500 dark:border-amber-700 dark:bg-amber-950/30" : "border-border/50 text-muted-foreground hover:border-amber-300"}`}>
                            <Star className={`size-4 ${current?.isStarred ? "fill-amber-400" : ""}`} />
                          </button>
                          <button onClick={markReviewed} id="fc-reviewed-btn"
                            className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-600 transition-all hover:scale-110 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                            <CheckCircle2 className="size-4" />
                          </button>
                          <button onClick={reset} id="fc-reset-btn"
                            className="rounded-lg border border-border/50 p-2 text-muted-foreground transition-all hover:scale-110 hover:border-border">
                            <RotateCcw className="size-4" />
                          </button>
                        </div>

                        <Button variant="outline" size="sm" onClick={next} disabled={cardIndex === cards.length - 1} id="fc-next-btn">
                          Next <ChevronRight className="size-4" />
                        </Button>
                      </div>

                      {/* Progress dots */}
                      <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                        {cards.map((c, i) => (
                          <button key={c.id} onClick={() => { setCardIndex(i); setFlipped(false); }}
                            className={`size-2 rounded-full transition-all ${i === cardIndex ? "scale-125 bg-violet-500" : c.reviewCount > 0 ? "bg-violet-300 dark:bg-violet-700" : "bg-muted-foreground/30"}`} />
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
    </section>
  );
}
