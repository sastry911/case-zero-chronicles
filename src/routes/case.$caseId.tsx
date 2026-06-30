import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, MapPin, Calendar, FileText, Users, Lightbulb, Gavel, FileSearch, MessageSquare, Cpu, FileWarning, AlertTriangle } from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Card, CardTitle, CardDescription } from "@/components/case-zero/card";
import { Button, LinkButton } from "@/components/case-zero/button";
import { Badge, DifficultyStars } from "@/components/case-zero/badge";
import { caseEvidence, caseSuspects, recentCases, todaysCase } from "@/lib/mock-data";

export const Route = createFileRoute("/case/$caseId")({
  head: ({ params }) => {
    const all = [todaysCase, ...recentCases];
    const c = all.find((x) => x.id === params.caseId);
    return {
      meta: [
        { title: c ? `${c.title} — Case Zero` : "Case — Case Zero" },
        { name: "description", content: c?.blurb ?? "Case details" },
      ],
    };
  },
  loader: ({ params }) => {
    const all = [todaysCase, ...recentCases];
    const c = all.find((x) => x.id === params.caseId);
    if (!c) throw notFound();
    return c;
  },
  component: CaseDetails,
  notFoundComponent: () => (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Case not in file.</h1>
        <p className="mt-2 text-muted-foreground">This investigation doesn't exist or has been sealed.</p>
        <Link to="/dashboard" className="mt-6 inline-block text-accent hover:underline">← Back to dashboard</Link>
      </div>
    </PageLayout>
  ),
  errorComponent: ({ reset }) => (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong.</h1>
        <Button onClick={reset} className="mt-6">Try again</Button>
      </div>
    </PageLayout>
  ),
});

const evidenceIcon = {
  physical: FileSearch,
  witness: MessageSquare,
  digital: Cpu,
  document: FileWarning,
} as const;

function CaseDetails() {
  const c = Route.useLoaderData();

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        {/* Header */}
        <Card gradient className="mt-5 overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">{c.number}</p>
              <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{c.title}</h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">{c.blurb}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-accent" />{c.date}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-accent" />{c.location}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-accent" />{c.estimatedMinutes} min</span>
                <span className="flex items-center gap-1.5">Difficulty <DifficultyStars value={c.difficulty} /></span>
              </div>
            </div>
            <div className="shrink-0">
              <Badge tone="primary">Active</Badge>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-7 rounded-lg border border-border/70 bg-surface p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="uppercase tracking-widest">Investigation progress</span>
              <span className="font-mono text-accent">42%</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
              <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-primary to-accent" />
            </div>
          </div>
        </Card>

        {/* Two columns */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Evidence */}
          <Card className="lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                <h2 className="text-lg font-semibold">Evidence locker</h2>
              </div>
              <Badge tone="muted">{caseEvidence.length} items</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {caseEvidence.map((e) => {
                const Icon = evidenceIcon[e.tag];
                return (
                  <div key={e.id} className="group rounded-lg border border-border/70 bg-surface p-4 transition-colors hover:border-accent/40">
                    <div className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/30">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold">{e.label}</h3>
                          <Badge tone="muted" className="capitalize">{e.tag}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{e.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Deduction hint */}
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div className="text-sm">
                <p className="font-semibold text-accent">Deduction</p>
                <p className="mt-1 text-muted-foreground">
                  Two pieces of evidence place the same person in Car 7 at 23:51 — but their alibi
                  puts them three cars away. Cross-reference the conductor's statement.
                </p>
              </div>
            </div>
          </Card>

          {/* Suspects */}
          <Card>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                <h2 className="text-lg font-semibold">Suspects</h2>
              </div>
              <Badge tone="muted">{caseSuspects.length}</Badge>
            </div>
            <ul className="space-y-2.5">
              {caseSuspects.map((s) => (
                <li key={s.id} className="group flex items-center gap-3 rounded-lg border border-border/70 bg-surface p-3 transition-colors hover:border-primary/40">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 font-mono text-xs font-semibold">
                    {s.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{s.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{s.role}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <AlertTriangle className="h-4 w-4" /> One accusation only
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                When you're ready, name the killer. There are no second chances on a daily case.
              </p>
              <Button variant="primary" className="mt-4 w-full">
                <Gavel className="h-4 w-4" /> Make accusation
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
