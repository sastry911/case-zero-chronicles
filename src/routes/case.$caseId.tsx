import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState, type CSSProperties } from "react";
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
  Flame,
  Gavel,
  GitCompare,
  Lightbulb,
  MapPin,
  MessageSquare,
  NotebookPen,
  Pin,
  PinOff,
  Plus,
  ScanSearch,
  ShieldAlert,
  Sparkles,
  Star,
  Trash2,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Card } from "@/components/case-zero/card";
import { Button } from "@/components/case-zero/button";
import { Badge, DifficultyStars } from "@/components/case-zero/badge";
import { AnimatedNumber } from "@/components/case-zero/animated-number";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  case001,
  getCaseById,
  type Case,
  type Evidence,
  type Importance,
  type Suspect,
  type SuspicionLevel,
} from "@/data/case001";
import { useInvestigation } from "@/lib/use-investigation";
import crimeSceneImg from "@/assets/crime-scene-train.jpg";

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
  component: InvestigationDesk,
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

const importanceTone: Record<Importance, { tone: "muted" | "accent" | "warning" | "danger"; label: string }> = {
  low: { tone: "muted", label: "Low" },
  medium: { tone: "accent", label: "Medium" },
  high: { tone: "warning", label: "High" },
  critical: { tone: "danger", label: "Critical" },
};

const suspicionMeta: Record<SuspicionLevel, { tone: "muted" | "warning" | "danger" | "primary"; label: string; bar: string; ring: string }> = {
  low: { tone: "muted", label: "Low", bar: "bg-emerald-500/70", ring: "ring-emerald-500/30" },
  medium: { tone: "warning", label: "Medium", bar: "bg-amber-400/80", ring: "ring-amber-400/30" },
  high: { tone: "danger", label: "High", bar: "bg-red-500/80", ring: "ring-red-500/40" },
  prime: { tone: "primary", label: "Prime", bar: "bg-primary", ring: "ring-primary/50" },
};

