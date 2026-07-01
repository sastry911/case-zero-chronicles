import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useStory, getReturningCastForCase } from "@/lib/story-engine";
import { getRecurringClue } from "@/data/story";
import { motion, AnimatePresence } from "@/components/case-zero/motion";
import {
  ArrowLeft,
  BookOpen,
  Cpu,
  Eye,
  FileSearch,
  FileText,
  FileWarning,
  Fingerprint,
  Flame,
  Gavel,
  Lightbulb,
  Lock,
  MapPin,
  MessageSquare,
  NotebookPen,
  Pin,
  PinOff,
  Plus,
  ScanSearch,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Button } from "@/components/case-zero/button";
import { Badge, DifficultyStars } from "@/components/case-zero/badge";
import { AnimatedNumber } from "@/components/case-zero/animated-number";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { cn } from "@/lib/utils";
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

const importanceTone: Record<Importance, "muted" | "accent" | "warning" | "danger"> = {
  low: "muted",
  medium: "accent",
  high: "warning",
  critical: "danger",
};

const suspicionMeta: Record<SuspicionLevel, { label: string; bar: string; tone: "muted" | "warning" | "danger" | "primary" }> = {
  low: { label: "Low", bar: "bg-emerald-500/70", tone: "muted" },
  medium: { label: "Medium", bar: "bg-amber-400/80", tone: "warning" },
  high: { label: "High", bar: "bg-red-500/80", tone: "danger" },
  prime: { label: "Prime", bar: "bg-primary", tone: "primary" },
};

type DockTab = "evidence" | "suspects" | "timeline" | "notebook" | "forensics" | "accuse";

const DOCK_TABS: { id: DockTab; label: string; icon: typeof Eye }[] = [
  { id: "evidence", label: "Evidence", icon: Fingerprint },
  { id: "suspects", label: "Suspects", icon: Users },
  { id: "timeline", label: "Timeline", icon: ScanSearch },
  { id: "notebook", label: "Notebook", icon: NotebookPen },
  { id: "forensics", label: "Forensics", icon: FileText },
  { id: "accuse", label: "Accuse", icon: Gavel },
];

const SUSPICION_REVEAL_THRESHOLD = 3;

