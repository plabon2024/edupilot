export default function DocumentsLoading() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-xl bg-muted" />
            <div className="space-y-1.5">
              <div className="h-6 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-56 animate-pulse rounded bg-muted/70" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
          </div>
        </div>

        {/* Document card skeletons */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/40 p-4 animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="size-10 shrink-0 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-44 rounded bg-muted" />
                    <div className="h-5 w-16 rounded-md bg-muted" />
                  </div>
                  <div className="h-3 w-64 rounded bg-muted/60" />
                  <div className="flex gap-3">
                    <div className="h-3 w-24 rounded bg-muted/50" />
                    <div className="h-3 w-20 rounded bg-muted/50" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <div className="h-8 w-8 rounded-md bg-muted" />
                <div className="h-8 w-20 rounded-md bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
