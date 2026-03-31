import { Loader2 } from "lucide-react";

export default function QuizzesLoading() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="size-10 animate-pulse rounded-xl bg-muted" />
          <div className="space-y-1.5">
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-56 animate-pulse rounded bg-muted/70" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar skeleton */}
          <div className="animate-pulse rounded-xl border border-border/50 bg-muted/40 h-64" />

          {/* Quiz list skeleton */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-xl border border-border/50 bg-muted/40"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
