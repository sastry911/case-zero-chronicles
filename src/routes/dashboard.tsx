import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Crosshair,
  FileSearch,
  Fingerprint,
  Flame,
  Gauge,
  Globe2,
  MapPin,
  MessageSquare,
  PlayCircle,
  Radio,
  Shield,
  Sparkles,
  Star,
  Timer,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Card } from "@/components/case-zero/card";
import { LinkButton } from "@/components/case-zero/button";
import { Badge, DifficultyStars } from "@/components/case-zero/badge";
import { leaderboard, profile, todaysCase } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Case Zero" },
      { name: "description", content: "Your daily briefing, live investigation, stats and the global leaderboard." },
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

const stats = [
  { icon: CheckCircle2, label: "Cases solved", value: profile.solved.toString(), hint: `${profile.failed} failed`, tone: "accent" as const },
  { icon: Gauge, label: "Accuracy", value: `${profile.accuracy}%`, hint: "Last 30 cases", tone: "primary" as const },
  { icon: Timer, label: "Fastest solve", value: profile.fastestSolve, hint: "Case #M-02 · Ink on the Ledger", tone: "default" as const },
  { icon: Globe2, label: "Global rank", value: `#${profile.rank}`, hint: profile.rankTitle, tone: "accent" as const },
];

const activity = [
  { icon: Fingerprint, tone: "primary", title: "Evidence collected", detail: "Lifted partial print from Car 7 handrail.", time: "12 min ago", case: "Case #001" },
  { icon: MessageSquare, tone: "accent", title: "Witness interviewed", detail: "Conductor placed two passengers near the rear door at 23:51.", time: "38 min ago", case: "Case #001" },
  { icon: FileSearch, tone: "default", title: "Document reviewed", detail: "Architectural plans annotated in the victim's coat pocket.", time: "1h ago", case: "Case #001" },
  { icon: Radio, tone: "accent", title: "Tip received", detail: "Anonymous source mentions an encrypted message at 23:44.", time: "3h ago", case: "Case #001" },
  { icon: Trophy, tone: "primary", title: "Case solved", detail: "Closed 'Ink on the Ledger' — perfect deduction.", time: "Yesterday", case: "Case #M-02" },
] as const;

const xpPercent = Math.round((profile.xp / (profile.xp + profile.xpToNext)) * 100);
const topFive = leaderboard.slice(0, 5);

