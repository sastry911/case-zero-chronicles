import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Clock, Flame, MapPin, Sparkles, Star, Trophy, TrendingUp, CheckCircle2, XCircle, PlayCircle } from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Card, CardTitle, CardDescription } from "@/components/case-zero/card";
import { LinkButton } from "@/components/case-zero/button";
import { Badge, DifficultyStars } from "@/components/case-zero/badge";
import { profile, recentCases, todaysCase } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Case Zero" },
      { name: "description", content: "Your daily case briefing, recent investigations, and stats." },
    ],
  }),
  component: Dashboard,
});

function statusBadge(status: typeof recentCases[number]["status"]) {
  if (status === "solved") return <Badge tone="success"><CheckCircle2 className="h-3 w-3" /> Solved</Badge>;
  if (status === "failed") return <Badge tone="danger"><XCircle className="h-3 w-3" /> Failed</Badge>;
  if (status === "in-progress") return <Badge tone="accent"><PlayCircle className="h-3 w-3" /> In progress</Badge>;
  return <Badge tone="muted">Available</Badge>;
}

function Dashboard() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Greeting */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent">{todaysCase.date}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              Good evening, <span className="text-foreground">{profile.name.split(" ").slice(-1)[0]}</span>.
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-accent" />
            New case in <span className="font-mono text-foreground">14h 22m</span>
          </div>
        </div>

        {/* Featured today's case */}
        <Card gradient className="relative overflow-hidden p-0">
          <div className="absolute inset-0 bg-grid opacity-30 [mask-image:linear-gradient(180deg,black,transparent)]" />
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="primary"><Sparkles className="h-3 w-3" /> Today's case</Badge>
                {statusBadge(todaysCase.status)}
              </div>

              <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                {todaysCase.title}
              </h2>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {todaysCase.number}
              </p>

              <p className="mt-5 max-w-xl text-base text-muted-foreground">
                {todaysCase.blurb}
              </p>

              <dl className="mt-7 grid max-w-lg grid-cols-3 gap-4">
                <Stat icon={Star} label="Difficulty" value={<DifficultyStars value={todaysCase.difficulty} />} />
                <Stat icon={Clock} label="Est. time" value={`${todaysCase.estimatedMinutes} min`} />
                <Stat icon={MapPin} label="Scene" value={todaysCase.location.split(" · ")[0]} />
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LinkButton to="/case/$caseId" params={{ caseId: todaysCase.id }} size="lg">
                  Continue investigation <ArrowRight className="h-4 w-4" />
                </LinkButton>
                <Link to="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  See who solved it →
                </Link>
              </div>
            </div>

            {/* Decorative case file */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 -rotate-2 rounded-xl border border-border bg-surface-elevated/60" />
              <div className="relative rotate-1 rounded-xl border border-border bg-background/80 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Evidence locker</span>
                  <span className="font-mono text-[10px] text-muted-foreground">CZ-001</span>
                </div>
                <div className="mt-4 space-y-2.5">
                  {["Torn ticket stub · Car 7", "Conductor's statement", "Encrypted message · 23:44", "Annotated blueprint"].map((line, i) => (
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

        {/* Stats row */}
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <StatCard icon={Trophy} label="Current rank" value={`#${profile.rank}`} hint={profile.rankTitle} tone="accent" />
          <StatCard icon={Flame} label="Daily streak" value={`${profile.streak} days`} hint="Best: 41" tone="primary" />
          <StatCard icon={TrendingUp} label="XP" value={profile.xp.toLocaleString()} hint={`${profile.xpToNext} to next level`} tone="default" />
        </div>

        {/* Recent cases */}
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent">Archive</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Recent cases</h2>
            </div>
            <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {recentCases.map((c) => (
              <Link
                key={c.id}
                to="/case/$caseId"
                params={{ caseId: c.id }}
                className="group"
              >
                <Card interactive className="h-full">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{c.number}</span>
                    {statusBadge(c.status)}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight group-hover:text-accent">{c.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.blurb}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{c.date}</span>
                    <DifficultyStars value={c.difficulty} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1.5 truncate text-sm font-semibold text-foreground">{value}</div>
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
    <Card gradient className="flex items-center gap-4">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ring-1 ${toneClasses}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-1 truncate text-2xl font-semibold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
    </Card>
  );
}
