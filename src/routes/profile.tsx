import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, CheckCircle2, Edit3, Flame, Settings, Target, Timer, Trophy, XCircle } from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Card } from "@/components/case-zero/card";
import { Badge, DifficultyStars } from "@/components/case-zero/badge";
import { Button } from "@/components/case-zero/button";
import { profile, recentCases } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Case Zero" },
      { name: "description", content: "Your detective profile, stats, and case history." },
    ],
  }),
  component: ProfilePage,
});

const achievements = [
  { name: "First verdict", desc: "Solved your first case", earned: true },
  { name: "Sharpshooter", desc: "95% accuracy over 30 cases", earned: true },
  { name: "Iron streak", desc: "30-day streak", earned: false },
  { name: "Cold reader", desc: "Solve a case in under 5 min", earned: true },
  { name: "Midnight oil", desc: "Solve 10 cases after 2 AM", earned: false },
  { name: "Archivist", desc: "Replay 25 archived cases", earned: false },
];

function ProfilePage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <Card gradient className="relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative grid grid-cols-[auto_minmax(0,1fr)] items-start gap-5 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30 text-2xl font-bold tracking-tight ring-1 ring-border">
                AM
              </div>
              <div className="min-w-0">
                <Badge tone="accent">{profile.rankTitle}</Badge>
                <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight sm:text-3xl">{profile.name}</h1>
                <p className="text-sm text-muted-foreground">@{profile.handle} · Joined {profile.joined}</p>
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-2 sm:col-auto">
              <Button variant="secondary" size="sm"><Edit3 className="h-4 w-4" /> Edit</Button>
              <Button variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* XP bar */}
          <div className="relative mt-7">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="uppercase tracking-widest">Level progress</span>
              <span className="font-mono">{profile.xp.toLocaleString()} / {(profile.xp + profile.xpToNext).toLocaleString()} XP</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${(profile.xp / (profile.xp + profile.xpToNext)) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Stat grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Trophy} label="Rank" value={`#${profile.rank}`} />
          <Stat icon={CheckCircle2} label="Solved" value={profile.solved.toString()} />
          <Stat icon={Target} label="Accuracy" value={`${profile.accuracy}%`} />
          <Stat icon={Flame} label="Streak" value={`${profile.streak}d`} />
        </div>

        {/* Two columns */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Case history */}
          <Card className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Case history</h2>
              <span className="text-xs text-muted-foreground">{recentCases.length} recent</span>
            </div>
            <ul className="divide-y divide-border/60">
              {recentCases.map((c) => (
                <li key={c.id}>
                  <Link
                    to="/case/$caseId"
                    params={{ caseId: c.id }}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-4 transition-colors hover:bg-surface-elevated/40 px-2 rounded-md"
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-md ring-1 ${
                      c.status === "solved" ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" :
                      c.status === "failed" ? "bg-red-500/15 text-red-300 ring-red-500/30" :
                      "bg-accent/15 text-accent ring-accent/30"
                    }`}>
                      {c.status === "solved" ? <CheckCircle2 className="h-4 w-4" /> :
                       c.status === "failed" ? <XCircle className="h-4 w-4" /> :
                       <Timer className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.number}</span>
                        <DifficultyStars value={c.difficulty} />
                      </div>
                      <div className="mt-0.5 truncate text-sm font-semibold">{c.title}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />{c.date}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">View →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {/* Achievements */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Achievements</h2>
              <Badge tone="muted">{achievements.filter((a) => a.earned).length}/{achievements.length}</Badge>
            </div>
            <ul className="space-y-2">
              {achievements.map((a) => (
                <li
                  key={a.name}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    a.earned ? "border-accent/30 bg-accent/5" : "border-border/60 bg-surface opacity-60"
                  }`}
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${
                    a.earned ? "bg-accent/20 text-accent" : "bg-muted/30 text-muted-foreground"
                  }`}>
                    <Trophy className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{a.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-xl font-semibold tracking-tight">{value}</div>
      </div>
    </Card>
  );
}