function InvestigationDesk() {
  const c = Route.useLoaderData() as Case;
  const inv = useInvestigation(c);
  const [openTab, setOpenTab] = useState<DockTab | null>(null);
  const [activeEvidence, setActiveEvidence] = useState<Evidence | null>(null);
  const [activeSuspect, setActiveSuspect] = useState<Suspect | null>(null);
  const [hoverHotspot, setHoverHotspot] = useState<string | null>(null);
  const [briefOpen, setBriefOpen] = useState(false);

  const examinedEvidence = useMemo(
    () => c.evidence.filter((e) => inv.examined.has(e.id)),
    [c.evidence, inv.examined],
  );
  const suspicionRevealed = inv.examined.size >= SUSPICION_REVEAL_THRESHOLD;

  return (
    <PageLayout withFooter={false}>
      {/* Top command strip */}
      <div className="sticky top-16 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-4 px-4 py-3 md:px-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <span className="text-border">•</span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">{c.number}</p>
            <h1 className="truncate text-base font-semibold leading-tight md:text-lg">{c.title}</h1>
          </div>
          <div className="hidden items-center gap-4 text-xs text-muted-foreground md:flex">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-accent" />{c.location.split("—")[0].trim()}</span>
            <DifficultyStars value={c.difficulty} />
          </div>
          <button
            onClick={() => setBriefOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
          >
            <BookOpen className="h-3.5 w-3.5" /> Case Brief
          </button>
          <ProgressPill progress={inv.progress} xp={inv.xp} intuition={inv.intuition} />
        </div>
      </div>

      {/* HERO: Crime Scene */}
      <div className="mx-auto max-w-[1600px] px-4 pb-40 pt-6 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <CrimeScene
            image={crimeSceneImg}
            hotspots={c.hotspots}
            investigated={inv.investigated}
            hoverId={hoverHotspot}
            onHover={setHoverHotspot}
            onSelect={(hs, x, y) => {
              inv.investigateHotspot(hs.id, x, y);
              const ev = c.evidence.find((e) => e.id === hs.evidenceId);
              if (ev) setActiveEvidence(ev);
            }}
          />
          <SceneSideRail
            case={c}
            progress={inv.progress}
            intuition={inv.intuition}
            xp={inv.xp}
            examinedCount={inv.examined.size}
            totalEvidence={c.evidence.length}
            objectives={inv.objectives}
            onJumpTab={setOpenTab}
          />
        </div>
      </div>

      {/* Bottom Dock */}
      <BottomDock
        openTab={openTab}
        onOpen={setOpenTab}
        counts={{
          evidence: inv.examined.size,
          suspects: c.suspects.length,
          timeline: inv.timeline.length,
          notebook: inv.notebook.length,
          forensics: examinedEvidence.length,
        }}
      />

      {/* Focus-mode sheets */}
      <FocusSheet open={openTab === "evidence"} title="Evidence Locker" subtitle={`${inv.examined.size} of ${c.evidence.length} collected`} onClose={() => setOpenTab(null)}>
        <EvidencePanel
          all={c.evidence}
          examinedIds={inv.examined}
          importantIds={inv.important}
          onOpen={(e) => setActiveEvidence(e)}
        />
      </FocusSheet>

      <FocusSheet open={openTab === "suspects"} title="Suspects" subtitle={suspicionRevealed ? "Suspicion updates as evidence is examined" : `Examine ${SUSPICION_REVEAL_THRESHOLD - inv.examined.size} more clue(s) to reveal suspicion`} onClose={() => setOpenTab(null)}>
        <SuspectsPanel
          suspects={c.suspects}
          scores={inv.suspicionScores}
          interviewed={inv.interviewed}
          revealed={suspicionRevealed}
          onSelect={(s) => setActiveSuspect(s)}
        />
      </FocusSheet>

      <FocusSheet open={openTab === "timeline"} title="Timeline" subtitle="Events unlock as you gather evidence" onClose={() => setOpenTab(null)}>
        <TimelinePanel timeline={inv.timeline} baseIds={new Set(c.baseTimeline.map((t) => t.id))} />
      </FocusSheet>

      <FocusSheet open={openTab === "notebook"} title="Detective Notebook" subtitle="Pinned clues and personal notes" onClose={() => setOpenTab(null)}>
        <NotebookPanel
          notes={inv.notebook}
          evidence={c.evidence}
          onTogglePin={inv.togglePin}
          onRemove={inv.removeNote}
          onUpdate={inv.updateNote}
          onAdd={inv.addCustomNote}
        />
      </FocusSheet>

      <FocusSheet open={openTab === "forensics"} title="Forensics Lab" subtitle="Chain of custody & lab notes" onClose={() => setOpenTab(null)}>
        <ForensicsPanel examined={examinedEvidence} readIds={inv.forensicsRead} onRead={inv.readForensic} />
      </FocusSheet>

      <FocusSheet open={openTab === "accuse"} title="Case Reconstruction" subtitle="Name the killer, weapon and motive. Every pick is scored." onClose={() => setOpenTab(null)}>
        <AccusePanel
          case={c}
          scores={inv.suspicionScores}
          revealed={suspicionRevealed}
          progress={inv.progress}
          verdict={inv.verdict}
          submitVerdict={inv.submitVerdict}
          resetInvestigation={inv.resetInvestigation}
          examined={inv.examined}
          important={inv.important}
        />
      </FocusSheet>

      {/* Evidence detail modal */}
      <EvidenceModal
        evidence={activeEvidence}
        onClose={() => setActiveEvidence(null)}
        important={activeEvidence ? inv.important.has(activeEvidence.id) : false}
        pinned={
          activeEvidence
            ? inv.notebook.some((n) => n.evidenceId === activeEvidence.id && n.pinned)
            : false
        }
        onToggleImportant={inv.toggleImportant}
        onTogglePin={(evId) => {
          const note = inv.notebook.find((n) => n.evidenceId === evId);
          if (note) inv.togglePin(note.id);
        }}
        onCompare={inv.toggleCompare}
        inCompare={activeEvidence ? inv.compareSet.includes(activeEvidence.id) : false}
        suspects={c.suspects}
      />

      {/* Suspect drawer */}
      <SuspectDrawer
        suspect={activeSuspect}
        onClose={() => setActiveSuspect(null)}
        score={activeSuspect ? inv.suspicionScores[activeSuspect.id]?.score ?? 0 : 0}
        band={activeSuspect ? inv.suspicionScores[activeSuspect.id]?.band ?? "low" : "low"}
        revealed={suspicionRevealed}
        interviewed={activeSuspect ? inv.interviewed.has(activeSuspect.id) : false}
        onInterview={inv.interviewSuspect}
      />

      {/* Case brief modal */}
      <Dialog open={briefOpen} onOpenChange={(o) => !o && setBriefOpen(false)}>
        <DialogContent className="max-w-2xl border-border/70 bg-surface">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-accent" /> Case Brief
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-border/60 bg-background/40 p-4">
              <BriefRow label="Victim" value={c.victim.name} />
              <BriefRow label="Occupation" value={c.victim.occupation} />
              <BriefRow label="Cause of death" value={c.victim.causeOfDeath} />
              <BriefRow label="Time of death" value={c.victim.timeOfDeath} />
              <BriefRow label="Location" value={c.location} />
              <BriefRow label="Date" value={c.date} />
            </div>
            <p className="leading-relaxed text-muted-foreground">{c.briefing}</p>
            <div className="rounded-lg border border-border/60 bg-background/40 p-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-accent">Objectives</p>
              <ObjectivesList objectives={inv.objectives} compact />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

/* ---------- Top strip ---------- */

function ProgressPill({ progress, xp, intuition }: { progress: number; xp: number; intuition: number }) {
  return (
    <div className="ml-auto flex items-center gap-3 rounded-full border border-border/70 bg-surface px-3 py-1.5 text-xs">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-mono font-semibold text-foreground"><AnimatedNumber value={progress} />%</span>
      </div>
      <span className="h-3 w-px bg-border" />
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-accent" />
        <span className="font-mono font-semibold text-accent"><AnimatedNumber value={xp} /></span>
      </div>
      <span className="h-3 w-px bg-border" />
      <div className="flex items-center gap-1.5" title="Detective Intuition">
        <Flame className={cn("h-3 w-3", intuition >= 100 ? "text-primary" : "text-muted-foreground")} />
        <span className="font-mono font-semibold">{intuition}</span>
      </div>
    </div>
  );
}

function BriefRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

/* ---------- Crime scene hero ---------- */

function CrimeScene({
  image,
  hotspots,
  investigated,
  hoverId,
  onHover,
  onSelect,
}: {
  image: string;
  hotspots: Case["hotspots"];
  investigated: Set<string>;
  hoverId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (hs: Case["hotspots"][number], x: number, y: number) => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-elevated">
      <div className="relative aspect-[16/10]">
        <img
          src={image}
          alt="Crime scene: rear car of the 23:47 express"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/25 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(11,15,20,0.55))]" />

        {/* Hotspots */}
        {hotspots.map((h) => {
          const done = investigated.has(h.id);
          const active = hoverId === h.id;
          return (
            <button
              key={h.id}
              onMouseEnter={() => onHover(h.id)}
              onMouseLeave={() => onHover(null)}
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                onSelect(h, rect.left + rect.width / 2, rect.top + rect.height / 2);
              }}
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              aria-label={h.label}
            >
              <span className="relative flex h-8 w-8 items-center justify-center">
                {!done && (
                  <>
                    <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" />
                    <span className="absolute inset-1 rounded-full bg-accent/25 blur-md" />
                  </>
                )}
                <span
                  className={cn(
                    "relative grid h-5 w-5 place-items-center rounded-full border-2 transition-all",
                    done
                      ? "border-emerald-400/70 bg-emerald-400/30"
                      : "border-accent bg-background/70 group-hover:scale-110",
                    active && "scale-125 border-accent shadow-glow",
                  )}
                >
                  {done ? <Eye className="h-2.5 w-2.5 text-emerald-200" /> : <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                </span>
              </span>
              {active && (
                <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/70 bg-background/95 px-2 py-1 text-[11px] font-medium text-foreground shadow-elevated backdrop-blur">
                  {h.label}
                </span>
              )}
            </button>
          );
        })}

        {/* Corner label */}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Live scene
        </div>
        <div className="absolute bottom-4 right-4 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-accent backdrop-blur">
          {investigated.size}/{hotspots.length} objects examined
        </div>
      </div>
    </div>
  );
}

