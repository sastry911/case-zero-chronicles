import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Crosshair,
  EyeOff,
  Fingerprint,
  Layers,
  Lock,
  MapPin,
  Network,
  Skull,
  Sparkles,
  Star,
} from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Card } from "@/components/case-zero/card";
import { LinkButton } from "@/components/case-zero/button";
import { Badge, DifficultyStars } from "@/components/case-zero/badge";
import { currentSeason, type ArchivedCase, type SharedClue } from "@/data/season";
import { todaysCase } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Case Zero" },
      { name: "description", content: "Your file, tonight's case, and the threads connecting every crime this month." },
    ],
  }),
  component: Dashboard,
});

const VICTIM = "Emily Carter";
const SCENE = "Hyderabad Metro Station";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Burning the midnight oil";
}

function Dashboard() {
  const s = currentSeason;
  const active = s.cases.find((c) => c.status === "active") ?? s.cases[0];
  const progressPct = Math.round((s.currentDay / s.totalDays) * 100);
  const solved = s.cases.filter((c) => c.status === "solved").length;

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in">
        {/* ---------- 1. File header ---------- */}
        <Card gradient className="relative overflow-hidden p-0">
          <div className="absolute inset-0 bg-grid opacity-25 [mask-image:linear-gradient(180deg,black,transparent)]" />
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />

          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.25em] text-accent">{greeting()}, detective</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-accent">{s.number}</span>
                <Badge tone="primary"><Layers className="h-3 w-3" /> Seasonal file</Badge>
                <Badge tone="muted">Day {s.currentDay} / {s.totalDays}</Badge>
              </div>
              <h1 className="mt-3 text-balance text-3xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                {s.title}
              </h1>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                {s.tagline}
              </p>

              {/* File progress */}
              <div className="mt-6 max-w-lg">
                <div className="flex items-end justify-between text-xs text-muted-foreground">
                  <span className="uppercase tracking-[0.22em]">File progress</span>
                  <span className="font-mono">{s.currentDay} / {s.totalDays} nights</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface ring-1 ring-border">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent shadow-glow transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/season"
                  className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent/50"
                >
                  <Layers className="h-4 w-4" /> Open season board
                </Link>
                <Link
                  to="/archive"
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Fingerprint className="h-4 w-4" /> Shared evidence archive
                </Link>
              </div>
            </div>

            {/* Season board mini */}
            <div className="relative min-w-0">
              <div className="rounded-2xl border border-border/70 bg-background/60 p-5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">The wall</p>
                  <span className="font-mono text-[10px] text-muted-foreground">{solved} archived</span>
                </div>
                <div className="mt-4 grid grid-cols-6 gap-1.5 sm:grid-cols-10 lg:grid-cols-6 xl:grid-cols-10">
                  {s.cases.map((c) => (
                    <MiniTile key={c.id} c={c} />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-md border border-dashed border-accent/30 bg-accent/5 px-3 py-2 text-[11px] text-accent">
                  <Sparkles className="h-3 w-3" /> Solve tonight's case to unlock day 2.
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ---------- 2. Tonight's case ---------- */}
        <Card gradient className="relative mt-8 overflow-hidden p-0">
          <div className="absolute inset-0 bg-grid opacity-25 [mask-image:linear-gradient(180deg,black,transparent)]" />
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="primary"><Sparkles className="h-3 w-3" /> Tonight's case</Badge>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Day 01 · {todaysCase.number}
                </span>
              </div>

              <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl">
                The Last Train
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                {todaysCase.blurb}
              </p>

              <dl className="mt-6 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                <MetaItem icon={Crosshair} label="Victim" value={VICTIM} />
                <MetaItem icon={MapPin} label="Location" value={SCENE} />
                <MetaItem icon={Star} label="Difficulty" value={<DifficultyStars value={4} />} />
                <MetaItem icon={Clock} label="Est. time" value="15 min" />
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LinkButton to="/case/$caseId" params={{ caseId: todaysCase.id }} size="lg">
                  Start investigation <ArrowRight className="h-4 w-4" />
                </LinkButton>
                <LinkButton to="/case/$caseId" params={{ caseId: todaysCase.id }} variant="secondary" size="lg">
                  <BookOpen className="h-4 w-4" /> Case brief
                </LinkButton>
              </div>
            </div>

            {/* Recurring clue teaser */}
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-primary" />
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Hidden thread</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                Somewhere in tonight's crime scene, a single recurring clue is waiting. It won't help you name the killer —
                but it will bind this case to the next.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-primary/40 bg-primary/10 font-mono text-[10px] font-bold text-primary">
                  //
                </span>
                <span className="text-xs text-muted-foreground">
                  Last thread found: <span className="text-foreground">A crimson silk fibre</span>
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* ---------- 3. Season board summary ---------- */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <BoardStat icon={Calendar} label="Current day" value={`${s.currentDay} / ${s.totalDays}`} hint="Nights on the file" />
          <BoardStat icon={Network} label="Hidden connections" value={s.hiddenConnections.toString()} hint="Case-to-case links" tone="accent" />
          <BoardStat icon={Fingerprint} label="Unresolved evidence" value={s.unresolvedEvidence.toString()} hint="Clues without a home" tone="primary" />
          <BoardStat icon={Layers} label="Archived cases" value={solved.toString()} hint="Sealed into the file" />
          <BoardStat icon={Skull} label="Mastermind" value={s.masterminStatus} hint="No suspect identified" tone="primary" />
        </div>

        {/* ---------- 4. Shared evidence preview ---------- */}
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent">The through-line</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Shared evidence</h2>
              <p className="mt-1 text-sm text-muted-foreground">Threads that recur across the file. Meaning unresolved.</p>
            </div>
            <Link to="/archive" className="text-sm text-muted-foreground hover:text-foreground">
              Open archive →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.sharedClues.map((clue) => (
              <SharedClueCard key={clue.id} clue={clue} />
            ))}
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-accent/30 bg-surface/40 p-6">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
              <div className="relative">
                <Sparkles className="h-5 w-5 text-accent" />
                <p className="mt-3 text-sm font-semibold">A new thread will surface tonight.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Every case in File 001 hides one recurring clue.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </dt>
      <dd className="mt-1.5 truncate text-sm font-semibold text-foreground">{value}</dd>
    </div>
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

function MiniTile({ c }: { c: ArchivedCase }) {
  const isLocked = c.status === "locked";
  const isActive = c.status === "active";
  const isSolved = c.status === "solved";
  return (
    <div
      title={`Day ${c.day} · ${c.title}`}
      className={cn(
        "flex aspect-square items-center justify-center rounded border text-[9px] font-mono",
        isActive && "border-primary/70 bg-primary/15 text-primary shadow-glow",
        isSolved && "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
        isLocked && "border-border/40 bg-surface/40 text-muted-foreground/60",
      )}
    >
      {isLocked ? <Lock className="h-2.5 w-2.5" /> : String(c.day).padStart(2, "0")}
    </div>
  );
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
