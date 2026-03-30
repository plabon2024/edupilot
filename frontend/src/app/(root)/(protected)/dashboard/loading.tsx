import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-40 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded bg-muted/70" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
        </div>

        {/* Stat cards skeleton */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[108px] animate-pulse rounded-2xl border border-border/50 bg-muted/40"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>

        {/* Quick actions skeleton */}
        <div className="mb-8 h-20 animate-pulse rounded-2xl border border-border/50 bg-muted/40" />

        {/* Bottom cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-border/50 bg-muted/40"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="space-y-3 p-5">
                <div className="h-5 w-40 rounded bg-muted" />
                <div className="h-4 w-28 rounded bg-muted/70" />
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-12 rounded-lg bg-muted/50" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