/* ---------- Side rail (kept small; not a full panel) ---------- */

function SceneSideRail({
  case: c,
  progress,
  intuition,
  xp,
  examinedCount,
  totalEvidence,
  objectives,
  onJumpTab,
}: {
  case: Case;
  progress: number;
  intuition: number;
  xp: number;
  examinedCount: number;
  totalEvidence: number;
  objectives: ReturnType<typeof useInvestigation>["objectives"];
  onJumpTab: (t: DockTab) => void;
}) {
  return (
    <aside className="flex flex-col gap-4">
      {/* Objective */}
      <div className="rounded-2xl border border-border/70 bg-surface p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Objective</p>
        <h2 className="mt-1 text-base font-semibold leading-tight">Identify the killer aboard Car 7.</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Examine the scene, then use the dock below to review evidence, suspects, and your notebook.
        </p>
      </div>

      {/* Progress */}
      <div className="rounded-2xl border border-border/70 bg-surface p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Investigation</p>
          <span className="font-mono text-xs text-foreground"><AnimatedNumber value={progress} />%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/60">
          <div className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <StatMini label="Evidence" value={`${examinedCount}/${totalEvidence}`} />
          <StatMini label="XP" value={<AnimatedNumber value={xp} />} accent />
        </div>
      </div>

      {/* Objectives */}
      <div className="rounded-2xl border border-border/70 bg-surface p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Objectives</p>
          <span className="font-mono text-[10px] text-accent">
            {objectives.filter(o => o.complete).length}/{objectives.length}
          </span>
        </div>
        <div className="mt-3">
          <ObjectivesList objectives={objectives} />
        </div>
      </div>

      {/* Intuition */}
      <div className="rounded-2xl border border-border/70 bg-surface p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={cn("h-4 w-4", intuition >= 100 ? "text-primary" : "text-accent")} />
            <p className="text-sm font-semibold">Detective Intuition</p>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{intuition}/100</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/60">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              intuition >= 100 ? "bg-primary shadow-glow" : "bg-gradient-to-r from-accent/70 to-primary/70",
            )}
            style={{ width: `${intuition}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {intuition >= 100 ? "Hint unlocked — you may accuse with confidence." : "Fills as you uncover meaningful clues."}
        </p>
      </div>

      <button
        onClick={() => onJumpTab("accuse")}
        className="group flex items-center justify-between rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/20 to-primary/5 p-4 text-left transition-all hover:border-primary/70 hover:shadow-glow"
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Ready?</p>
          <p className="mt-0.5 text-sm font-semibold">Reconstruct the Case</p>
        </div>
        <Gavel className="h-5 w-5 text-primary transition-transform group-hover:rotate-12" />
      </button>
    </aside>
  );
}

function ObjectivesList({ objectives, compact }: { objectives: ReturnType<typeof useInvestigation>["objectives"]; compact?: boolean }) {
  return (
    <ul className={cn("space-y-2", compact && "space-y-1.5")}>
      {objectives.map((o) => (
        <li key={o.objective.id} className="flex items-center gap-2.5">
          <span className={cn(
            "grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors",
            o.complete ? "border-emerald-400/70 bg-emerald-400/20 text-emerald-200" : "border-border/70 bg-background/40 text-muted-foreground",
          )}>
            {o.complete ? <Eye className="h-2.5 w-2.5" /> : <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />}
          </span>
          <span className={cn("min-w-0 flex-1 truncate text-xs", o.complete ? "text-foreground/70 line-through decoration-emerald-400/40" : "text-foreground/90")}>
            {o.objective.label}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">{o.current}/{o.total}</span>
        </li>
      ))}
    </ul>
  );
}

function StatMini({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-2">
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-sm font-semibold", accent && "text-accent")}>{value}</p>
    </div>
  );
}

/* ---------- Bottom dock ---------- */

function BottomDock({
  openTab,
  onOpen,
  counts,
}: {
  openTab: DockTab | null;
  onOpen: (t: DockTab | null) => void;
  counts: Record<Exclude<DockTab, "accuse">, number>;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-border/70 bg-background/85 p-1.5 shadow-elevated backdrop-blur-xl">
        {DOCK_TABS.map((t) => {
          const active = openTab === t.id;
          const Icon = t.icon;
          const count = t.id === "accuse" ? undefined : counts[t.id];
          return (
            <button
              key={t.id}
              onClick={() => onOpen(active ? null : t.id)}
              className={cn(
                "group relative inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-all",
                active
                  ? t.id === "accuse"
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-surface text-foreground ring-1 ring-accent/40"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground",
                t.id === "accuse" && !active && "text-primary",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
              {count !== undefined && count > 0 && (
                <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-mono text-accent">{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Focus sheet (dims scene) ---------- */

function FocusSheet({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[78vh] rounded-t-3xl border-t border-border/70 bg-background/95 p-0 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-full max-w-[1400px] flex-col">
          <SheetHeader className="flex-row items-start justify-between border-b border-border/60 px-6 py-4 text-left">
            <div>
              <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
              {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-md border border-border/60 bg-surface p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ---------- Evidence panel ---------- */

function EvidencePanel({
  all,
  examinedIds,
  importantIds,
  onOpen,
}: {
  all: Evidence[];
  examinedIds: Set<string>;
  importantIds: Set<string>;
  onOpen: (e: Evidence) => void;
}) {
  const examined = all.filter((e) => examinedIds.has(e.id));
  const remaining = all.length - examined.length;

  if (examined.length === 0) {
    return (
      <EmptyState
        icon={Fingerprint}
        title="No evidence collected yet"
        body="Interact with objects on the crime scene above. Each clue you uncover will appear here as a collectible card."
      />
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {examined.map((e) => (
          <EvidenceCard key={e.id} evidence={e} important={importantIds.has(e.id)} onClick={() => onOpen(e)} />
        ))}
      </div>
      {remaining > 0 && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Lock className="mr-1 inline h-3 w-3" /> {remaining} more clue{remaining === 1 ? "" : "s"} hidden on the scene.
        </p>
      )}
    </div>
  );
}

function EvidenceCard({ evidence, important, onClick }: { evidence: Evidence; important: boolean; onClick: () => void }) {
  const Icon = evidenceIcon[evidence.tag];
  return (
    <button
      onClick={onClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-surface p-4 text-left transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow"
    >
      {important && (
        <span className="absolute right-3 top-3 text-primary">
          <Pin className="h-3.5 w-3.5 fill-primary" />
        </span>
      )}
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{evidence.tag}</p>
      <p className="mt-0.5 text-sm font-semibold leading-tight text-foreground">{evidence.label}</p>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{evidence.summary}</p>
      <div className="mt-3 flex items-center justify-between">
        <Badge tone={importanceTone[evidence.importance]}>{evidence.importance}</Badge>
        <span className="text-[10px] font-mono text-muted-foreground">+{evidence.xp} XP</span>
      </div>
    </button>
  );
}

/* ---------- Evidence modal ---------- */

function EvidenceModal({
  evidence,
  onClose,
  important,
  pinned,
  onToggleImportant,
  onTogglePin,
  onCompare,
  inCompare,
  suspects,
}: {
  evidence: Evidence | null;
  onClose: () => void;
  important: boolean;
  pinned: boolean;
  onToggleImportant: (id: string) => void;
  onTogglePin: (id: string) => void;
  onCompare: (id: string) => void;
  inCompare: boolean;
  suspects: Suspect[];
}) {
  if (!evidence) return null;
  const Icon = evidenceIcon[evidence.tag];
  const related = suspects.filter((s) => evidence.relatedSuspectIds.includes(s.id));
  return (
    <Dialog open={!!evidence} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl border-border/70 bg-surface p-0">
        <div className="border-b border-border/60 bg-gradient-to-br from-surface to-background/60 p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogHeader className="text-left">
                <DialogTitle className="text-lg font-semibold">{evidence.label}</DialogTitle>
              </DialogHeader>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={importanceTone[evidence.importance]}>{evidence.importance}</Badge>
                <Badge tone="muted">{evidence.tag}</Badge>
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent">+{evidence.xp} XP</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4 p-6 text-sm">
          <p className="leading-relaxed text-foreground/90">{evidence.detail}</p>

          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-background/40 p-3 text-xs">
            <BriefRow label="Location" value={evidence.location} />
            <BriefRow label="Collected" value={`${evidence.collectedAt} · ${evidence.collectedBy}`} />
          </div>

          {related.length > 0 && (
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Related suspects</p>
              <div className="flex flex-wrap gap-2">
                {related.map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-xs">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/15 font-mono text-[9px] text-accent">{s.initials}</span>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => onToggleImportant(evidence.id)}>
              {important ? <Pin className="h-4 w-4 fill-primary text-primary" /> : <Pin className="h-4 w-4" />} Mark important
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onTogglePin(evidence.id)}>
              {pinned ? <PinOff className="h-4 w-4" /> : <NotebookPen className="h-4 w-4" />} {pinned ? "Unpin from notebook" : "Pin to notebook"}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onCompare(evidence.id)}>
              <ScanSearch className="h-4 w-4" /> {inCompare ? "Remove from compare" : "Add to compare"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Suspects panel ---------- */

function SuspectsPanel({
  suspects,
  scores,
  interviewed,
  revealed,
  onSelect,
}: {
  suspects: Suspect[];
  scores: ReturnType<typeof useInvestigation>["suspicionScores"];
  interviewed: Set<string>;
  revealed: boolean;
  onSelect: (s: Suspect) => void;
}) {
  const ordered = revealed
    ? [...suspects].sort((a, b) => (scores[b.id]?.score ?? 0) - (scores[a.id]?.score ?? 0))
    : suspects;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {ordered.map((s) => {
        const sc = scores[s.id];
        const meta = sc ? suspicionMeta[sc.band] : suspicionMeta.low;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className="group flex items-start gap-4 rounded-xl border border-border/70 bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/40"
          >
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-border/60 bg-background/60 font-mono text-sm text-accent">
              {s.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">{s.name}</p>
                {interviewed.has(s.id) && <Badge tone="success">Interviewed</Badge>}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.occupation}</p>
              <div className="mt-3">
                {revealed ? (
                  <>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="uppercase tracking-widest text-muted-foreground">Suspicion</span>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-background/60">
                      <div className={cn("h-full rounded-full transition-all duration-700", meta.bar)} style={{ width: `${sc?.score ?? 0}%` }} />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-md border border-dashed border-border/60 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <Lock className="h-3 w-3" /> Suspicion hidden
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SuspectDrawer({
  suspect,
  onClose,
  score,
  band,
  revealed,
  interviewed,
  onInterview,
}: {
  suspect: Suspect | null;
  onClose: () => void;
  score: number;
  band: SuspicionLevel;
  revealed: boolean;
  interviewed: boolean;
  onInterview: (id: string) => void;
}) {
  if (!suspect) return null;
  const meta = suspicionMeta[band];
  return (
    <Sheet open={!!suspect} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto border-l border-border/70 bg-background/95 backdrop-blur-xl sm:max-w-md">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-border/60 bg-surface font-mono text-lg text-accent">
              {suspect.initials}
            </div>
            <div>
              <SheetTitle className="text-lg">{suspect.name}</SheetTitle>
              <p className="text-xs text-muted-foreground">{suspect.occupation}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-border/60 bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Suspicion meter</p>
              {revealed ? <Badge tone={meta.tone}>{meta.label}</Badge> : <Badge tone="muted"><Lock className="h-3 w-3" /> Locked</Badge>}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-background/60">
              <div className={cn("h-full rounded-full transition-all duration-700", revealed ? meta.bar : "bg-muted/40")} style={{ width: `${revealed ? score : 8}%` }} />
            </div>
          </div>

          <DrawerField label="Relationship" value={suspect.relationship} />
          <DrawerField label="Alibi" value={suspect.alibi} />
          <DrawerField label="Motive" value={suspect.motive} />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Statement</p>
            <p className="mt-1 rounded-lg border border-border/60 bg-surface p-3 text-sm italic text-foreground/90">{suspect.statement}</p>
          </div>

          {suspect.secret && (
            <div className={cn(
              "rounded-lg border p-3 transition-colors",
              interviewed ? "border-primary/40 bg-primary/10" : "border-border/60 bg-background/40",
            )}>
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
                {interviewed ? <><Eye className="h-3 w-3" /> Secret uncovered</> : <><Lock className="h-3 w-3" /> Interview to reveal</>}
              </p>
              <p className={cn("mt-1.5 text-sm leading-relaxed", interviewed ? "text-foreground/95" : "select-none text-muted-foreground/40 blur-sm")}>
                {suspect.secret}
              </p>
            </div>
          )}

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Timeline</p>
            <ol className="mt-2 space-y-3 border-l border-border/60 pl-4">
              {suspect.timeline.map((t) => (
                <li key={t.id}>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-accent">{t.time}</span>
                    <span className="text-sm font-medium">{t.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.detail}</p>
                </li>
              ))}
            </ol>
          </div>

          <Button
            variant={interviewed ? "secondary" : "primary"}
            onClick={() => onInterview(suspect.id)}
            disabled={interviewed}
            className="w-full"
          >
            {interviewed ? "Interview complete" : "Conduct interview (+10 XP)"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DrawerField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-foreground/90">{value}</p>
    </div>
  );
}

/* ---------- Timeline ---------- */

function TimelinePanel({ timeline, baseIds }: { timeline: ReturnType<typeof useInvestigation>["timeline"]; baseIds: Set<string> }) {
  return (
    <ol className="relative mx-auto max-w-2xl space-y-6 border-l-2 border-border/60 pl-6">
      <AnimatePresence>
        {timeline.map((t) => {
          const unlocked = !baseIds.has(t.id);
          return (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <span
                className={cn(
                  "absolute -left-[33px] top-1 grid h-5 w-5 place-items-center rounded-full border-2",
                  unlocked ? "border-accent bg-accent/25 shadow-glow" : "border-border bg-background",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", unlocked ? "bg-accent" : "bg-muted-foreground/50")} />
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-accent">{t.time}</span>
                <p className="text-sm font-semibold">{t.label}</p>
                {unlocked && <Badge tone="accent">New</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{t.detail}</p>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ol>
  );
}

/* ---------- Notebook ---------- */

function NotebookPanel({
  notes,
  evidence,
  onTogglePin,
  onRemove,
  onUpdate,
  onAdd,
}: {
  notes: ReturnType<typeof useInvestigation>["notebook"];
  evidence: Evidence[];
  onTogglePin: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, n: string) => void;
  onAdd: (n: string) => void;
}) {
  const [draft, setDraft] = useState("");

  if (notes.length === 0 && !draft) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={NotebookPen}
          title="Notebook is empty"
          body="Examine evidence to auto-pin key notes, or jot down your own theories below."
        />
        <NoteComposer draft={draft} setDraft={setDraft} onAdd={onAdd} />
      </div>
    );
  }

  const pinned = notes.filter((n) => n.pinned);
  const others = notes.filter((n) => !n.pinned);

  return (
    <div className="space-y-6">
      <NoteComposer draft={draft} setDraft={setDraft} onAdd={onAdd} />
      {pinned.length > 0 && (
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-accent">Pinned</p>
          <div className="grid gap-3 md:grid-cols-2">
            {pinned.map((n) => (
              <NoteCard key={n.id} note={n} evidence={evidence} onTogglePin={onTogglePin} onRemove={onRemove} onUpdate={onUpdate} />
            ))}
          </div>
        </div>
      )}
      {others.length > 0 && (
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Notes</p>
          <div className="grid gap-3 md:grid-cols-2">
            {others.map((n) => (
              <NoteCard key={n.id} note={n} evidence={evidence} onTogglePin={onTogglePin} onRemove={onRemove} onUpdate={onUpdate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NoteComposer({ draft, setDraft, onAdd }: { draft: string; setDraft: (v: string) => void; onAdd: (n: string) => void }) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">New theory</p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="What if the conductor tripped the CCTV himself…"
        className="mt-2 h-20 w-full resize-none rounded-md border border-border/60 bg-background/50 p-3 text-sm outline-none focus:border-accent/50"
      />
      <div className="mt-2 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            if (!draft.trim()) return;
            onAdd(draft.trim());
            setDraft("");
          }}
        >
          <Plus className="h-4 w-4" /> Add note
        </Button>
      </div>
    </div>
  );
}

function NoteCard({
  note,
  evidence,
  onTogglePin,
  onRemove,
  onUpdate,
}: {
  note: ReturnType<typeof useInvestigation>["notebook"][number];
  evidence: Evidence[];
  onTogglePin: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, n: string) => void;
}) {
  const ev = evidence.find((e) => e.id === note.evidenceId);
  return (
    <div className={cn("rounded-xl border p-4 transition-colors", note.pinned ? "border-accent/40 bg-surface" : "border-border/60 bg-surface/60")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {note.custom ? "Personal note" : ev?.label ?? "Note"} · {note.at}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onTogglePin(note.id)} className="rounded p-1 text-muted-foreground hover:text-accent" title={note.pinned ? "Unpin" : "Pin"}>
            {note.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => onRemove(note.id)} className="rounded p-1 text-muted-foreground hover:text-red-400" title="Remove">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <textarea
        value={note.note}
        onChange={(e) => onUpdate(note.id, e.target.value)}
        className="mt-2 w-full resize-none rounded-md bg-transparent text-sm leading-relaxed text-foreground/90 outline-none"
        rows={Math.max(2, Math.ceil(note.note.length / 55))}
      />
    </div>
  );
}

/* ---------- Forensics ---------- */

function ForensicsPanel({
  examined,
  readIds,
  onRead,
}: {
  examined: Evidence[];
  readIds: Set<string>;
  onRead: (id: string) => void;
}) {
  if (examined.length === 0) {
    return <EmptyState icon={FileText} title="Lab is quiet" body="Collect evidence to view chain-of-custody and forensic notes." />;
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {examined.map((e) => {
        const isRead = readIds.has(e.id);
        return (
          <div key={e.id} className={cn(
            "rounded-xl border bg-surface p-5 transition-colors",
            isRead ? "border-accent/40" : "border-border/70",
          )}>
            <div className="flex items-center gap-2">
              <Badge tone={importanceTone[e.importance]}>{e.importance}</Badge>
              <p className="text-sm font-semibold">{e.label}</p>
              {e.redHerring && isRead && <Badge tone="muted">Red herring?</Badge>}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{e.summary}</p>

            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Chain of custody</p>
              <ol className="mt-2 space-y-1.5 text-xs">
                {e.chainOfCustody.map((step, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-accent/15 font-mono text-[9px] text-accent">{i + 1}</span>
                    <span className="text-foreground/90">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {e.forensicReport && (
              <div className="mt-4 rounded-lg border border-border/60 bg-background/50 p-3">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                    <Sparkles className="h-3 w-3" /> Lab report
                  </p>
                  {!isRead && (
                    <button
                      onClick={() => onRead(e.id)}
                      className="rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent transition-colors hover:bg-accent/20"
                    >
                      Analyse (+8 XP)
                    </button>
                  )}
                </div>
                <p className={cn(
                  "mt-2 text-xs leading-relaxed transition-all",
                  isRead ? "text-foreground/90" : "select-none text-muted-foreground/40 blur-sm",
                )}>
                  {e.forensicReport}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Accuse / Reconstruction ---------- */

function AccusePanel({
  case: c,
  scores,
  revealed,
  progress,
  verdict,
  submitVerdict,
  resetInvestigation,
  examined,
  important,
}: {
  case: Case;
  scores: ReturnType<typeof useInvestigation>["suspicionScores"];
  revealed: boolean;
  progress: number;
  verdict: ReturnType<typeof useInvestigation>["verdict"];
  submitVerdict: ReturnType<typeof useInvestigation>["submitVerdict"];
  resetInvestigation: ReturnType<typeof useInvestigation>["resetInvestigation"];
  examined: Set<string>;
  important: Set<string>;
}) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [killer, setKiller] = useState<string | null>(null);
  const [weapon, setWeapon] = useState<string | null>(null);
  const [motive, setMotive] = useState<string | null>(null);
  const [primary, setPrimary] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (verdict) {
    return <ReconstructionView case={c} verdict={verdict} examined={examined} important={important} onReset={resetInvestigation} />;
  }

  const stepLabels = ["Killer", "Weapon", "Motive", "Evidence"];
  const canSubmit = !!(killer && weapon && motive && primary);
  const examinedEvidence = c.evidence.filter((e) => examined.has(e.id));
  const killerName = c.suspects.find(s => s.id === killer)?.name ?? "";
  const weaponLabel = c.weaponOptions.find(w => w.id === weapon)?.label ?? "";
  const motiveLabel = c.motiveOptions.find(m => m.id === motive)?.label ?? "";
  const primaryLabel = c.evidence.find(e => e.id === primary)?.label ?? "";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-4 text-sm">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <p className="font-semibold">Investigation is {progress}% complete.</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {progress < 60
            ? "You may not have enough to convict. Gather more clues before you accuse."
            : "Name the killer, weapon, motive and the single piece of evidence that proves it."}
        </p>
      </div>

      {/* Stepper */}
      <div className="mt-6 flex items-center gap-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div className={cn(
              "grid h-7 w-7 place-items-center rounded-full border font-mono text-xs transition-colors",
              step === i ? "border-primary bg-primary/20 text-primary" :
              i < step ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300" :
              "border-border/60 bg-surface text-muted-foreground",
            )}>{i + 1}</div>
            <p className={cn("text-xs font-semibold", step === i ? "text-foreground" : "text-muted-foreground")}>{label}</p>
            {i < stepLabels.length - 1 && <div className="h-px flex-1 bg-border/60" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="mt-6">
        {step === 0 && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {c.suspects.map((s) => {
              const sc = scores[s.id];
              const meta = sc ? suspicionMeta[sc.band] : suspicionMeta.low;
              const active = killer === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setKiller(s.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    active ? "border-primary bg-primary/10 shadow-glow" : "border-border/70 bg-surface hover:border-accent/40",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl border border-border/60 bg-background/60 font-mono text-sm text-accent">
                      {s.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.occupation}</p>
                    </div>
                  </div>
                  {revealed && (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/60">
                      <div className={cn("h-full", meta.bar)} style={{ width: `${sc?.score ?? 0}%` }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <ChoiceGrid options={c.weaponOptions} value={weapon} onSelect={setWeapon} />
        )}

        {step === 2 && (
          <ChoiceGrid options={c.motiveOptions} value={motive} onSelect={setMotive} />
        )}

        {step === 3 && (
          examinedEvidence.length === 0 ? (
            <EmptyState icon={Fingerprint} title="No evidence collected" body="Return to the crime scene and gather at least one clue before you accuse." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {examinedEvidence.map((e) => {
                const active = primary === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => setPrimary(e.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-all",
                      active ? "border-primary bg-primary/10 shadow-glow" : "border-border/70 bg-surface hover:border-accent/40",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{e.label}</p>
                      <Badge tone={importanceTone[e.importance]}>{e.importance}</Badge>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{e.summary}</p>
                  </button>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Nav */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => (s === 0 ? 0 : ((s - 1) as 0 | 1 | 2 | 3)))} disabled={step === 0}>
          Back
        </Button>
        {step < 3 ? (
          <Button
            variant="primary"
            onClick={() => setStep((s) => ((s + 1) as 0 | 1 | 2 | 3))}
            disabled={(step === 0 && !killer) || (step === 1 && !weapon) || (step === 2 && !motive)}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="primary"
            disabled={!canSubmit}
            onClick={() => canSubmit && setConfirmOpen(true)}
          >
            <Gavel className="h-4 w-4" /> Submit accusation
          </Button>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="border-border/70 bg-surface">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-primary" /> Formal accusation
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              You are about to charge <span className="font-semibold text-foreground">{killerName}</span> with the murder of {c.victim.name} using the <span className="text-foreground">{weaponLabel}</span>. Motive: <span className="text-foreground">{motiveLabel}</span>. Primary evidence: <span className="text-foreground">{primaryLabel}</span>.
              <span className="mt-3 block text-xs text-muted-foreground">This decision closes the case. It cannot be revised.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review evidence</AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                if (canSubmit) submitVerdict(killer!, weapon!, motive!, primary!);
                setConfirmOpen(false);
              }}
            >
              File accusation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ChoiceGrid({ options, value, onSelect }: { options: { id: string; label: string; detail?: string }[]; value: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onSelect(o.id)}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              active ? "border-primary bg-primary/10 shadow-glow" : "border-border/70 bg-surface hover:border-accent/40",
            )}
          >
            <p className="text-sm font-semibold">{o.label}</p>
            {o.detail && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{o.detail}</p>}
          </button>
        );
      })}
    </div>
  );
}

function ReconstructionView({
  case: c,
  verdict,
  examined,
  important,
  onReset,
}: {
  case: Case;
  verdict: NonNullable<ReturnType<typeof useInvestigation>["verdict"]>;
  examined: Set<string>;
  important: Set<string>;
  onReset: () => void;
}) {
  const [beat, setBeat] = useState(0);
  const beats = c.solution.reconstruction;
  const solved = verdict.correctKiller;
  const truth = c.suspects.find((s) => s.id === c.solution.killerId);
  const missed = c.solution.keyEvidenceIds.filter((id) => !examined.has(id));
  const missedPins = c.solution.keyEvidenceIds.filter((id) => examined.has(id) && !important.has(id));

  // ================= Story Engine wiring =================
  // On first render of the verdict, archive the case into FILE 001 and
  // reveal this case's recurring clue. Idempotent — safe on remount.
  const { archiveCase, currentDay, file } = useStory();
  useEffect(() => {
    archiveCase({
      caseId: c.id,
      solved,
      verdictName: verdict.killerName,
      timeTakenMinutes: Math.max(1, Math.round((Date.now() - verdict.submittedAt) / 60000) + 15),
    });
  }, [archiveCase, c.id, solved, verdict.killerName, verdict.submittedAt]);

  const cast = getReturningCastForCase(c.id);
  const plannedClue =
    getRecurringClue(file.cases.find((p) => p.id === c.id)?.recurringClueId ?? "clue-thread") ??
    getRecurringClue("clue-thread")!;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Verdict banner */}
      <div className={cn(
        "rounded-2xl border p-6 text-center",
        solved ? "border-emerald-500/40 bg-emerald-500/10" : "border-primary/40 bg-primary/10",
      )}>
        <div className={cn(
          "mx-auto grid h-14 w-14 place-items-center rounded-full",
          solved ? "bg-emerald-500/20 text-emerald-300" : "bg-primary/20 text-primary",
        )}>
          <Gavel className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-xl font-semibold">
          {solved ? "Case closed." : "The wrong name."}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You accused <span className="font-semibold text-foreground">{verdict.killerName}</span> with the{" "}
          <span className="text-foreground">{verdict.weaponLabel}</span> — motive: <span className="text-foreground">{verdict.motiveLabel}</span>.
        </p>

        <div className="mt-5 grid grid-cols-4 gap-3">
          <ScorePill label="Killer" ok={verdict.correctKiller} points={verdict.correctKiller ? 40 : 0} max={40} />
          <ScorePill label="Weapon" ok={verdict.correctWeapon} points={verdict.correctWeapon ? 15 : 0} max={15} />
          <ScorePill label="Motive" ok={verdict.correctMotive} points={verdict.correctMotive ? 15 : 0} max={15} />
          <ScorePill label="Evidence" ok={verdict.evidenceScore >= 25} points={verdict.evidenceScore} max={40} />
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 font-mono text-sm text-accent">
            {verdict.totalScore} / {verdict.maxScore}
          </div>
          <div className="rounded-full border border-border/60 bg-surface px-4 py-1.5 font-mono text-sm">
            Grade <span className="text-accent">{verdict.grade}</span>
          </div>
        </div>
      </div>

      {/* Cinematic reconstruction */}
      <div className="mt-6 rounded-2xl border border-border/70 bg-surface p-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">What actually happened</p>
          <p className="font-mono text-[10px] text-muted-foreground">Beat {beat + 1} / {beats.length}</p>
        </div>

        <div key={beat} className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-2xl font-bold text-accent">{beats[beat].time}</span>
            <p className="text-base font-semibold">{beats[beat].label}</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{beats[beat].detail}</p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setBeat((b) => Math.max(0, b - 1))} disabled={beat === 0}>
            ← Rewind
          </Button>
          <div className="flex gap-1.5">
            {beats.map((_, i) => (
              <span key={i} className={cn("h-1.5 w-6 rounded-full transition-colors", i === beat ? "bg-accent" : i < beat ? "bg-accent/40" : "bg-border/60")} />
            ))}
          </div>
          <Button variant="ghost" onClick={() => setBeat((b) => Math.min(beats.length - 1, b + 1))} disabled={beat === beats.length - 1}>
            Next →
          </Button>
        </div>
      </div>

      {/* Truth + Missed */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">The killer</p>
          <p className="mt-1 text-sm font-semibold">{truth?.name}</p>
          <p className="text-xs text-muted-foreground">{truth?.occupation}</p>
          <p className="mt-3 text-xs leading-relaxed text-foreground/85">{truth?.motive}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Missed clues</p>
          {missed.length === 0 && missedPins.length === 0 ? (
            <p className="mt-2 text-xs text-emerald-300/80">You collected — and pinned — every critical clue.</p>
          ) : (
            <ul className="mt-2 space-y-1.5 text-xs">
              {missed.map((id) => {
                const e = c.evidence.find((x) => x.id === id);
                return <li key={id} className="flex items-start gap-2 text-primary/90"><span>×</span><span>Never found: <span className="text-foreground">{e?.label}</span></span></li>;
              })}
              {missedPins.map((id) => {
                const e = c.evidence.find((x) => x.id === id);
                return <li key={id} className="flex items-start gap-2 text-accent/90"><span>•</span><span>Never pinned: <span className="text-foreground">{e?.label}</span></span></li>;
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Recurring clue — dynamic per case, revealed on archive */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/15 via-surface to-background p-5 shadow-glow">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Something else was here</p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Day {currentDay - 1} of {file.totalDays} · {file.number}
          </p>
        </div>
        <div className="mt-4 flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 font-mono text-sm font-bold text-primary">
            {plannedClue.symbol}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{plannedClue.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{plannedClue.hint}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-accent">
              Filed to archive · Meaning unresolved
            </p>
          </div>
        </div>
      </div>

      {/* Returning cast — quietly noted, no explanation */}
      {cast.length > 0 && (
        <div className="mt-4 rounded-2xl border border-border/70 bg-surface/60 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Present at the scene tonight
          </p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {cast.map((ch) => (
              <li key={ch.id} className="flex items-start gap-2 text-xs">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                <span>
                  <span className="font-semibold text-foreground">{ch.name}</span>
                  <span className="text-muted-foreground"> · {ch.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-3">
        <Button variant="secondary" onClick={onReset}>Reopen investigation</Button>
        <a href="/archive" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:brightness-110">
          Open the archive →
        </a>
      </div>
    </div>
  );
}

function ScorePill({ label, ok, points, max }: { label: string; ok: boolean; points: number; max: number }) {
  return (
    <div className={cn(
      "rounded-lg border p-2 text-center",
      ok ? "border-emerald-500/40 bg-emerald-500/10" : "border-border/60 bg-surface",
    )}>
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-mono text-sm font-bold", ok ? "text-emerald-300" : "text-foreground/70")}>
        {points}<span className="text-[10px] text-muted-foreground">/{max}</span>
      </p>
    </div>
  );
}


/* ---------- Empty state ---------- */

function EmptyState({ icon: Icon, title, body }: { icon: typeof Eye; title: string; body: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-border/60 bg-surface text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