function InvestigationDesk() {
  const c = Route.useLoaderData() as Case;
  const inv = useInvestigation(c);

  const [openEvidence, setOpenEvidence] = useState<Evidence | null>(null);
  const [openSuspect, setOpenSuspect] = useState<Suspect | null>(null);
  const [accusing, setAccusing] = useState<Suspect | null>(null);
  const [accused, setAccused] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [activeReveal, setActiveReveal] = useState<string | null>(null);

  const handleExamineFromCard = (e: Evidence, ev?: React.MouseEvent) => {
    const x = ev ? ev.clientX : undefined;
    const y = ev ? ev.clientY : undefined;
    setOpenEvidence(e);
    inv.examineEvidence(e, x, y);
  };

  const handleHotspot = (hotspotId: string, evidenceId: string, ev: React.MouseEvent) => {
    setActiveReveal(hotspotId);
    setTimeout(() => setActiveReveal(null), 900);
    inv.investigateHotspot(hotspotId, ev.clientX, ev.clientY);
    const evObj = c.evidence.find((x) => x.id === evidenceId);
    if (evObj) setTimeout(() => setOpenEvidence(evObj), 380);
  };

  const handleInterview = (s: Suspect) => {
    setOpenSuspect(s);
    inv.interviewSuspect(s.id);
  };

  const sortedSuspects = useMemo(
    () => [...c.suspects].sort((a, b) => inv.suspicionScores[b.id].score - inv.suspicionScores[a.id].score),
    [c.suspects, inv.suspicionScores],
  );

  const pinnedNotes = inv.notebook.filter((n) => n.pinned);
  const otherNotes = inv.notebook.filter((n) => !n.pinned);
  const compareEvidence = inv.compareSet
    .map((id) => c.evidence.find((e) => e.id === id))
    .filter(Boolean) as Evidence[];

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between gap-3">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Badge tone={accused ? "success" : "primary"}>{accused ? "Case closed" : "Live investigation"}</Badge>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{c.number}</span>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
          {/* ===================== LEFT ===================== */}
          <div className="flex flex-col gap-5">
            <CaseOverviewPanel c={c} />
            <ProgressPanel c={c} inv={inv} />
            <IntuitionPanel intuition={inv.intuition} xp={inv.xp} />
          </div>

          {/* ===================== CENTER ===================== */}
          <div className="flex flex-col gap-5">
            <CrimeScenePanel
              c={c}
              investigated={inv.investigated}
              examined={inv.examined}
              onHotspot={handleHotspot}
              activeReveal={activeReveal}
            />

            <EvidenceLockerPanel
              c={c}
              inv={inv}
              onOpen={handleExamineFromCard}
            />

            <ActiveCluesPanel
              c={c}
              compareEvidence={compareEvidence}
              onClear={inv.clearCompare}
            />
          </div>

          {/* ===================== RIGHT ===================== */}
          <div className="flex flex-col gap-5">
            <SuspectsPanel
              suspects={sortedSuspects}
              scores={inv.suspicionScores}
              interviewed={inv.interviewed}
              onPick={handleInterview}
            />
            <TimelinePanel timeline={inv.timeline} totalUnlockable={c.evidence.filter((e) => e.timelineUnlock).length} examined={inv.examined} />
            <NotebookPanel
              c={c}
              pinned={pinnedNotes}
              others={otherNotes}
              noteDraft={noteDraft}
              setNoteDraft={setNoteDraft}
              onAdd={() => {
                inv.addCustomNote(noteDraft);
                setNoteDraft("");
              }}
              onTogglePin={inv.togglePin}
              onRemove={inv.removeNote}
              onUpdate={inv.updateNote}
            />
            <AccusationPanel
              c={c}
              accused={accused}
              onAccuse={(s) => setAccusing(s)}
              scores={inv.suspicionScores}
            />
          </div>
        </div>
      </motion.div>

      {/* ============= Evidence Modal ============= */}
      <EvidenceModal
        evidence={openEvidence}
        important={openEvidence ? inv.important.has(openEvidence.id) : false}
        inCompare={openEvidence ? inv.compareSet.includes(openEvidence.id) : false}
        suspects={c.suspects}
        onClose={() => setOpenEvidence(null)}
        onToggleImportant={(id) => inv.toggleImportant(id)}
        onToggleCompare={(id) => inv.toggleCompare(id)}
        onPickSuspect={(id) => {
          const s = c.suspects.find((x) => x.id === id);
          if (s) {
            setOpenEvidence(null);
            handleInterview(s);
          }
        }}
      />

      {/* ============= Suspect Drawer ============= */}
      <SuspectDrawer
        suspect={openSuspect}
        score={openSuspect ? inv.suspicionScores[openSuspect.id] : undefined}
        relatedEvidence={openSuspect ? c.evidence.filter((e) => e.relatedSuspectIds.includes(openSuspect.id)) : []}
        examined={inv.examined}
        onClose={() => setOpenSuspect(null)}
        onAccuse={(s) => {
          setAccusing(s);
          setOpenSuspect(null);
        }}
      />

      {/* ============= Accusation Modal ============= */}
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

/* =====================================================================
   LEFT PANELS
   ===================================================================== */

function CaseOverviewPanel({ c }: { c: Case }) {
  return (
    <Card gradient className="overflow-hidden">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Case overview</p>
      <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight">{c.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{c.blurb}</p>

      <dl className="mt-5 space-y-2 text-xs">
        <Row icon={Calendar} label="Date" value={c.date} />
        <Row icon={MapPin} label="Scene" value={c.location} />
        <Row icon={Clock} label="Est." value={`${c.estimatedMinutes} min`} />
        <Row icon={Star} label="Difficulty" value={<DifficultyStars value={c.difficulty} />} />
      </dl>

      <div className="mt-5 rounded-md border border-border/60 bg-background/40 p-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Victim</p>
        <p className="mt-1 text-sm font-semibold">{c.victim.name}, {c.victim.age}</p>
        <p className="text-xs text-muted-foreground">{c.victim.occupation}</p>
        <p className="mt-2 text-[11px] text-muted-foreground"><span className="text-accent">COD:</span> {c.victim.causeOfDeath}</p>
        <p className="text-[11px] text-muted-foreground"><span className="text-accent">TOD:</span> {c.victim.timeOfDeath}</p>
      </div>
    </Card>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3 text-accent" /> {label}
      </span>
      <span className="truncate text-right text-foreground">{value}</span>
    </div>
  );
}

function ProgressPanel({ c, inv }: { c: Case; inv: ReturnType<typeof useInvestigation> }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Investigation progress</p>
        <AnimatedNumber value={inv.progress} className="font-mono text-sm font-bold text-accent" format={(n) => `${n}%`} />
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted/30 ring-1 ring-border/60">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent shadow-glow"
          initial={false}
          animate={{ width: `${inv.progress}%` }}
          transition={{ type: "spring", stiffness: 110, damping: 20 }}
        />
      </div>
      <div className="mt-4 space-y-2.5 text-[11px]">
        <MiniStat icon={ScanSearch} label="Crime scene" value={inv.investigated.size} max={c.hotspots.length} />
        <MiniStat icon={Eye} label="Evidence examined" value={inv.examined.size} max={c.evidence.length} />
        <MiniStat icon={UserCircle2} label="Suspects interviewed" value={inv.interviewed.size} max={c.suspects.length} />
        <MiniStat icon={NotebookPen} label="Notebook entries" value={inv.notebook.length} />
      </div>
    </Card>
  );
}

