import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, EyeOff, Fingerprint, Network, Skull } from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Badge } from "@/components/case-zero/badge";
import { currentSeason } from "@/data/season";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [
      { title: "Shared Evidence Archive — Case Zero" },
      { name: "description", content: "Recurring clues from across the seasonal file. Every completed case adds a new thread." },
      { property: "og:title", content: "Shared Evidence Archive — Case Zero" },
      { property: "og:description", content: "Recurring clues from across the seasonal file." },
    ],
  }),
  component: ArchivePage,
});

function ArchivePage() {
  const s = currentSeason;
  const solvedCases = s.cases.filter((c) => c.status === "solved");
  const upcomingClueSlots = Math.max(0, s.totalDays - s.sharedClues.length);

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/season"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to season board
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-accent">{s.number}</span>
          <Badge tone="primary">Shared evidence archive</Badge>
        </div>
        <h1 className="mt-3 max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          The threads between the cases.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Every murder in File 001 leaves behind one clue that does not belong. This is where they pile up. Meaning is not
          included.
        </p>

        {/* Summary strip */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <SummaryRow icon={Fingerprint} label="Threads collected" value={`${s.sharedClues.length}`} sub={`${upcomingClueSlots} more expected`} />
          <SummaryRow icon={Network} label="Cross-case connections" value={`${s.hiddenConnections}`} sub="Detected by pattern-match" />
          <SummaryRow icon={Skull} label="Mastermind status" value={s.masterminStatus} sub="No suspect identified" />
        </div>

        {/* Feed */}
        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Evidence feed</h2>
            <span className="text-xs text-muted-foreground">Day {s.currentDay} of {s.totalDays}</span>
          </div>

          <ol className="relative space-y-6 border-l border-border/60 pl-6">
            {s.sharedClues.map((clue) => {
              const origin = solvedCases.find((c) => c.id === clue.originCaseId);
              return (
                <li key={clue.id} className="relative">
                  <span className="absolute -left-[33px] top-2 grid h-4 w-4 place-items-center rounded-full border-2 border-primary bg-primary/25 shadow-glow">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <div className="rounded-2xl border border-border/70 bg-surface p-5">
                    <div className="flex items-start gap-4">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 font-mono text-sm font-bold text-primary">
                        {clue.symbol}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">{clue.name}</p>
                          <Badge tone="muted">
                            {clue.foundOnDay === 0 ? "Prologue" : `Day ${clue.foundOnDay}`}
                          </Badge>
                          <Badge tone="accent">{clue.appearances}× seen</Badge>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{clue.hint}</p>
                        {origin && (
                          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            First surfaced in {origin.number} · {origin.title}
                          </p>
                        )}
                        <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                          <EyeOff className="h-3 w-3" /> Meaning unresolved
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}

            {/* Ghost slot */}
            <li className="relative">
              <span className="absolute -left-[33px] top-2 grid h-4 w-4 place-items-center rounded-full border-2 border-dashed border-border/60" />
              <div className="rounded-2xl border border-dashed border-border/60 bg-surface/40 p-5 text-sm text-muted-foreground">
                Tonight's case will reveal the next thread.
              </div>
            </li>
          </ol>
        </section>
      </div>
    </PageLayout>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/70 bg-surface p-5")}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent" />
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