function Dashboard() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in">
        {/* ---------- 1. Welcome header ---------- */}
        <Card gradient className="relative overflow-hidden p-0">
          <div className="absolute inset-0 bg-grid opacity-30 [mask-image:linear-gradient(180deg,black,transparent)]" />
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />

          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            {/* Avatar */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/30 via-surface to-accent/20 ring-1 ring-border">
                  <span className="font-mono text-lg font-bold text-foreground">AM</span>
                </div>
                <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground ring-2 ring-background">
                  {profile.rank}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.25em] text-accent">{greeting()}, Detective</p>
                <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                  {profile.name}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Badge tone="accent"><Shield className="h-3 w-3" /> {profile.rankTitle}</Badge>
                  <span className="font-mono text-[11px] text-muted-foreground">@{profile.handle}</span>
                </div>
              </div>
            </div>

            {/* XP progress */}
            <div className="min-w-0 lg:px-6">
              <div className="flex items-end justify-between text-xs">
                <span className="uppercase tracking-[0.2em] text-muted-foreground">Experience</span>
                <span className="font-mono text-foreground">
                  {profile.xp.toLocaleString()} <span className="text-muted-foreground">/ {(profile.xp + profile.xpToNext).toLocaleString()} XP</span>
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-elevated ring-1 ring-border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent shadow-glow transition-all"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="text-accent font-medium">{profile.xpToNext.toLocaleString()} XP</span> to{" "}
                <span className="text-foreground">Chief Inspector</span>
              </p>
            </div>

            {/* Streak */}
            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border/70 bg-surface-elevated/60 px-4 py-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Daily streak</div>
                <div className="font-mono text-xl font-semibold text-foreground">{profile.streak} <span className="text-sm text-muted-foreground">days</span></div>
              </div>
            </div>
          </div>
        </Card>

        {/* ---------- 2. Featured investigation ---------- */}
        <Card gradient className="relative mt-8 overflow-hidden p-0">
          <div className="absolute inset-0 bg-grid opacity-25 [mask-image:linear-gradient(180deg,black,transparent)]" />
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-60 w-60 rounded-full bg-accent/15 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="primary"><Sparkles className="h-3 w-3" /> Today's investigation</Badge>
                <Badge tone="muted"><PlayCircle className="h-3 w-3" /> Not started</Badge>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {todaysCase.number}
                </span>
              </div>

              <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                The Last Train
              </h2>
              <p className="mt-3 max-w-xl text-base text-muted-foreground">
                {todaysCase.blurb}
              </p>

              <dl className="mt-7 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
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

            {/* Cinematic case file */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 -rotate-2 rounded-xl border border-border bg-surface-elevated/60" />
              <div className="relative rotate-1 rounded-xl border border-border bg-background/80 p-6 backdrop-blur transition-transform duration-300 hover:rotate-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Evidence locker</span>
                  <span className="font-mono text-[10px] text-muted-foreground">CZ-001</span>
                </div>
                <div className="mt-4 space-y-2.5">
                  {[
                    "Torn ticket stub · Car 7",
                    "Conductor's statement",
                    "Encrypted message · 23:44",
                    "Annotated blueprint",
                  ].map((line, i) => (
                    <div key={line} className="flex items-center gap-3 rounded-md border border-border/70 bg-surface px-3 py-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 font-mono text-[10px] text-primary">{i + 1}</span>
                      <span className="truncate text-sm">{line}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-md border border-dashed border-accent/40 bg-accent/5 px-3 py-2 text-xs text-accent">
                  5 suspects · 0 accusations made
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ---------- 3. Statistics ---------- */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* ---------- 4 & 5. Activity + Leaderboard ---------- */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Activity timeline */}
          <section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent">Detective log</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Recent activity</h2>
              </div>
              <span className="text-xs text-muted-foreground">Today</span>
            </div>

            <Card className="p-0">
              <ol className="relative">
                {activity.map((a, i) => {
                  const Icon = a.icon;
                  const toneRing =
                    a.tone === "primary" ? "bg-primary/15 text-primary ring-primary/30"
                    : a.tone === "accent" ? "bg-accent/15 text-accent ring-accent/30"
                    : "bg-surface-elevated text-foreground ring-border";
                  return (
                    <li key={i} className="relative flex gap-4 px-6 py-4 transition-colors hover:bg-surface-elevated/40">
                      {i !== activity.length - 1 && (
                        <span className="absolute left-[2.05rem] top-12 bottom-0 w-px bg-border/70" aria-hidden />
                      )}
                      <div className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ${toneRing}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground">{a.title}</p>
                          <span className="font-mono text-[11px] text-muted-foreground">{a.time}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{a.detail}</p>
                        <span className="mt-1.5 inline-block font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80">
                          {a.case}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>
          </section>

          {/* Leaderboard preview */}
          <section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent">Live standings</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Daily leaderboard</h2>
              </div>
              <Link to="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
            </div>

            <Card className="p-0">
              <ul className="divide-y divide-border/60">
                {topFive.map((entry) => {
                  const isMe = entry.handle === profile.handle;
                  return (
                    <li
                      key={entry.rank}
                      className={`flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-elevated/40 ${isMe ? "bg-accent/5" : ""}`}
                    >
                      <RankBadge rank={entry.rank} />
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-surface-elevated to-surface ring-1 ring-border">
                        <span className="font-mono text-[11px] font-semibold text-foreground">
                          {entry.handle.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          @{entry.handle} {isMe && <span className="ml-1 text-[10px] uppercase tracking-widest text-accent">you</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{entry.solved} solved · {entry.accuracy}% acc</p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-semibold text-foreground">{entry.xp.toLocaleString()}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">XP</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-border/60 px-5 py-3 text-center">
                <Link to="/leaderboard" className="text-xs font-medium text-accent hover:brightness-110">
                  See full leaderboard →
                </Link>
              </div>
            </Card>
          </section>
        </div>
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

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  tone: "primary" | "accent" | "default";
}) {
  const toneClasses = {
    primary: "bg-primary/15 text-primary ring-primary/30",
    accent: "bg-accent/15 text-accent ring-accent/30",
    default: "bg-surface-elevated text-foreground ring-border",
  }[tone];

  return (
    <Card interactive gradient className="flex items-center gap-4">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ring-1 ${toneClasses}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
        <div className="mt-0.5 truncate text-2xl font-semibold tracking-tight">{value}</div>
        <div className="truncate text-xs text-muted-foreground">{hint}</div>
      </div>
    </Card>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const styles =
    rank === 1 ? "bg-accent text-accent-foreground"
    : rank === 2 ? "bg-foreground/85 text-background"
    : rank === 3 ? "bg-primary/80 text-primary-foreground"
    : "bg-surface-elevated text-muted-foreground ring-1 ring-border";
  return (
    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md font-mono text-xs font-bold ${styles}`}>
      {rank}
    </span>
  );
}
