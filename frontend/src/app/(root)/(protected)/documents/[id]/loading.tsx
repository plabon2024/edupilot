export default function DocumentDetailLoading() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-5 h-8 w-28 animate-pulse rounded-md bg-muted" />

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* LEFT col */}
          <div className="space-y-5">
            {/* Info card */}
            <div className="animate-pulse rounded-xl border border-border/50 bg-muted/40 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="size-10 shrink-0 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 rounded bg-muted" />
                  <div className="h-3.5 w-36 rounded bg-muted/70" />
                </div>
                <div className="h-6 w-20 rounded-md bg-muted" />
              </div>
              <div className="flex gap-3">
                <div className="h-14 w-40 rounded-lg bg-muted" />
                <div className="h-14 w-36 rounded-lg bg-muted" />
              </div>
              <div className="h-24 rounded-xl bg-muted" />
            </div>
            {/* PDF preview */}
            <div className="h-[480px] animate-pulse rounded-xl border border-border/50 bg-muted/40" />
          </div>

          {/* RIGHT: AI panel */}
          <div className="animate-pulse rounded-xl border border-border/50 bg-muted/40 h-[580px]">
            <div className="p-5 space-y-3">
              <div className="h-5 w-32 rounded bg-muted" />
              <div className="h-10 rounded-lg bg-muted" />
            </div>
            <div className="flex-1 px-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                  <div className={`h-10 rounded-2xl bg-muted ${i % 2 === 0 ? "w-3/4" : "w-2/3"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
