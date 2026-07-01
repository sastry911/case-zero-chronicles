import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "@/components/case-zero/motion";
import {
  Cpu,
  FileSearch,
  FileText,
  FileWarning,
  Fingerprint,
  Hand,
  Link2,
  Link2Off,
  MessageSquare,
  NotebookPen,
  Pin,
  Plus,
  RotateCw,
  Scale,
  ScanSearch,
  Sparkles,
  Star,
  X,
  ZoomIn,
} from "lucide-react";
import type { Case, Evidence } from "@/data/case001";
import type { EvidenceState } from "@/lib/use-investigation";
import { pairKey } from "@/lib/use-investigation";
import { Badge } from "@/components/case-zero/badge";
import { Button } from "@/components/case-zero/button";
import { cn } from "@/lib/utils";

const evidenceIcon = {
  physical: FileSearch,
  witness: MessageSquare,
  digital: Cpu,
  document: FileWarning,
} as const;

const STATE_META: Record<
  EvidenceState,
  { label: string; ring: string; dot: string; tone: "muted" | "accent" | "warning" | "danger" | "success" | "primary" }
> = {
  found:    { label: "Found",    ring: "ring-border/60",       dot: "bg-muted-foreground/60",  tone: "muted" },
  examined: { label: "Examined", ring: "ring-accent/40",       dot: "bg-accent",               tone: "accent" },
  analyzed: { label: "Analyzed", ring: "ring-sky-400/50",      dot: "bg-sky-400",              tone: "warning" },
  linked:   { label: "Linked",   ring: "ring-primary/50",      dot: "bg-primary",              tone: "primary" },
  proven:   { label: "Proven",   ring: "ring-emerald-400/60",  dot: "bg-emerald-400",          tone: "success" },
};

interface Props {
  case: Case;
  examined: Set<string>;
  placements: Record<string, { x: number; y: number; rotation: number; flipped: boolean }>;
  important: Set<string>;
  compareSet: string[];
  notes: { id: string; evidenceId: string; note: string; at: string; pinned: boolean; custom: boolean }[];
  evidenceStates: Record<string, EvidenceState>;
  discoveredConnections: Case["connections"];
  discoveredKeys: Set<string>;
  onMove: (id: string, p: { x: number; y: number }) => void;
  onRotate: (id: string) => void;
  onFlip: (id: string) => void;
  onToggleImportant: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onClearCompare: () => void;
  onTryConnect: (a: string, b: string) => { connection: Case["connections"][number] | null; alreadyKnown: boolean };
  onAddNote: (evId: string, text: string) => void;
  onRemoveNote: (id: string) => void;
}

