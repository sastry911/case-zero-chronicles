import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Edit3, Fingerprint, Layers, Network, Settings, Skull } from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Card } from "@/components/case-zero/card";
import { Badge } from "@/components/case-zero/badge";
import { Button } from "@/components/case-zero/button";
import { profile } from "@/lib/mock-data";
import { currentSeason } from "@/data/season";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Case Zero" },
      { name: "description", content: "Your detective profile and seasonal file progression." },
    ],
  }),
  component: ProfilePage,
});

const milestones = [
  { day: 1, label: "First case cracked", reached: currentSeason.currentDay >= 1 },
  { day: 5, label: "First recurring thread verified", reached: currentSeason.currentDay >= 5 },
  { day: 10, label: "Third of the file archived", reached: currentSeason.currentDay >= 10 },
  { day: 20, label: "Mastermind pattern emerges", reached: currentSeason.currentDay >= 20 },
  { day: 30, label: "File 001 sealed", reached: currentSeason.currentDay >= 30 },
];

function ProfilePage() {
  const s = currentSeason;
  const solved = s.cases.filter((c) => c.status === "solved").length;
  const progressPct = Math.round((s.currentDay / s.totalDays) * 100);

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <Card gradient className="relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative grid grid-cols-[auto_minmax(0,1fr)] items-start gap-5 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30 text-2xl font-bold tracking-tight ring-1 ring-border">
                AM
              </div>
              <div className="min-w-0">
                <Badge tone="accent">Detective on file</Badge>
                <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight sm:text-3xl">{profile.name}</h1>
                <p className="text-sm text-muted-foreground">@{profile.handle} · Joined {profile.joined}</p>
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-2 sm:col-auto">
              <Button variant="secondary" size="sm"><Edit3 className="h-4 w-4" /> Edit</Button>
              <Button variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Current file */}
          <div className="mt-7 rounded-xl border border-border/60 bg-background/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">Currently on</p>
                <p className="mt-1 text-lg font-semibold">{s.number} · {s.title}</p>
              </div>
              <Link
                to="/season"
                className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-surface px-3 py-1.5 text-xs font-medium hover:border-accent/50"
              >
                <Layers className="h-3.5 w-3.5" /> Open season board
              </Link>
            </div>
            <div className="mt-4">
              <div className="flex items-end justify-between text-xs text-muted-foreground">
                <span className="uppercase tracking-[0.22em]">File progress</span>
                <span className="font-mono">Day {s.currentDay} / {s.totalDays}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface ring-1 ring-border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent shadow-glow transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* File-based stats (XP removed) */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FileStat icon={Calendar} label="Days on file" value={`${s.currentDay}`} hint={`of ${s.totalDays}`} />
          <FileStat icon={Layers} label="Archived cases" value={solved.toString()} hint="Sealed into the file" tone="accent" />
          <FileStat icon={Fingerprint} label="Threads collected" value={s.sharedClues.length.toString()} hint="Recurring clues" tone="primary" />
          <FileStat icon={Skull} label="Mastermind" value={s.masterminStatus} hint="No suspect yet" />
        </div>

        {/* Milestones + Threads */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Story milestones</h2>
              <Badge tone="muted">{milestones.filter((m) => m.reached).length}/{milestones.length}</Badge>
            </div>
            <ol className="relative space-y-4 border-l border-border/60 pl-6">
              {milestones.map((m) => (
                <li key={m.day} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[27px] top-1.5 grid h-4 w-4 place-items-center rounded-full border-2",
                      m.reached ? "border-accent bg-accent/25 shadow-glow" : "border-border bg-background",
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", m.reached ? "bg-accent" : "bg-muted-foreground/40")} />
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-accent">Day {String(m.day).padStart(2, "0")}</span>
                    <p className={cn("text-sm font-semibold", !m.reached && "text-muted-foreground")}>{m.label}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your threads</h2>
              <Network className="h-4 w-4 text-accent" />
            </div>
            {s.sharedClues.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recurring clues yet.</p>
            ) : (
              <ul className="space-y-3">
                {s.sharedClues.map((clue) => (
                  <li key={clue.id} className="flex items-start gap-3 rounded-lg border border-border/60 bg-surface/60 p-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-primary/40 bg-primary/10 font-mono text-xs font-bold text-primary">
                      {clue.symbol}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{clue.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {clue.foundOnDay === 0 ? "Prologue" : `Day ${clue.foundOnDay}`} · {clue.appearances}× seen
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/archive"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:brightness-110"
            >
              Open shared archive →
            </Link>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

function FileStat({
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
    <Card className="flex items-center gap-4">
      <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-lg ring-1", iconTone)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-0.5 truncate text-xl font-semibold tracking-tight">{value}</div>
        <div className="truncate text-xs text-muted-foreground">{hint}</div>
      </div>
    </Card>
  );
}
