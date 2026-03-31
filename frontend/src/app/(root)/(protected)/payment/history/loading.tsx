export default function PaymentLoading() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-xl bg-muted" />
            <div className="space-y-1.5">
              <div className="h-6 w-36 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-48 animate-pulse rounded bg-muted/70" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
          </div>
        </div>

        {/* Row skeletons */}
        <div className="animate-pulse overflow-hidden rounded-xl border border-border/50 bg-card">
          <div className="border-b border-border/50 p-5">
            <div className="h-5 w-28 rounded bg-muted" />
            <div className="mt-1 h-4 w-20 rounded bg-muted/60" />
          </div>
          <div className="divide-y divide-border/40 p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-lg py-3"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-44 rounded bg-muted" />
                  <div className="h-3 w-28 rounded bg-muted/60" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-20 rounded-md bg-muted" />
                  <div className="h-6 w-16 rounded-md bg-muted" />
                  <div className="h-5 w-16 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
