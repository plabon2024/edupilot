export default function FlashcardsLoading() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-xl bg-muted" />
            <div className="space-y-1.5">
              <div className="h-6 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-56 animate-pulse rounded bg-muted/70" />
            </div>
          </div>
          <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-border/50 bg-muted/40" />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <div className="space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-muted/70" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border/50 bg-muted/40 p-3 space-y-2"
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center gap-2">
                  <div className="size-7 shrink-0 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-32 rounded bg-muted" />
                    <div className="h-2.5 w-16 rounded bg-muted/60" />
                  </div>
                </div>
                <div className="h-1 rounded-full bg-muted" />
              </div>
            ))}
          </div>

          {/* Card study area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-12 animate-pulse rounded bg-muted/70" />
            </div>
            <div className="h-[260px] animate-pulse rounded-xl border border-border/50 bg-muted/40" />
            <div className="flex items-center justify-between">
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="size-9 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