function MiniStat({ icon: Icon, label, value, max }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; max?: number }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border/50 bg-background/40 px-2.5 py-1.5">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3 text-accent" /> {label}
      </span>
      <span className="font-mono text-foreground">
        <AnimatedNumber value={value} duration={500} />
        {typeof max === "number" && <span className="text-muted-foreground">/{max}</span>}
      </span>
    </div>
  );
}

function IntuitionPanel({ intuition, xp }: { intuition: number; xp: number }) {
  const charged = intuition >= 100;
  return (
    <Card className={`relative overflow-hidden ${charged ? "ring-1 ring-accent/40" : ""}`}>
      {charged && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl"
          animate={{ boxShadow: ["0 0 0 0 rgba(212,175,55,0)", "0 0 28px 4px rgba(212,175,55,0.35)", "0 0 0 0 rgba(212,175,55,0)"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`grid h-8 w-8 place-items-center rounded-lg ring-1 ${charged ? "bg-accent/15 text-accent ring-accent/40" : "bg-primary/15 text-primary ring-primary/30"}`}>
            <Flame className="h-4 w-4" />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Detective intuition</p>
            <p className="text-xs text-muted-foreground">{charged ? "Hints available" : "Builds with key clues"}</p>
          </div>
        </div>
        <AnimatedNumber value={intuition} className="font-mono text-lg font-bold text-foreground" format={(n) => `${n}`} />
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
        <motion.div
          initial={false}
          animate={{ width: `${intuition}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          className={`h-full rounded-full ${charged ? "bg-gradient-to-r from-accent to-amber-300" : "bg-gradient-to-r from-primary to-accent"}`}
        />
      </div>
      <div className="mt-3 flex items-center justify-between rounded-md border border-border/50 bg-background/40 px-2.5 py-2 text-[11px]">
        <span className="flex items-center gap-1.5 text-muted-foreground"><Sparkles className="h-3 w-3 text-accent" /> Session XP</span>
        <AnimatedNumber value={xp} className="font-mono font-semibold text-accent" format={(n) => `+${n}`} />
      </div>
    </Card>
  );
}

/* =====================================================================
   CENTER PANELS
   ===================================================================== */

function CrimeScenePanel({
  c,
  investigated,
  examined,
  onHotspot,
  activeReveal,
}: {
  c: Case;
  investigated: Set<string>;
  examined: Set<string>;
  onHotspot: (hotspotId: string, evidenceId: string, ev: React.MouseEvent) => void;
  activeReveal: string | null;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <ScanSearch className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-widest">Crime scene · Car 7</h2>
        </div>
        <Badge tone="muted">
          {investigated.size}/{c.hotspots.length} objects investigated
        </Badge>
      </div>
      <div className="relative aspect-[16/9] w-full">
        <img
          src={crimeSceneImg}
          alt="Crime scene interior of train Car 7"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          width={1280}
          height={720}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-background/30" />

        {c.hotspots.map((h) => {
          const done = investigated.has(h.id) || examined.has(h.evidenceId);
          const revealing = activeReveal === h.id;
          return (
            <button
              key={h.id}
              type="button"
              onClick={(e) => onHotspot(h.id, h.evidenceId, e)}
              disabled={done}
              aria-label={h.label}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${h.x}%`, top: `${h.y}%` } as CSSProperties}
            >
              <span className="relative grid place-items-center">
                {!done && (
                  <motion.span
                    aria-hidden
                    className="absolute h-10 w-10 rounded-full bg-accent/30"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <span
                  className={`relative grid h-5 w-5 place-items-center rounded-full ring-2 ring-background transition-all ${
                    done
                      ? "bg-accent/30 text-accent ring-accent/60"
                      : "bg-accent text-background shadow-glow group-hover:scale-110"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                </span>
              </span>
              <AnimatePresence>
                {revealing && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-accent/40 bg-background/90 px-2 py-1 text-[10px] font-medium text-accent backdrop-blur"
                  >
                    {h.label}
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="pointer-events-none absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border/60 bg-background/90 px-2 py-1 text-[10px] text-muted-foreground group-hover:block">
                {h.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
        Move across the scene — glowing points reveal evidence. Each examination feeds your detective intuition.
      </div>
    </Card>
  );
}

function EvidenceLockerPanel({
  c,
  inv,
  onOpen,
}: {
  c: Case;
  inv: ReturnType<typeof useInvestigation>;
  onOpen: (e: Evidence, ev?: React.MouseEvent) => void;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-widest">Evidence locker</h2>
        </div>
        <Badge tone="muted">{inv.examined.size}/{c.evidence.length} collected</Badge>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
        {c.evidence.map((e, i) => {
          const examined = inv.examined.has(e.id);
          const important = inv.important.has(e.id);
          const compare = inv.compareSet.includes(e.id);
          const Icon = evidenceIcon[e.tag];
          const imp = importanceTone[e.importance];
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.3 }}
              whileHover={{ y: -3 }}
              className="relative"
            >
              <button
                type="button"
                onClick={(ev) => onOpen(e, ev)}
                className={`group relative flex h-full w-full flex-col gap-3 overflow-hidden rounded-lg border bg-gradient-to-br from-surface to-background/40 p-4 text-left transition-all ${
                  examined ? "border-accent/40 shadow-glow" : "border-border/70 hover:border-accent/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`grid h-9 w-9 place-items-center rounded-md ring-1 ${examined ? "bg-accent/15 text-accent ring-accent/30" : "bg-primary/15 text-primary ring-primary/30"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={imp.tone}>{imp.label}</Badge>
                    {examined ? (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest text-accent">
                        <CheckCircle2 className="h-3 w-3" /> Logged
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Unexamined</span>
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-foreground">{e.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {examined ? e.summary : "Tap to examine — details restricted until reviewed."}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-2 text-[10px] uppercase tracking-widest">
                  <span className="text-muted-foreground capitalize">{e.tag}</span>
                  <span className="font-mono text-accent">+{e.xp} XP</span>
                </div>
                {(important || compare) && (
                  <span className="absolute left-2 top-2 flex gap-1">
                    {important && <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40"><Star className="h-3 w-3" /></span>}
                    {compare && <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/20 text-primary ring-1 ring-primary/40"><GitCompare className="h-3 w-3" /></span>}
                  </span>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

function ActiveCluesPanel({
  c,
  compareEvidence,
  onClear,
}: {
  c: Case;
  compareEvidence: Evidence[];
  onClear: () => void;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-widest">Active clues</h2>
        </div>
        {compareEvidence.length > 0 && (
          <button onClick={onClear} className="text-[11px] text-muted-foreground hover:text-foreground">Clear</button>
        )}
      </div>
      {compareEvidence.length === 0 ? (
        <p className="mt-3 rounded-md border border-dashed border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
          Open an evidence card and pick <span className="text-accent">Compare</span> to line up two clues side-by-side.
        </p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {compareEvidence.map((e) => (
            <div key={e.id} className="rounded-md border border-primary/30 bg-primary/5 p-3">
              <p className="text-[10px] uppercase tracking-widest text-primary">{e.tag}</p>
              <p className="mt-1 text-sm font-semibold">{e.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{e.summary}</p>
            </div>
          ))}
          {compareEvidence.length === 2 && (
            <div className="sm:col-span-2 flex items-start gap-2 rounded-md border border-accent/30 bg-accent/5 p-3 text-xs text-muted-foreground">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              Look for overlapping people, places, or timings — the killer hides in the seam between two truths.
            </div>
          )}
        </div>
      )}
      {/* Hint when intuition is full */}
      <DeductionHint c={c} />
    </Card>
  );
}

function DeductionHint({ c }: { c: Case }) {
  void c;
  return (
    <div className="mt-4 flex items-start gap-2 rounded-md border border-border/60 bg-background/40 p-3 text-xs text-muted-foreground">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
      Two pieces of evidence place the same person in Car 7 at 23:51 — but their alibi puts them elsewhere. Cross-reference the conductor's testimony with the cufflink.
    </div>
  );
}

/* =====================================================================
   RIGHT PANELS
   ===================================================================== */

function SuspectsPanel({
  suspects,
  scores,
  interviewed,
  onPick,
}: {
  suspects: Suspect[];
  scores: Record<string, { score: number; band: SuspicionLevel }>;
  interviewed: Set<string>;
  onPick: (s: Suspect) => void;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-widest">Suspects</h2>
        </div>
        <Badge tone="muted">{suspects.length}</Badge>
      </div>
      <ul className="divide-y divide-border/50">
        {suspects.map((s, i) => {
          const score = scores[s.id];
          const meta = suspicionMeta[score.band];
          const seen = interviewed.has(s.id);
          return (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
            >
              <button
                type="button"
                onClick={() => onPick(s)}
                className="group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-elevated/40"
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 font-mono text-xs font-semibold ring-1 ${meta.ring}`}>
                  {s.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{s.name}</span>
                    {seen && <CheckCircle2 className="h-3.5 w-3.5 text-accent" />}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">{s.occupation}</div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
                    <motion.div
                      initial={false}
                      animate={{ width: `${score.score}%` }}
                      transition={{ type: "spring", stiffness: 110, damping: 22 }}
                      className={`h-full rounded-full ${meta.bar}`}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                    <AnimatedNumber value={score.score} duration={500} />
                  </div>
                </div>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </Card>
  );
}

function TimelinePanel({ timeline, totalUnlockable, examined }: { timeline: { id: string; time: string; label: string; detail: string }[]; totalUnlockable: number; examined: Set<string> }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-widest">Timeline</h2>
        </div>
        <Badge tone="muted">{examined.size}/{totalUnlockable} unlocks</Badge>
      </div>
      <ol className="relative mt-4 space-y-3">
        <span aria-hidden className="absolute left-[22px] top-1 bottom-1 w-px bg-border/60" />
        <AnimatePresence initial={false}>
          {timeline.map((t) => (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              className="relative flex items-start gap-3 pl-1"
            >
              <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface ring-1 ring-border/70">
                <span className="font-mono text-[10px] font-bold text-accent">{t.time}</span>
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-sm font-semibold">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.detail}</p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </Card>
  );
}

function NotebookPanel({
  c,
  pinned,
  others,
  noteDraft,
  setNoteDraft,
  onAdd,
  onTogglePin,
  onRemove,
  onUpdate,
}: {
  c: Case;
  pinned: { id: string; evidenceId: string; note: string; at: string; pinned: boolean; custom: boolean }[];
  others: { id: string; evidenceId: string; note: string; at: string; pinned: boolean; custom: boolean }[];
  noteDraft: string;
  setNoteDraft: (v: string) => void;
  onAdd: () => void;
  onTogglePin: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, n: string) => void;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-widest">Detective notebook</h2>
        </div>
        <Badge tone="muted">{pinned.length + others.length}</Badge>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onAdd(); }}
          placeholder="Add a hunch, theory, or clue…"
          className="flex-1 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent/60 focus:outline-none"
        />
        <Button size="sm" variant="secondary" onClick={onAdd}><Plus className="h-3.5 w-3.5" /></Button>
      </div>

      <div className="mt-4 space-y-3">
        {pinned.length > 0 && (
          <Section title="Pinned">
            <NoteList notes={pinned} c={c} onTogglePin={onTogglePin} onRemove={onRemove} onUpdate={onUpdate} />
          </Section>
        )}
        {others.length > 0 && (
          <Section title="Log">
            <NoteList notes={others} c={c} onTogglePin={onTogglePin} onRemove={onRemove} onUpdate={onUpdate} />
          </Section>
        )}
        {pinned.length === 0 && others.length === 0 && (
          <p className="rounded-md border border-dashed border-border/60 bg-background/40 p-4 text-xs text-muted-foreground">
            Notes appear here as you examine evidence. Critical clues are pinned automatically.
          </p>
        )}
      </div>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function NoteList({
  notes,
  c,
  onTogglePin,
  onRemove,
  onUpdate,
}: {
  notes: { id: string; evidenceId: string; note: string; at: string; pinned: boolean; custom: boolean }[];
  c: Case;
  onTogglePin: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, n: string) => void;
}) {
  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {notes.map((n) => {
          const ev = c.evidence.find((x) => x.id === n.evidenceId);
          return (
            <motion.li
              key={n.id}
              layout
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              className="group rounded-md border border-border/60 bg-background/40 p-3 transition-colors hover:border-accent/30"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-semibold text-foreground">
                  {ev?.label ?? (n.custom ? "Personal note" : "Note")}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">{n.at}</span>
              </div>
              {n.custom ? (
                <textarea
                  value={n.note}
                  onChange={(e) => onUpdate(n.id, e.target.value)}
                  className="mt-1 w-full resize-none bg-transparent text-xs text-muted-foreground focus:outline-none"
                  rows={2}
                />
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">{n.note}</p>
              )}
              <div className="mt-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => onTogglePin(n.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  {n.pinned ? <><PinOff className="h-3 w-3" /> Unpin</> : <><Pin className="h-3 w-3" /> Pin</>}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(n.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

function AccusationPanel({
  c,
  accused,
  scores,
  onAccuse,
}: {
  c: Case;
  accused: string | null;
  scores: Record<string, { score: number; band: SuspicionLevel }>;
  onAccuse: (s: Suspect) => void;
}) {
  if (accused) {
    const s = c.suspects.find((x) => x.id === accused);
    return (
      <Card className="border-accent/40">
        <div className="flex items-center gap-2 text-sm font-semibold text-accent">
          <Gavel className="h-4 w-4" /> Accusation filed
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Case sealed against <span className="font-semibold text-foreground">{s?.name}</span>. The verdict ships at dawn.
        </p>
      </Card>
    );
  }
  return (
    <Card>
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <AlertTriangle className="h-4 w-4" /> One accusation only
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Name the killer when you're certain. No second chances.
      </p>
      <div className="mt-3 space-y-2">
        {c.suspects.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onAccuse(s)}
            className="flex w-full items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2 text-xs transition hover:border-primary/40"
          >
            <span className="truncate">{s.name}</span>
            <span className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="font-mono">{scores[s.id].score}</span>
              <Gavel className="h-3.5 w-3.5 text-primary" />
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

/* =====================================================================
   MODALS / DRAWERS
   ===================================================================== */

function EvidenceModal({
  evidence,
  important,
  inCompare,
  suspects,
  onClose,
  onToggleImportant,
  onToggleCompare,
  onPickSuspect,
}: {
  evidence: Evidence | null;
  important: boolean;
  inCompare: boolean;
  suspects: Suspect[];
  onClose: () => void;
  onToggleImportant: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onPickSuspect: (id: string) => void;
}) {
  return (
    <Dialog open={!!evidence} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl border-border/70 bg-surface text-foreground">
        {evidence && (
          <motion.div
            initial={{ opacity: 0, rotateX: -8, y: 8 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ transformPerspective: 800 }}
          >
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent" className="capitalize">{evidence.tag}</Badge>
                <Badge tone={importanceTone[evidence.importance].tone}>{importanceTone[evidence.importance].label} importance</Badge>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">EV · {evidence.id.toUpperCase()}</span>
                <span className="ml-auto font-mono text-[10px] text-accent">+{evidence.xp} XP</span>
              </div>
              <DialogTitle className="mt-2 text-2xl">{evidence.label}</DialogTitle>
              <DialogDescription>{evidence.summary}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              <p className="leading-relaxed text-foreground/90">{evidence.detail}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Location" value={evidence.location} />
                <Field label="Collected at" value={evidence.collectedAt} />
                <Field label="Collected by" value={evidence.collectedBy} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Chain of custody</p>
                <ol className="mt-2 space-y-1.5">
                  {evidence.chainOfCustody.map((step, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 font-mono text-[10px] text-primary">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {evidence.relatedSuspectIds.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Related suspects</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {evidence.relatedSuspectIds.map((sid) => {
                      const s = suspects.find((x) => x.id === sid);
                      if (!s) return null;
                      return (
                        <button
                          key={sid}
                          type="button"
                          onClick={() => onPickSuspect(sid)}
                          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs hover:border-primary/40"
                        >
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 font-mono text-[9px] font-bold">{s.initials}</span>
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="rounded-md border border-accent/30 bg-accent/5 p-3 text-xs text-accent">
                <NotebookPen className="mr-1.5 inline h-3 w-3" /> Added to notebook: {evidence.notebookNote}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant={important ? "accent" : "secondary"}
                  onClick={() => onToggleImportant(evidence.id)}
                >
                  <Star className="h-3.5 w-3.5" /> {important ? "Marked important" : "Mark important"}
                </Button>
                <Button
                  size="sm"
                  variant={inCompare ? "primary" : "secondary"}
                  onClick={() => onToggleCompare(evidence.id)}
                >
                  <GitCompare className="h-3.5 w-3.5" /> {inCompare ? "In compare" : "Compare"}
                </Button>
                <Button size="sm" variant="ghost" onClick={onClose}>
                  <X className="h-3.5 w-3.5" /> Close
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuspectDrawer({
  suspect,
  score,
  relatedEvidence,
  examined,
  onClose,
  onAccuse,
}: {
  suspect: Suspect | null;
  score?: { score: number; band: SuspicionLevel };
  relatedEvidence: Evidence[];
  examined: Set<string>;
  onClose: () => void;
  onAccuse: (s: Suspect) => void;
}) {
  return (
    <Sheet open={!!suspect} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto border-border/70 bg-surface text-foreground sm:max-w-lg">
        {suspect && score && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <span className={`grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-primary/30 via-surface to-accent/20 font-mono text-base font-semibold ring-1 ${suspicionMeta[score.band].ring}`}>
                  {suspect.initials}
                </span>
                <div className="min-w-0">
                  <SheetTitle className="truncate text-xl">{suspect.name}</SheetTitle>
                  <SheetDescription className="truncate">{suspect.occupation}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="mt-5 space-y-5 text-sm">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Suspicion meter</p>
                  <Badge tone={suspicionMeta[score.band].tone}><ShieldAlert className="h-3 w-3" /> {suspicionMeta[score.band].label}</Badge>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/30">
                  <motion.div
                    initial={false}
                    animate={{ width: `${score.score}%` }}
                    transition={{ type: "spring", stiffness: 110, damping: 22 }}
                    className={`h-full rounded-full ${suspicionMeta[score.band].bar}`}
                  />
                </div>
                <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">{score.score}/100</p>
              </div>

              <Field label="Relationship to victim" value={suspect.relationship} />
              <Field label="Motive" value={suspect.motive} />
              <Field label="Alibi" value={suspect.alibi} />

              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Statement</p>
                <blockquote className="mt-2 border-l-2 border-accent/60 bg-surface-elevated/40 p-3 text-sm italic text-foreground/90">
                  {suspect.statement}
                </blockquote>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Timeline</p>
                <ol className="mt-3 space-y-3">
                  {suspect.timeline.map((t, i) => (
                    <motion.li
                      key={t.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i }}
                      className="relative flex gap-3"
                    >
                      <span className="w-12 shrink-0 font-mono text-xs text-accent">{t.time}</span>
                      <div className="min-w-0 flex-1 border-l border-border/60 pl-3">
                        <p className="text-sm font-semibold">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.detail}</p>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </div>

              {relatedEvidence.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Linked evidence</p>
                  <ul className="mt-2 space-y-1.5">
                    {relatedEvidence.map((e) => (
                      <li key={e.id} className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs ${examined.has(e.id) ? "border-accent/30 bg-accent/5 text-foreground" : "border-border/60 bg-background/40 text-muted-foreground"}`}>
                        <Fingerprint className="h-3 w-3 text-accent" /> {e.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button variant="primary" className="w-full" onClick={() => onAccuse(suspect)}>
                <Gavel className="h-4 w-4" /> Accuse {suspect.name}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
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
