import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, Network, Gavel, Sparkles, Clock, Layers } from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Card, CardTitle, CardDescription } from "@/components/case-zero/card";
import { LinkButton } from "@/components/case-zero/button";
import { Badge } from "@/components/case-zero/badge";
import { currentSeason } from "@/data/season";
import { todaysCase } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Case Zero — One murder. One chance. Every day." },
      { name: "description", content: "Become the detective. Investigate evidence, question suspects, and solve a brand-new mystery every day." },
      { property: "og:title", content: "Case Zero" },
      { property: "og:description", content: "One murder. One chance. Every day." },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Search,
    title: "Investigate",
    description: "Collect clues, sift through testimony, and examine every detail of the scene.",
  },
  {
    icon: Network,
    title: "Deduce",
    description: "Connect evidence, map relationships, and uncover the contradictions that matter.",
  },
  {
    icon: Gavel,
    title: "Accuse",
    description: "Name the killer before time runs out. One guess. One verdict. One outcome.",
  },
] as const;

function Landing() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge tone="accent" className="mb-6">
              <Sparkles className="h-3 w-3" /> {currentSeason.number} · Day {currentSeason.currentDay} of {currentSeason.totalDays}
            </Badge>
            <h1 className="text-balance font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block text-foreground">CASE ZERO</span>
              <span className="mt-4 block text-2xl font-light text-muted-foreground sm:text-3xl lg:text-4xl">
                A new murder arrives every day.
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
              Investigate the crime scene. Collect evidence. Question suspects. Solve today's mystery.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton to="/dashboard" size="lg">
                Open Case File <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton to="/os" variant="secondary" size="lg">
                <Layers className="h-4 w-4" /> Enter Headquarters
              </LinkButton>
            </div>

            <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4 text-center">
              {[
                { value: `${currentSeason.currentDay}/${currentSeason.totalDays}`, label: "Nights on file" },
                { value: currentSeason.sharedClues.length.toString(), label: "Threads collected" },
                { value: currentSeason.masterminStatus, label: "Mastermind" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border/60 bg-surface/50 px-3 py-4 backdrop-blur">
                  <div className="font-mono text-2xl font-semibold text-accent">{s.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent">The method</p>
            <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Three steps to a verdict.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Fifteen minutes. One chance. Make it count.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} gradient interactive className="group relative overflow-hidden">
                <div className="absolute right-4 top-4 font-mono text-xs text-muted-foreground/60">0{i + 1}</div>
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30 transition-colors group-hover:bg-primary/25">
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{f.title}</CardTitle>
                <CardDescription className="mt-2">{f.description}</CardDescription>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA strip */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card-gradient p-8 sm:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <Badge tone="primary"><Clock className="h-3 w-3" /> Resets at midnight</Badge>
              <h3 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                The next case is already waiting.
              </h3>
              <p className="mt-3 text-muted-foreground">
                Sharpen your instincts. Climb the leaderboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LinkButton to="/login" variant="accent" size="lg">Create account</LinkButton>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Or play as guest →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