export function EvidenceTable(props: Props) {
  const {
    case: c, examined, placements, important, compareSet, notes,
    evidenceStates, discoveredConnections, discoveredKeys,
    onMove, onRotate, onFlip, onToggleImportant, onToggleCompare, onClearCompare,
    onTryConnect, onAddNote, onRemoveNote,
  } = props;

  const deskRef = useRef<HTMLDivElement>(null);
  const [inspect, setInspect] = useState<Evidence | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "hit" | "miss" | "again"; text: string } | null>(null);

  const items = useMemo(() => c.evidence.filter((e) => examined.has(e.id)), [c.evidence, examined]);

  // Auto-scatter for items without a stored placement.
  const layout = useMemo(() => {
    const seeds: Record<string, { x: number; y: number; rotation: number; flipped: boolean }> = {};
    const cols = 3;
    items.forEach((e, i) => {
      const stored = placements[e.id];
      if (stored) { seeds[e.id] = stored; return; }
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitterX = ((i * 37) % 11) - 5;
      const jitterY = ((i * 53) % 9) - 4;
      seeds[e.id] = {
        x: 18 + col * 27 + jitterX,
        y: 22 + row * 34 + jitterY,
        rotation: ((i * 41) % 14) - 7,
        flipped: false,
      };
    });
    return seeds;
  }, [items, placements]);

  const flash = (kind: "hit" | "miss" | "again", text: string) => {
    setFeedback({ kind, text });
    setTimeout(() => setFeedback(null), 2200);
  };

  const doCompare = () => {
    if (compareSet.length !== 2) return;
    const [a, b] = compareSet;
    const res = onTryConnect(a, b);
    if (res.connection && !res.alreadyKnown) flash("hit", `New thread: ${res.connection.label}`);
    else if (res.alreadyKnown) flash("again", "You've already linked these two.");
    else flash("miss", "No direct connection — try another pairing.");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-border/60 bg-surface text-accent">
          <Fingerprint className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold">The desk is empty</h3>
        <p className="text-sm text-muted-foreground">
          Sweep the crime scene above. Every object you recover lands here as a physical piece of evidence — pick it up, flip it, and connect the threads.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* --------- DESK --------- */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Evidence Table</p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Hand className="h-3.5 w-3.5" /> Drag to arrange
              <span className="text-border">•</span>
              <RotateCw className="h-3.5 w-3.5" /> Rotate
              <span className="text-border">•</span>
              <ZoomIn className="h-3.5 w-3.5" /> Inspect
            </div>
          </div>
          <div className="flex items-center gap-2">
            {compareSet.length > 0 && (
              <button
                onClick={onClearCompare}
                className="rounded-md border border-border/60 bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                Clear selection
              </button>
            )}
            <Button
              size="sm"
              variant={compareSet.length === 2 ? "primary" : "secondary"}
              disabled={compareSet.length !== 2}
              onClick={doCompare}
            >
              <Scale className="h-4 w-4" /> Compare ({compareSet.length}/2)
            </Button>
          </div>
        </div>

        <div
          ref={deskRef}
          className="relative isolate aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#3a2a1a]/70 shadow-elevated"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.10), transparent 55%)," +
              "radial-gradient(ellipse at 80% 90%, rgba(0,0,0,0.55), transparent 60%)," +
              "repeating-linear-gradient(105deg, #3b2a1c 0 3px, #4a3624 3px 6px, #3f2d1e 6px 11px)," +
              "linear-gradient(180deg, #4a3624, #2d1f14)",
          }}
        >
          {/* Wood vignette */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55))]" />
          {/* Desk lamp glow */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-amber-200/10 blur-3xl" />

          {/* Red-thread connection lines */}
          <ConnectionLines
            deskRef={deskRef}
            connections={discoveredConnections}
            layout={layout}
          />

          {/* Evidence cards */}
          {items.map((e) => (
            <DeskCard
              key={e.id}
              evidence={e}
              placement={layout[e.id]}
              state={evidenceStates[e.id] ?? "examined"}
              important={important.has(e.id)}
              selected={compareSet.includes(e.id)}
              deskRef={deskRef}
              onMove={(p) => onMove(e.id, p)}
              onRotate={() => onRotate(e.id)}
              onFlip={() => onFlip(e.id)}
              onInspect={() => setInspect(e)}
              onToggleCompare={() => onToggleCompare(e.id)}
              onToggleImportant={() => onToggleImportant(e.id)}
            />
          ))}

          {/* Compare feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className={cn(
                  "pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur",
                  feedback.kind === "hit" && "border-primary/50 bg-primary/15 text-primary shadow-glow",
                  feedback.kind === "miss" && "border-border/70 bg-background/80 text-muted-foreground",
                  feedback.kind === "again" && "border-accent/40 bg-accent/15 text-accent",
                )}
              >
                {feedback.kind === "hit" && <Sparkles className="mr-1 inline h-3.5 w-3.5" />}
                {feedback.kind === "miss" && <Link2Off className="mr-1 inline h-3.5 w-3.5" />}
                {feedback.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corner label */}
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-black/40 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-amber-100/80 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Live desk
          </div>
          <div className="absolute bottom-4 right-4 rounded-full border border-black/40 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-amber-100/70 backdrop-blur">
            {discoveredConnections.length}/{c.connections.length} threads
          </div>
        </div>

        {/* State legend */}
        <div className="flex flex-wrap gap-2 pt-1">
          {(Object.keys(STATE_META) as EvidenceState[]).map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", STATE_META[k].dot)} /> {STATE_META[k].label}
            </span>
          ))}
        </div>
      </div>

      {/* --------- SIDE PANEL --------- */}
      <aside className="flex flex-col gap-4">
        <ConnectionsPanel
          all={c.connections}
          discoveredKeys={discoveredKeys}
          evidence={c.evidence}
        />
        <NotesPanel
          items={items}
          notes={notes}
          onAdd={onAddNote}
          onRemove={onRemoveNote}
        />
      </aside>

      {/* --------- INSPECTOR --------- */}
      <InspectorModal
        evidence={inspect}
        state={inspect ? evidenceStates[inspect.id] : undefined}
        important={inspect ? important.has(inspect.id) : false}
        onClose={() => setInspect(null)}
        onToggleImportant={onToggleImportant}
        onAddNote={onAddNote}
      />
    </div>
  );
}

