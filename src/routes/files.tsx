import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Archive as ArchiveIcon, Layers, Lock, Sparkles, Clock } from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Card } from "@/components/case-zero/card";
import { LinkButton } from "@/components/case-zero/button";
import { Badge, DifficultyStars } from "@/components/case-zero/badge";
import { currentSeason, type ArchivedCase } from "@/data/season";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/files")({
  head: () => ({
    meta: [
      { title: "Files — Case Zero" },
      { name: "description", content: "Every seasonal file — the current investigation and the archives that came before." },
      { property: "og:title", content: "Files — Case Zero" },
      { property: "og:description", content: "One file per month. Thirty nights of connected crimes." },
    ],
  }),
  component: FilesPage,
});

// Upcoming files (locked / coming soon)
const upcomingFiles = [
  { number: "FILE 002", title: "The Glass Confession", eta: "Next month" },
  { number: "FILE 003", title: "Untitled", eta: "Soon" },
] as const;

function FilesPage() {
  const s = currentSeason;
  const archived = s.cases.filter((c) => c.status === "solved" || c.status === "failed");
  const activeCase = s.cases.find((c) => c.status === "active");
  const progressPct = Math.round((s.currentDay / s.totalDays) * 100);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-accent">The files</p>
          <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Every case is part of a larger file.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            A new file opens each month. Thirty nights, thirty crimes, one hand behind them all. Old files stay
            archived so you can revisit the evidence and the through-line.
          </p>
        </div>

        {/* Current file */}
        <Card gradient className="relative overflow-hidden p-0">
          <div className="absolute inset-0 bg-grid opacity-25 [mask-image:linear-gradient(180deg,black,transparent)]" />
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="primary"><Layers className="h-3 w-3" /> Current file</Badge>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{s.number}</span>
                <Badge tone="muted">Day {s.currentDay} / {s.totalDays}</Badge>
              </div>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{s.title}</h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">{s.loreBrief}</p>

              <div className="mt-6 max-w-lg">
                <div className="flex items-end justify-between text-xs text-muted-foreground">
                  <span className="uppercase tracking-[0.22em]">File progress</span>
                  <span className="font-mono">{progressPct}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface ring-1 ring-border">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent shadow-glow"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {activeCase && (
                  <LinkButton to="/case/$caseId" params={{ caseId: activeCase.id }} size="lg">
                    Continue tonight's case <ArrowRight className="h-4 w-4" />
                  </LinkButton>
                )}
                <LinkButton to="/season" variant="secondary" size="lg">
                  <Layers className="h-4 w-4" /> Open season board
                </LinkButton>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/60 p-5 backdrop-blur">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">The wall</p>
              <div className="mt-4 grid grid-cols-6 gap-1.5 sm:grid-cols-10 lg:grid-cols-6 xl:grid-cols-10">
                {s.cases.map((c) => (
                  <div
                    key={c.id}
                    title={`Day ${c.day} · ${c.title}`}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded border text-[9px] font-mono",
                      c.status === "active" && "border-primary/70 bg-primary/15 text-primary shadow-glow",
                      c.status === "solved" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
                      c.status === "failed" && "border-red-500/40 bg-red-500/10 text-red-300",
                      c.status === "locked" && "border-border/40 bg-surface/40 text-muted-foreground/60",
                    )}
                  >
                    {c.status === "locked" ? <Lock className="h-2.5 w-2.5" /> : String(c.day).padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Archived cases */}
        <section className="mt-14">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent">Archived investigations</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Cases sealed into the file</h2>
            </div>
            <Link to="/archive" className="text-sm text-muted-foreground hover:text-foreground">
              Shared evidence archive →
            </Link>
          </div>

          {archived.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-surface/40 p-10 text-center">
              <ArchiveIcon className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">No cases archived yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Close tonight's investigation and it will be sealed here for the rest of the file.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {archived.map((c) => (
                <ArchivedCard key={c.id} c={c} />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming / Coming soon */}
        <section className="mt-14">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Upcoming files</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Sealed until their month opens</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {upcomingFiles.map((f) => (
              <div
                key={f.number}
                className="relative overflow-hidden rounded-2xl border border-dashed border-border/60 bg-surface/40 p-6"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {f.number}
                    </span>
                    <p className="mt-2 text-lg font-semibold text-foreground/90">{f.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Case details are redacted until this file opens.
                    </p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface text-muted-foreground ring-1 ring-border">
                    <Lock className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-[11px] font-medium text-accent">
                  <Sparkles className="h-3 w-3" /> Coming soon · {f.eta}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

function ArchivedCard({ c }: { c: ArchivedCase }) {
  const solved = c.status === "solved";
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Day {String(c.day).padStart(2, "0")} · {c.number}
            </span>
            <Badge tone={solved ? "accent" : "primary"}>
              {solved ? "Solved" : "Cold"}
            </Badge>
          </div>
          <p className="mt-2 text-base font-semibold">{c.title}</p>
          {c.verdict && (
            <p className="mt-1 text-xs text-muted-foreground">Verdict: <span className="text-foreground">{c.verdict}</span></p>
          )}
        </div>
        {c.closedAt && (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" /> {c.closedAt}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <DifficultyStars value={c.difficulty} />
        <Link
          to="/archive"
          className="text-xs font-medium text-accent hover:brightness-110"
        >
          Review evidence →
        </Link>
      </div>
    </div>
  );
}
