import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Eye,
  FileSearch,
  FileText,
  FileWarning,
  Fingerprint,
  Gavel,
  Lightbulb,
  MapPin,
  MessageSquare,
  NotebookPen,
  ShieldAlert,
  UserCircle2,
  Users,
} from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Card } from "@/components/case-zero/card";
import { Button } from "@/components/case-zero/button";
import { Badge, DifficultyStars } from "@/components/case-zero/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { case001, getCaseById, type Evidence, type Suspect, type SuspicionLevel } from "@/data/case001";
import { useInvestigation } from "@/lib/use-investigation";

export const Route = createFileRoute("/case/$caseId")({
  head: ({ params }) => {
    const c = getCaseById(params.caseId) ?? case001;
    return {
      meta: [
        { title: `${c.title} — Case Zero` },
        { name: "description", content: c.blurb },
      ],
    };
  },
  loader: ({ params }): Case => {
    const c = getCaseById(params.caseId) ?? (params.caseId === "case-001" ? case001 : undefined);
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

const suspicionMeta: Record<SuspicionLevel, { tone: "muted" | "warning" | "danger" | "primary"; label: string; bar: string }> = {
  low: { tone: "muted", label: "Low suspicion", bar: "w-1/4 bg-emerald-500/70" },
  medium: { tone: "warning", label: "Medium suspicion", bar: "w-2/4 bg-amber-400/80" },
  high: { tone: "danger", label: "High suspicion", bar: "w-3/4 bg-red-500/80" },
  prime: { tone: "primary", label: "Prime suspect", bar: "w-full bg-primary" },
};

function CaseDetails() {
  const c = Route.useLoaderData();
  const inv = useInvestigation(c.id, c.evidence.length, c.suspects.length);

  const [openEvidence, setOpenEvidence] = useState<Evidence | null>(null);
  const [openSuspect, setOpenSuspect] = useState<Suspect | null>(null);
  const [accusing, setAccusing] = useState<Suspect | null>(null);
  const [accused, setAccused] = useState<string | null>(null);

  const handleExamine = (e: Evidence) => {
    setOpenEvidence(e);
    inv.examineEvidence(e.id, e.notebookNote);
  };
  const handleInterview = (s: Suspect) => {
    setOpenSuspect(s);
    inv.interviewSuspect(s.id);
  };

  const notebookByEvidence = useMemo(() => {
    const map = new Map(inv.notebook.map((n) => [n.evidenceId, n] as const));
    return map;
  }, [inv.notebook]);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
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
                <Badge tone={accused ? "success" : "primary"}>{accused ? "Closed" : "Active"}</Badge>
              </div>
            </div>

            {/* Briefing */}
            <div className="mt-6 rounded-lg border border-border/60 bg-surface/60 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent">
                <BookOpen className="h-3.5 w-3.5" /> Case briefing
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.briefing}</p>
              <div className="mt-3 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
                <div><span className="block uppercase tracking-widest text-[10px]">Victim</span><span className="text-foreground">{c.victim.name}, {c.victim.age}</span></div>
                <div><span className="block uppercase tracking-widest text-[10px]">Cause of death</span><span className="text-foreground">{c.victim.causeOfDeath}</span></div>
                <div><span className="block uppercase tracking-widest text-[10px]">Time of death</span><span className="text-foreground">{c.victim.timeOfDeath}</span></div>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-5 rounded-lg border border-border/70 bg-surface p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="uppercase tracking-widest">Investigation progress</span>
                <span className="font-mono text-accent">{inv.progress}%</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  initial={false}
                  animate={{ width: `${inv.progress}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                <span><Eye className="mr-1 inline h-3 w-3 text-accent" />{inv.examined.size}/{c.evidence.length} evidence examined</span>
                <span><UserCircle2 className="mr-1 inline h-3 w-3 text-accent" />{inv.interviewed.size}/{c.suspects.length} suspects interviewed</span>
                <span><NotebookPen className="mr-1 inline h-3 w-3 text-accent" />{inv.notebook.length} notebook entries</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Two columns */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Evidence */}
          <Card className="lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                <h2 className="text-lg font-semibold">Evidence locker</h2>
              </div>
              <Badge tone="muted">{c.evidence.length} items</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {c.evidence.map((e, i) => {
                const Icon = evidenceIcon[e.tag];
                const examined = inv.examined.has(e.id);
                return (
                  <motion.button
                    key={e.id}
                    type="button"
                    onClick={() => handleExamine(e)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group rounded-lg border bg-surface p-4 text-left transition-colors ${examined ? "border-accent/40" : "border-border/70 hover:border-accent/40"}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ring-1 ${examined ? "bg-accent/15 text-accent ring-accent/30" : "bg-primary/15 text-primary ring-primary/30"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold">{e.label}</h3>
                          <Badge tone="muted" className="capitalize">{e.tag}</Badge>
                          {examined && (
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-accent">
                              <CheckCircle2 className="h-3 w-3" /> Examined
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{e.summary}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div className="text-sm">
                <p className="font-semibold text-accent">Deduction</p>
                <p className="mt-1 text-muted-foreground">
                  Two pieces of evidence place the same person in Car 7 at 23:51 — but their alibi
                  puts them elsewhere. Cross-reference the conductor's testimony with the cufflink.
                </p>
              </div>
            </div>

            {/* Notebook */}
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <NotebookPen className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Notebook</h3>
              </div>
              {inv.notebook.length === 0 ? (
                <p className="rounded-md border border-dashed border-border/60 bg-surface/40 p-4 text-sm text-muted-foreground">
                  Examine evidence to record observations here.
                </p>
              ) : (
                <ul className="space-y-2">
                  <AnimatePresence initial={false}>
                    {inv.notebook.map((n) => {
                      const ev = c.evidence.find((x) => x.id === n.evidenceId);
                      return (
                        <motion.li
                          key={n.evidenceId}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex gap-3 rounded-md border border-border/60 bg-surface/60 p-3"
                        >
                          <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-sm font-semibold">{ev?.label}</span>
                              <span className="font-mono text-[10px] text-muted-foreground">{n.at}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{n.note}</p>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </Card>

          {/* Suspects */}
          <Card>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                <h2 className="text-lg font-semibold">Suspects</h2>
              </div>
              <Badge tone="muted">{c.suspects.length}</Badge>
            </div>
            <ul className="space-y-2.5">
              {c.suspects.map((s, i) => {
                const interviewed = inv.interviewed.has(s.id);
                const meta = suspicionMeta[s.suspicion];
                return (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                  >
                    <button
                      type="button"
                      onClick={() => handleInterview(s)}
                      className={`group flex w-full items-center gap-3 rounded-lg border bg-surface p-3 text-left transition-colors ${interviewed ? "border-accent/40" : "border-border/70 hover:border-primary/40"}`}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 font-mono text-xs font-semibold">
                        {s.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold">{s.name}</span>
                          {interviewed && <CheckCircle2 className="h-3.5 w-3.5 text-accent" />}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{s.occupation}</div>
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted/30">
                          <div className={`h-full rounded-full ${meta.bar}`} />
                        </div>
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </ul>

            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <AlertTriangle className="h-4 w-4" /> One accusation only
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                When you're ready, name the killer. There are no second chances on a daily case.
              </p>
              {accused ? (
                <div className="mt-4 rounded-md border border-accent/40 bg-accent/10 p-3 text-xs text-accent">
                  Accusation filed against <span className="font-semibold">{c.suspects.find((s) => s.id === accused)?.name}</span>. Case sealed.
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {c.suspects.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setAccusing(s)}
                      className="flex w-full items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2 text-xs transition hover:border-primary/40"
                    >
                      <span>{s.name}</span>
                      <Gavel className="h-3.5 w-3.5 text-primary" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Evidence modal */}
      <Dialog open={!!openEvidence} onOpenChange={(o) => !o && setOpenEvidence(null)}>
        <DialogContent className="max-w-2xl border-border/70 bg-surface text-foreground">
          {openEvidence && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge tone="accent" className="capitalize">{openEvidence.tag}</Badge>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">EV · {openEvidence.id.toUpperCase()}</span>
                </div>
                <DialogTitle className="mt-2 text-2xl">{openEvidence.label}</DialogTitle>
                <DialogDescription>{openEvidence.summary}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p className="leading-relaxed text-foreground/90">{openEvidence.detail}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Location" value={openEvidence.location} />
                  <Field label="Collected at" value={openEvidence.collectedAt} />
                  <Field label="Collected by" value={openEvidence.collectedBy} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Chain of custody</p>
                  <ol className="mt-2 space-y-1.5">
                    {openEvidence.chainOfCustody.map((step, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 font-mono text-[10px] text-primary">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="rounded-md border border-accent/30 bg-accent/5 p-3 text-xs text-accent">
                  <NotebookPen className="mr-1.5 inline h-3 w-3" /> Added to notebook: {notebookByEvidence.get(openEvidence.id)?.note ?? openEvidence.notebookNote}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspect drawer */}
      <Sheet open={!!openSuspect} onOpenChange={(o) => !o && setOpenSuspect(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto border-border/70 bg-surface text-foreground sm:max-w-lg">
          {openSuspect && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 font-mono text-sm font-semibold">
                    {openSuspect.initials}
                  </span>
                  <div className="min-w-0">
                    <SheetTitle className="truncate text-xl">{openSuspect.name}</SheetTitle>
                    <SheetDescription className="truncate">{openSuspect.occupation}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-4 space-y-5 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Suspicion level</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Badge tone={suspicionMeta[openSuspect.suspicion].tone}>
                      <ShieldAlert className="h-3 w-3" /> {suspicionMeta[openSuspect.suspicion].label}
                    </Badge>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{}}
                      className={`h-full rounded-full ${suspicionMeta[openSuspect.suspicion].bar}`}
                    />
                  </div>
                </div>

                <Field label="Relationship to victim" value={openSuspect.relationship} />
                <Field label="Motive" value={openSuspect.motive} />
                <Field label="Alibi" value={openSuspect.alibi} />

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Statement</p>
                  <blockquote className="mt-2 border-l-2 border-accent/60 bg-surface-elevated/40 p-3 text-sm italic text-foreground/90">
                    {openSuspect.statement}
                  </blockquote>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Timeline</p>
                  <ol className="mt-3 space-y-3">
                    {openSuspect.timeline.map((t, i) => (
                      <motion.li
                        key={t.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i }}
                        className="relative flex gap-3 pl-1"
                      >
                        <span className="font-mono text-xs text-accent w-12 shrink-0">{t.time}</span>
                        <div className="min-w-0 flex-1 border-l border-border/60 pl-3">
                          <p className="text-sm font-semibold">{t.label}</p>
                          <p className="text-xs text-muted-foreground">{t.detail}</p>
                        </div>
                      </motion.li>
                    ))}
                  </ol>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setAccusing(openSuspect);
                    setOpenSuspect(null);
                  }}
                >
                  <Gavel className="h-4 w-4" /> Accuse {openSuspect.name}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Accusation confirm */}
      <Dialog open={!!accusing} onOpenChange={(o) => !o && setAccusing(null)}>
        <DialogContent className="max-w-md border-border/70 bg-surface text-foreground">
          {accusing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Gavel className="h-5 w-5 text-primary" /> Make accusation
                </DialogTitle>
                <DialogDescription>
                  You are about to formally accuse <span className="font-semibold text-foreground">{accusing.name}</span> of the murder of {c.victim.name}. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setAccusing(null)}>Cancel</Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setAccused(accusing.id);
                    setAccusing(null);
                  }}
                >
                  Confirm accusation
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}
