export default function QuizTakeLoading() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-xl bg-muted" />
            <div className="space-y-1.5">
              <div className="h-5 w-52 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted/60" />
            </div>
          </div>
          <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-2 animate-pulse rounded-full bg-muted" />

        {/* Question card */}
        <div className="animate-pulse rounded-xl border border-border/50 bg-card p-6 space-y-5">
          <div className="space-y-2">
            <div className="h-3.5 w-24 rounded bg-muted" />
            <div className="h-6 w-full rounded bg-muted" />
            <div className="h-6 w-3/4 rounded bg-muted" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg border border-border/50 bg-muted/40" />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          <div className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="size-2.5 animate-pulse rounded-full bg-muted" />
            ))}
          </div>
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </section>
  );
}
