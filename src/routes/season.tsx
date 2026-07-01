import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  Eye,
  EyeOff,
  Fingerprint,
  Layers,
  Lock,
  Network,
  Skull,
  Sparkles,
} from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Badge } from "@/components/case-zero/badge";
import { LinkButton } from "@/components/case-zero/button";
import { cn } from "@/lib/utils";
import { currentSeason, type ArchivedCase, type SharedClue } from "@/data/season";
import { useLiveSeason } from "@/lib/story-engine";

export const Route = createFileRoute("/season")({
  head: () => ({
    meta: [
      { title: `${currentSeason.number} — ${currentSeason.title}` },
      { name: "description", content: currentSeason.tagline },
      { property: "og:title", content: `${currentSeason.number} — ${currentSeason.title}` },
      { property: "og:description", content: currentSeason.tagline },
    ],
  }),
  component: SeasonBoard,
});

function SeasonBoard() {
  const s = useLiveSeason();
  const progressPct = Math.round((s.currentDay / s.totalDays) * 100);
  const solved = s.cases.filter((c) => c.status === "solved").length;
  const active = s.cases.find((c) => c.status === "active");

  return (
    <PageLayout>
      {/* ============ Header ============ */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-hero opacity-70" />
        <div className="absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute right-0 -bottom-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-accent">{s.number}</span>
            <Badge tone="primary"><Layers className="h-3 w-3" /> Seasonal file</Badge>
            <Badge tone="muted">Day {s.currentDay} / {s.totalDays}</Badge>
          </div>

          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            {s.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {s.loreBrief}
          </p>

          {/* File progress bar */}
          <div className="mt-8 max-w-3xl">
            <div className="flex items-end justify-between text-xs text-muted-foreground">
              <span className="uppercase tracking-[0.25em]">File progress</span>
              <span className="font-mono">{s.currentDay} / {s.totalDays} nights</span>
            </div>
            <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-surface ring-1 ring-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent shadow-glow transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {active && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton to="/case/$caseId" params={{ caseId: active.id }} size="lg">
                Continue tonight's case <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <span className="text-xs text-muted-foreground">
                Day {active.day}: <span className="text-foreground">{active.title}</span>
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* ============ Board stats ============ */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <BoardStat
            icon={Calendar}
            label="Current day"
            value={`${s.currentDay} / ${s.totalDays}`}
            hint={`${solved} archived · ${s.totalDays - s.currentDay} sealed`}
          />
          <BoardStat
            icon={Network}
            label="Hidden connections"
            value={s.hiddenConnections.toString()}
            hint="Links between cases"
            tone="accent"
          />
          <BoardStat
            icon={Fingerprint}
            label="Unresolved evidence"
            value={s.unresolvedEvidence.toString()}
            hint="Clues without a home"
            tone="primary"
          />
          <BoardStat
            icon={Eye}
            label="Archived cases"
            value={solved.toString()}
            hint="Sealed into the file"
          />
          <BoardStat
            icon={Skull}
            label="Mastermind"
            value={s.masterminStatus}
            hint="No suspect identified"
            tone="primary"
          />
        </div>

        {/* ============ Case board ============ */}
        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent">The wall</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Case board</h2>
              <p className="mt-1 text-sm text-muted-foreground">One tile per night. Solved cases pin themselves here.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10">
            {s.cases.map((c) => (
              <CaseTile key={c.id} c={c} />
            ))}
          </div>
        </section>

        {/* ============ Shared evidence archive ============ */}
        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent">The through-line</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Shared evidence</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Recurring clues from across the file. Each new case may add another thread.
              </p>
            </div>
            <Link to="/archive" className="text-sm text-muted-foreground hover:text-foreground">
              Open archive →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.sharedClues.map((clue) => (
              <SharedClueCard key={clue.id} clue={clue} />
            ))}

            {/* Anticipation tile */}
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-accent/30 bg-surface/40 p-6">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
              <div className="relative">
                <Sparkles className="h-5 w-5 text-accent" />
                <p className="mt-3 text-sm font-semibold">A new thread will surface tonight.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Every case in File 001 hides a single recurring clue. Solve tonight's mystery to add it to the archive.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

function BoardStat({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "accent" | "primary";
}) {
  const iconTone =
    tone === "primary"
      ? "bg-primary/15 text-primary ring-primary/30"
      : tone === "accent"
        ? "bg-accent/15 text-accent ring-accent/30"
        : "bg-surface text-foreground ring-border";
  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-5">
      <div className="flex items-center gap-3">
        <span className={cn("grid h-9 w-9 place-items-center rounded-lg ring-1", iconTone)}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function CaseTile({ c }: { c: ArchivedCase }) {
  const isLocked = c.status === "locked";
  const isActive = c.status === "active";
  const isSolved = c.status === "solved";
  const isFailed = c.status === "failed";

  const inner = (
    <div
      className={cn(
        "group relative flex aspect-square flex-col justify-between overflow-hidden rounded-lg border p-2.5 text-left transition-all",
        isActive && "border-primary/60 bg-primary/10 shadow-glow",
        isSolved && "border-emerald-500/40 bg-emerald-500/5 hover:-translate-y-0.5",
        isFailed && "border-red-500/30 bg-red-500/5",
        isLocked && "border-border/40 bg-surface/40",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Day {String(c.day).padStart(2, "0")}
        </span>
        {isLocked && <Lock className="h-3 w-3 text-muted-foreground/70" />}
        {isSolved && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        {isActive && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "truncate text-[11px] font-semibold",
            isLocked ? "text-muted-foreground/60" : "text-foreground",
          )}
        >
          {c.title}
        </p>
        {c.recurringClueId && (isSolved || isActive) && (
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-accent">
            + thread
          </p>
        )}
      </div>
    </div>
  );

  if (isActive || isSolved) {
    return (
      <Link to="/case/$caseId" params={{ caseId: c.id }} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

function SharedClueCard({ clue }: { clue: SharedClue }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40">
      <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent opacity-70" />
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 font-mono text-sm font-bold text-primary">
          {clue.symbol}
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {clue.foundOnDay === 0 ? "Prologue" : `Surfaced day ${clue.foundOnDay}`} · {clue.appearances}× seen
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{clue.name}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{clue.hint}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-accent">
            <EyeOff className="h-3 w-3" /> Meaning unresolved
          </p>
        </div>
      </div>
    </div>
  );
}

