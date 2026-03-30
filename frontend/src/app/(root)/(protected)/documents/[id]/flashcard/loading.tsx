export default function FlashcardLoading() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
            <div className="size-9 animate-pulse rounded-xl bg-muted" />
            <div className="space-y-1.5">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted/70" />
            </div>
          </div>
          <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <div className="space-y-2">
            <div className="h-3 w-10 animate-pulse rounded bg-muted/70" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border/50 bg-muted/40 p-3 space-y-2"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-3 w-16 rounded bg-muted/60" />
                <div className="h-1.5 rounded-full bg-muted" />
                <div className="h-3 w-20 rounded bg-muted/50" />
              </div>
            ))}
          </div>

          {/* Flashcard area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted/70" />
            </div>
            {/* Card */}
            <div className="h-[280px] animate-pulse rounded-xl border border-border/50 bg-muted/40" />
            {/* Controls */}
            <div className="flex items-center justify-between gap-3">
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="size-9 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
            </div>
            {/* Dots */}
            <div className="flex justify-center gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="size-2 animate-pulse rounded-full bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