/* ---------- DESK CARD ---------- */

function DeskCard({
  evidence, placement, state, important, selected, deskRef,
  onMove, onRotate, onFlip, onInspect, onToggleCompare, onToggleImportant,
}: {
  evidence: Evidence;
  placement: { x: number; y: number; rotation: number; flipped: boolean };
  state: EvidenceState;
  important: boolean;
  selected: boolean;
  deskRef: React.RefObject<HTMLDivElement | null>;
  onMove: (p: { x: number; y: number }) => void;
  onRotate: () => void;
  onFlip: () => void;
  onInspect: () => void;
  onToggleCompare: () => void;
  onToggleImportant: () => void;
}) {
  const Icon = evidenceIcon[evidence.tag];
  const meta = STATE_META[state];

  return (
    <motion.div
      className="absolute z-10"
      style={{
        left: `${placement.x}%`,
        top: `${placement.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      drag
      dragMomentum={false}
      dragElastic={0.15}
      whileDrag={{ scale: 1.08, zIndex: 30, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}
      whileHover={{ scale: 1.03 }}
      onDragEnd={(_, info) => {
        const rect = deskRef.current?.getBoundingClientRect();
        if (!rect) return;
        const nx = ((info.point.x - rect.left) / rect.width) * 100;
        const ny = ((info.point.y - rect.top) / rect.height) * 100;
        onMove({
          x: Math.max(8, Math.min(92, nx)),
          y: Math.max(10, Math.min(90, ny)),
        });
      }}
    >
      <motion.button
        onClick={(e) => {
          // Left click: toggle compare selection. Shift/dblclick → inspect.
          if (e.detail === 2) onInspect();
          else onToggleCompare();
        }}
        animate={{ rotate: placement.rotation }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className={cn(
          "group relative block w-44 cursor-grab select-none active:cursor-grabbing",
          "rounded-lg text-left focus:outline-none",
        )}
        title="Click to select · Double-click to inspect"
      >
        {/* 3D flip container */}
        <div className="relative h-56" style={{ perspective: 1000 }}>
          <motion.div
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: placement.flipped ? 180 : 0 }}
            transition={{ duration: 0.55 }}
          >
            {/* FRONT */}
            <div
              className={cn(
                "absolute inset-0 flex flex-col overflow-hidden rounded-lg border border-black/60 bg-[#f5efe1] p-3 text-[#2a2418] shadow-[0_10px_25px_rgba(0,0,0,0.5)] ring-2",
                meta.ring,
                selected && "ring-primary ring-offset-2 ring-offset-transparent",
              )}
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7a6b52]">
                    {meta.label}
                  </span>
                </div>
                {important && <Star className="h-3.5 w-3.5 fill-primary text-primary" />}
              </div>
              <div className="mt-2 flex h-16 items-center justify-center rounded border border-dashed border-[#c5b892] bg-[#efe6d0] text-[#7a6b52]">
                <Icon className="h-8 w-8" />
              </div>
              <p className="mt-2 font-serif text-sm font-semibold leading-tight">
                {evidence.label}
              </p>
              <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-[#5c503d]">
                {evidence.summary}
              </p>
              <div className="mt-auto flex items-center justify-between pt-2 font-mono text-[9px] uppercase tracking-widest text-[#7a6b52]">
                <span>{evidence.tag}</span>
                <span>#{evidence.id.replace("ev-", "")}</span>
              </div>
              {selected && (
                <div className="pointer-events-none absolute inset-0 rounded-lg ring-4 ring-primary/70" />
              )}
            </div>

            {/* BACK */}
            <div
              className="absolute inset-0 flex flex-col overflow-hidden rounded-lg border border-black/60 bg-[#2a2418] p-3 text-[#e8dfc9] shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-200/80">
                Chain of custody
              </p>
              <ol className="mt-2 space-y-1 text-[10px] leading-snug">
                {evidence.chainOfCustody.slice(0, 3).map((s, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="text-amber-200/60">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-auto pt-2 font-mono text-[9px] uppercase tracking-widest text-amber-200/50">
                Collected {evidence.collectedAt}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action bar */}
        <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-black/60 bg-[#1a140b]/95 px-1.5 py-1 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          <IconBtn title="Rotate" onClick={(ev) => { ev.stopPropagation(); onRotate(); }}>
            <RotateCw className="h-3 w-3" />
          </IconBtn>
          <IconBtn title="Flip" onClick={(ev) => { ev.stopPropagation(); onFlip(); }}>
            <ScanSearch className="h-3 w-3" />
          </IconBtn>
          <IconBtn title="Inspect" onClick={(ev) => { ev.stopPropagation(); onInspect(); }}>
            <ZoomIn className="h-3 w-3" />
          </IconBtn>
          <IconBtn title={important ? "Unmark important" : "Mark important"} onClick={(ev) => { ev.stopPropagation(); onToggleImportant(); }}>
            <Star className={cn("h-3 w-3", important && "fill-primary text-primary")} />
          </IconBtn>
        </div>
      </motion.button>
    </motion.div>
  );
}

function IconBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      title={title}
      className="grid h-6 w-6 place-items-center rounded-full text-amber-100/80 hover:bg-amber-100/10 hover:text-amber-100"
    >
      {children}
    </button>
  );
}

/* ---------- RED THREAD OVERLAY ---------- */

function ConnectionLines({
  connections, layout,
}: {
  deskRef: React.RefObject<HTMLDivElement | null>;
  connections: Case["connections"];
  layout: Record<string, { x: number; y: number }>;
}) {
  return (
    <svg className="pointer-events-none absolute inset-0 z-[5] h-full w-full">
      <defs>
        <filter id="thread-glow">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {connections.map((cn) => {
        const a = layout[cn.a];
        const b = layout[cn.b];
        if (!a || !b) return null;
        return (
          <g key={pairKey(cn.a, cn.b)} filter="url(#thread-glow)">
            <motion.line
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              x1={`${a.x}%`} y1={`${a.y}%`}
              x2={`${b.x}%`} y2={`${b.y}%`}
              stroke="#B22222"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="0 0"
              opacity={0.85}
            />
            {/* pins */}
            <circle cx={`${a.x}%`} cy={`${a.y}%`} r={4} fill="#B22222" stroke="#1a140b" strokeWidth={1.5} />
            <circle cx={`${b.x}%`} cy={`${b.y}%`} r={4} fill="#B22222" stroke="#1a140b" strokeWidth={1.5} />
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- CONNECTIONS PANEL ---------- */

function ConnectionsPanel({
  all, discoveredKeys, evidence,
}: {
  all: Case["connections"];
  discoveredKeys: Set<string>;
  evidence: Evidence[];
}) {
  const label = (id: string) => evidence.find((e) => e.id === id)?.label ?? id;
  const found = all.filter((c) => discoveredKeys.has(pairKey(c.a, c.b)));
  const remaining = all.length - found.length;
  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Connections</p>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {found.length}/{all.length}
        </span>
      </div>
      <div className="mt-3 space-y-3">
        {found.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Select two evidence cards and press <span className="font-semibold text-foreground">Compare</span> to reveal a red thread.
          </p>
        )}
        {found.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg border border-primary/40 bg-primary/5 p-3"
          >
            <p className="text-[11px] font-mono uppercase tracking-widest text-primary">
              {c.label}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground/90">
              <span className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-[10px]">{label(c.a)}</span>
              <span className="text-primary">↔</span>
              <span className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-[10px]">{label(c.b)}</span>
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{c.insight}</p>
          </motion.div>
        ))}
        {remaining > 0 && (
          <p className="pt-1 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {remaining} thread{remaining === 1 ? "" : "s"} still hidden
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- NOTES PANEL ---------- */

function NotesPanel({
  items, notes, onAdd, onRemove,
}: {
  items: Evidence[];
  notes: { id: string; evidenceId: string; note: string; at: string; pinned: boolean; custom: boolean }[];
  onAdd: (evId: string, text: string) => void;
  onRemove: (id: string) => void;
}) {
  const [evId, setEvId] = useState<string>(items[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const active = items.find((e) => e.id === (evId || items[0]?.id));
  const notesFor = active ? notes.filter((n) => n.evidenceId === active.id) : [];

  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-4">
      <div className="flex items-center gap-2">
        <NotebookPen className="h-4 w-4 text-accent" />
        <p className="text-sm font-semibold">Investigation Notes</p>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Notes are attached to a specific piece of evidence.
      </p>
      <div className="mt-3 space-y-2">
        <select
          value={active?.id ?? ""}
          onChange={(e) => setEvId(e.target.value)}
          className="w-full rounded-md border border-border/60 bg-background/60 px-2 py-1.5 text-xs outline-none focus:border-accent/50"
        >
          {items.map((e) => (
            <option key={e.id} value={e.id}>{e.label}</option>
          ))}
        </select>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. Timing lines up with the CCTV blackout…"
          className="h-16 w-full resize-none rounded-md border border-border/60 bg-background/40 p-2 text-xs outline-none focus:border-accent/50"
        />
        <Button
          size="sm"
          className="w-full"
          disabled={!active || !draft.trim()}
          onClick={() => {
            if (!active) return;
            onAdd(active.id, draft);
            setDraft("");
          }}
        >
          <Plus className="h-4 w-4" /> Add note
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        <AnimatePresence initial={false}>
          {notesFor.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="rounded-lg border border-border/60 bg-background/40 p-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] leading-relaxed text-foreground/90">{n.note}</p>
                {n.custom && (
                  <button
                    onClick={() => onRemove(n.id)}
                    className="text-muted-foreground hover:text-red-400"
                    title="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {n.custom ? "You" : "Auto"} · {n.at}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        {notesFor.length === 0 && (
          <p className="text-[11px] italic text-muted-foreground/70">
            No notes on this piece of evidence yet.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- INSPECTOR MODAL ---------- */

function InspectorModal({
  evidence, state, important, onClose, onToggleImportant, onAddNote,
}: {
  evidence: Evidence | null;
  state: EvidenceState | undefined;
  important: boolean;
  onClose: () => void;
  onToggleImportant: (id: string) => void;
  onAddNote: (evId: string, text: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [draft, setDraft] = useState("");
  if (!evidence) return null;
  const Icon = evidenceIcon[evidence.tag];
  const meta = state ? STATE_META[state] : STATE_META.examined;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, rotateX: -10 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="relative grid w-full max-w-4xl gap-6 rounded-2xl border border-border/70 bg-surface p-6 md:grid-cols-[minmax(0,1fr)_260px]"
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-md border border-border/60 bg-background/60 p-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Zoomable evidence face */}
          <div className="rounded-xl border border-border/60 bg-background/40 p-4">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-lg border border-black/60 bg-[#f5efe1] text-[#2a2418] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              <motion.div
                className="flex h-full w-full flex-col p-5"
                animate={{ scale: zoom }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                style={{ transformOrigin: "center" }}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest", "border-black/20 bg-black/5 text-[#5c503d]")}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} /> {meta.label}
                  </span>
                  {important && <Star className="h-4 w-4 fill-primary text-primary" />}
                </div>
                <div className="mt-4 flex h-32 items-center justify-center rounded border-2 border-dashed border-[#c5b892] bg-[#efe6d0] text-[#7a6b52]">
                  <Icon className="h-16 w-16" />
                </div>
                <p className="mt-4 font-serif text-lg font-semibold leading-tight">{evidence.label}</p>
                <p className="mt-1 text-xs text-[#5c503d]">{evidence.summary}</p>
                <p className="mt-auto pt-3 font-mono text-[9px] uppercase tracking-widest text-[#7a6b52]">
                  Collected {evidence.collectedAt} · {evidence.collectedBy}
                </p>
              </motion.div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <button onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))} className="rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs text-muted-foreground hover:text-foreground">−</button>
              <span className="font-mono text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(2, z + 0.15))} className="rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs text-muted-foreground hover:text-foreground">+</button>
              <button onClick={() => setZoom(1)} className="rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs text-muted-foreground hover:text-foreground">Reset</button>
            </div>
          </div>

          {/* Right column: detail + note */}
          <div className="flex min-w-0 flex-col gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Inspection</p>
              <h3 className="mt-1 text-lg font-semibold leading-tight">{evidence.label}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone={meta.tone}>{meta.label}</Badge>
                <Badge tone="muted">{evidence.tag}</Badge>
                {important && <Badge tone="primary"><Star className="h-3 w-3 fill-primary" /> Important</Badge>}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{evidence.detail}</p>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Add investigation note</p>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What does this tell you?"
                className="mt-2 h-20 w-full resize-none rounded-md border border-border/60 bg-background/40 p-2 text-xs outline-none focus:border-accent/50"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => onToggleImportant(evidence.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Pin className={cn("h-3.5 w-3.5", important && "fill-primary text-primary")} />
                  {important ? "Unmark" : "Mark important"}
                </button>
                <Button
                  size="sm"
                  disabled={!draft.trim()}
                  onClick={() => { onAddNote(evidence.id, draft); setDraft(""); }}
                >
                  <Plus className="h-4 w-4" /> Save note
                </Button>
              </div>
            </div>

            {evidence.forensicReport && (
              <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                  <FileText className="h-3 w-3" /> Lab note
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-foreground/90">{evidence.forensicReport}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
