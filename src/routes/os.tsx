/**
 * Detective OS — the operating system for Case Zero.
 *
 * Seven physical environments the detective moves between. Each has its
 * own atmosphere, lighting, and transition. Not pages — locations.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Radio,
  FolderOpen,
  MapPin,
  FlaskConical,
  Mic,
  Network,
  Film,
  Lock,
  Download,
  Signal,
  CheckCircle2,
  Circle,
  Eye,
  Fingerprint,
  Pin,
  Sparkles,
  Flame,
  X,
  ChevronRight,
  Gavel,
  Volume2,
  Wind,
} from "lucide-react";
import { case001, type Case, type Evidence, type Suspect } from "@/data/case001";
import { useInvestigation } from "@/lib/use-investigation";
import { useStory } from "@/lib/story-engine";
import { EvidenceTable } from "@/components/case-zero/evidence-table";
import { AnimatedNumber } from "@/components/case-zero/animated-number";
import { cn } from "@/lib/utils";
import crimeSceneImg from "@/assets/crime-scene-train.jpg";

export const Route = createFileRoute("/os")({
  head: () => ({
    meta: [
      { title: "Detective OS — Case Zero" },
      {
        name: "description",
        content:
          "The detective's operating system. Move between the terminal, desk, crime scene, lab, interrogation room, war room, and reconstruction theater.",
      },
    ],
  }),
  component: DetectiveOS,
});

/* ------------------------------------------------------------------ */
/*  Environment registry                                              */
/* ------------------------------------------------------------------ */

type EnvId =
  | "terminal"
  | "desk"
  | "scene"
  | "lab"
  | "interrogation"
  | "warroom"
  | "theater";

interface EnvMeta {
  id: EnvId;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  ambient: string; // one-liner shown in HUD
}

const ENVIRONMENTS: EnvMeta[] = [
  { id: "terminal", label: "Police Terminal", sub: "01 · Dispatch", icon: Radio, ambient: "SECURE CHANNEL" },
  { id: "desk", label: "Detective Desk", sub: "02 · Briefing", icon: FolderOpen, ambient: "PRIVATE OFFICE" },
  { id: "scene", label: "Crime Scene", sub: "03 · Field", icon: MapPin, ambient: "PERIMETER ACTIVE" },
  { id: "lab", label: "Evidence Lab", sub: "04 · Analysis", icon: FlaskConical, ambient: "STERILE ZONE" },
  { id: "interrogation", label: "Interrogation Room", sub: "05 · Testimony", icon: Mic, ambient: "RECORDING" },
  { id: "warroom", label: "War Room", sub: "06 · Pattern", icon: Network, ambient: "CLASSIFIED" },
  { id: "theater", label: "Reconstruction", sub: "07 · Verdict", icon: Film, ambient: "PLAYBACK" },
];

/* ------------------------------------------------------------------ */
/*  Persistence for OS-only progression flags                         */
/* ------------------------------------------------------------------ */

const OS_KEY = "case-zero:os:v1";

interface OsState {
  caseDownloaded: boolean;
  folderOpened: boolean;
}

function loadOs(): OsState {
  if (typeof window === "undefined") return { caseDownloaded: false, folderOpened: false };
  try {
    const raw = window.localStorage.getItem(OS_KEY);
    if (!raw) return { caseDownloaded: false, folderOpened: false };
    return { caseDownloaded: false, folderOpened: false, ...JSON.parse(raw) };
  } catch {
    return { caseDownloaded: false, folderOpened: false };
  }
}
function saveOs(s: OsState) {
  try { window.localStorage.setItem(OS_KEY, JSON.stringify(s)); } catch {}
}

/* ------------------------------------------------------------------ */
/*  Root                                                              */
/* ------------------------------------------------------------------ */

function DetectiveOS() {
  const c = case001;
  const inv = useInvestigation(c);
  const [os, setOs] = useState<OsState>(() => loadOs());
  const [env, setEnv] = useState<EnvId>(() => {
    const s = loadOs();
    if (!s.caseDownloaded) return "terminal";
    if (!s.folderOpened) return "desk";
    return "desk";
  });
  const [transitioning, setTransitioning] = useState<EnvId | null>(null);
  const reduce = useReducedMotion();

  const update = (patch: Partial<OsState>) => {
    setOs((prev) => {
      const next = { ...prev, ...patch };
      saveOs(next);
      return next;
    });
  };

  const locked = (id: EnvId) => {
    if (id === "terminal") return false;
    if (id === "desk") return !os.caseDownloaded;
    if (id === "theater") return !inv.verdict;
    return !os.folderOpened;
  };

  const go = (id: EnvId) => {
    if (id === env) return;
    if (locked(id)) return;
    if (reduce) { setEnv(id); return; }
    setTransitioning(id);
    window.setTimeout(() => {
      setEnv(id);
      window.setTimeout(() => setTransitioning(null), 260);
    }, 520);
  };

  const currentMeta = ENVIRONMENTS.find((e) => e.id === env)!;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05070A] text-foreground">
      {/* Persistent OS chrome */}
      <TopHud env={currentMeta} inv={inv} caseRef={c} />

      {/* Environment stage */}
      <div className="relative min-h-screen pb-32 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={env}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-[calc(100vh-4rem)]"
          >
            {env === "terminal" && (
              <TerminalEnv
                downloaded={os.caseDownloaded}
                onDownload={() => { update({ caseDownloaded: true }); go("desk"); }}
                caseRef={c}
              />
            )}
            {env === "desk" && (
              <DeskEnv
                caseRef={c}
                inv={inv}
                folderOpen={os.folderOpened}
                onOpenFolder={() => update({ folderOpened: true })}
                onGo={go}
              />
            )}
            {env === "scene" && <SceneEnv caseRef={c} inv={inv} />}
            {env === "lab" && <LabEnv caseRef={c} inv={inv} />}
            {env === "interrogation" && <InterrogationEnv caseRef={c} inv={inv} />}
            {env === "warroom" && <WarRoomEnv />}
            {env === "theater" && <TheaterEnv caseRef={c} inv={inv} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Environment dock */}
      <EnvironmentDock current={env} isLocked={locked} onGo={go} inv={inv} />

      {/* Cinematic transition curtain */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-black"
          >
            <motion.div
              initial={{ y: 12, opacity: 0, letterSpacing: "0.4em" }}
              animate={{ y: 0, opacity: 1, letterSpacing: "0.6em" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
                {ENVIRONMENTS.find((e) => e.id === transitioning)?.sub}
              </p>
              <p className="mt-3 font-display text-3xl font-semibold uppercase tracking-[0.4em] text-white md:text-5xl">
                {ENVIRONMENTS.find((e) => e.id === transitioning)?.label}
              </p>
              <div className="mx-auto mt-6 h-px w-24 bg-white/30" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Top HUD (persistent)                                              */
/* ------------------------------------------------------------------ */

function TopHud({
  env,
  inv,
  caseRef,
}: {
  env: EnvMeta;
  inv: ReturnType<typeof useInvestigation>;
  caseRef: Case;
}) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setTime(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/5 bg-black/60 px-4 py-2.5 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70 transition-colors hover:border-white/25 hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" /> Exit
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
            {env.ambient}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/40">{caseRef.number}</p>
        <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-white/90 md:text-sm">
          {env.label}
        </p>
      </div>
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/60">
        <span className="hidden items-center gap-1.5 sm:flex">
          <Sparkles className="h-3 w-3 text-[#D4AF37]" />
          <AnimatedNumber value={inv.xp} /> XP
        </span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <Flame className={cn("h-3 w-3", inv.intuition >= 100 ? "text-[#C62828]" : "text-white/40")} />
          {inv.intuition}%
        </span>
        <span>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Environment dock                                                  */
/* ------------------------------------------------------------------ */

function EnvironmentDock({
  current,
  isLocked,
  onGo,
  inv,
}: {
  current: EnvId;
  isLocked: (id: EnvId) => boolean;
  onGo: (id: EnvId) => void;
  inv: ReturnType<typeof useInvestigation>;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/5 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-stretch gap-1 overflow-x-auto px-3 py-2">
        {ENVIRONMENTS.map((e) => {
          const active = current === e.id;
          const lock = isLocked(e.id);
          const Icon = e.icon;
          const badge = badgeFor(e.id, inv);
          return (
            <button
              key={e.id}
              onClick={() => onGo(e.id)}
              disabled={lock}
              className={cn(
                "group relative flex min-w-[86px] flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 transition-all md:min-w-[110px]",
                active
                  ? "bg-white/10 text-white"
                  : lock
                  ? "cursor-not-allowed text-white/25"
                  : "text-white/55 hover:bg-white/5 hover:text-white",
              )}
            >
              {active && (
                <motion.span
                  layoutId="env-underline"
                  className="absolute inset-x-3 -top-[9px] h-[2px] rounded-full bg-[#D4AF37]"
                />
              )}
              <div className="relative">
                <Icon className="h-4 w-4" />
                {lock && (
                  <Lock className="absolute -right-2 -top-1 h-2.5 w-2.5 text-white/40" />
                )}
                {badge != null && !lock && (
                  <span className="absolute -right-2 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#C62828] px-1 font-mono text-[8px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.15em]">
                {e.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function badgeFor(id: EnvId, inv: ReturnType<typeof useInvestigation>): number | null {
  switch (id) {
    case "scene":
      return inv.investigated.size < case001.hotspots.length
        ? case001.hotspots.length - inv.investigated.size
        : null;
    case "lab":
      return inv.examined.size > 0 && inv.discoveredConnections.length < case001.connections.length
        ? case001.connections.length - inv.discoveredConnections.length
        : null;
    case "interrogation":
      return inv.interviewed.size < case001.suspects.length
        ? case001.suspects.length - inv.interviewed.size
        : null;
    default:
      return null;
  }
}

/* ================================================================== */
/*  1. POLICE TERMINAL                                                */
/* ================================================================== */

function TerminalEnv({
  downloaded,
  onDownload,
  caseRef,
}: {
  downloaded: boolean;
  onDownload: () => void;
  caseRef: Case;
}) {
  const reduce = useReducedMotion();
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const script = useMemo(
    () => [
      "> SECURE UPLINK ESTABLISHED",
      "> AUTHENTICATING BADGE #47318 . . . OK",
      "> INCOMING DISPATCH — PRIORITY ALPHA",
      "",
      `> FILE 001 · CASE ${caseRef.number}`,
      `> "${caseRef.title.toUpperCase()}"`,
      `> VICTIM: ${caseRef.victim.name} — ${caseRef.victim.occupation}`,
      `> LOCATION: ${caseRef.location}`,
      `> TIME OF DEATH: ${caseRef.victim.timeOfDeath}`,
      "",
      "> WAITING FOR DETECTIVE ACCEPTANCE . . .",
    ],
    [caseRef],
  );

  useEffect(() => {
    if (reduce) { setLines(script); return; }
    let i = 0;
    const t = window.setInterval(() => {
      i++;
      setLines(script.slice(0, i));
      if (i >= script.length) window.clearInterval(t);
    }, 180);
    return () => window.clearInterval(t);
  }, [script, reduce]);

  const handleDownload = () => {
    if (downloading || downloaded) return;
    setDownloading(true);
    const start = Date.now();
    const dur = reduce ? 400 : 1900;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setProgress(Math.round(p * 100));
      if (p < 1) requestAnimationFrame(tick);
      else onDownload();
    };
    requestAnimationFrame(tick);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-black text-emerald-300">
      {/* CRT scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,255,120,0.06) 0 2px, transparent 2px 4px)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.85)_100%)]" />
      {!reduce && (
        <motion.div
          animate={{ opacity: [0.9, 1, 0.95] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="pointer-events-none absolute inset-0 bg-[#03110A]/40"
        />
      )}

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col justify-center px-4 py-16 font-mono md:px-6">
        <div className="mb-8 flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-emerald-500/70">
          <div className="flex items-center gap-2">
            <Signal className="h-3 w-3" />
            <span>Dispatch Terminal · Precinct 09</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>ENCRYPTED</span>
          </div>
        </div>

        <div className="min-h-[280px] rounded border border-emerald-500/25 bg-black/70 p-6 text-sm leading-relaxed shadow-[0_0_60px_-20px_rgba(74,222,128,0.4)] md:p-8 md:text-base">
          {lines.map((l, i) => (
            <div key={i} className={cn("whitespace-pre", l === "" && "h-3")}>
              {l}
              {i === lines.length - 1 && <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-emerald-400 align-middle" />}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          {downloaded ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm uppercase tracking-[0.3em]">Case downloaded · Report to desk</span>
            </div>
          ) : downloading ? (
            <div className="w-full max-w-md">
              <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-emerald-400/80">
                <span>DOWNLOADING CLASSIFIED FILE</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-emerald-500/15">
                <div
                  className="h-full bg-emerald-400 transition-[width] duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-500/50">
                Printing classified file . . .
              </p>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              className="group inline-flex items-center gap-3 border border-emerald-400/60 bg-emerald-500/5 px-6 py-3 font-mono text-xs uppercase tracking-[0.4em] text-emerald-300 transition-all hover:border-emerald-400 hover:bg-emerald-500/15 hover:shadow-[0_0_40px_-8px_rgba(74,222,128,0.6)]"
            >
              <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              Download Case
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  2. DETECTIVE DESK                                                 */
/* ================================================================== */

function DeskEnv({
  caseRef,
  inv,
  folderOpen,
  onOpenFolder,
  onGo,
}: {
  caseRef: Case;
  inv: ReturnType<typeof useInvestigation>;
  folderOpen: boolean;
  onOpenFolder: () => void;
  onGo: (id: EnvId) => void;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Wood desk atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 25% 20%, rgba(255,190,110,0.18), transparent 60%), radial-gradient(ellipse at bottom, #1a120a 0%, #0a0605 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Lamp glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#f5b45a]/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl grid-cols-1 gap-8 px-4 py-16 md:grid-cols-[1.1fr_1fr] md:px-6">
        {/* Folder */}
        <div className="flex items-center justify-center">
          <FolderProp
            title={caseRef.title}
            number={caseRef.number}
            open={folderOpen}
            onOpen={onOpenFolder}
          />
        </div>

        {/* Briefing pane */}
        <div className="flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!folderOpen ? (
              <motion.div
                key="closed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white/70"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#D4AF37]">
                  Awaiting review
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white md:text-4xl">
                  Today's folder is on your desk.
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-white/60">
                  Sealed by dispatch. Open when you're ready to accept the case.
                  Once opened, the perimeter goes live.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#D4AF37]">
                  Case Brief
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white md:text-4xl">
                  {caseRef.title}
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-white/70">
                  {caseRef.briefing}
                </p>

                <div className="mt-6 space-y-2 rounded-lg border border-white/10 bg-black/40 p-4 backdrop-blur">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">
                    Objectives
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {inv.objectives.map((o) => (
                      <li key={o.objective.id} className="flex items-center gap-2 text-white/75">
                        {o.complete ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-white/30" />
                        )}
                        <span className={cn(o.complete && "text-white/40 line-through")}>{o.objective.label}</span>
                        <span className="ml-auto font-mono text-[10px] text-white/40">
                          {o.current}/{o.total}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => onGo("scene")}
                    className="inline-flex items-center gap-2 rounded-md bg-[#C62828] px-4 py-2.5 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-[#a02020]"
                  >
                    Head to Scene <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onGo("interrogation")}
                    className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium uppercase tracking-widest text-white/80 transition hover:border-white/30 hover:text-white"
                  >
                    Interviews
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FolderProp({
  title, number, open, onOpen,
}: {
  title: string; number: string; open: boolean; onOpen: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="relative" style={{ perspective: 1400 }}>
      <motion.button
        onClick={onOpen}
        disabled={open}
        initial={false}
        animate={{
          rotateX: open ? -22 : 0,
          rotateZ: open ? 0 : -3,
          y: open ? -20 : 0,
        }}
        transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        whileHover={!open ? { rotateZ: -1, y: -4 } : undefined}
        className="relative block h-72 w-[22rem] cursor-pointer text-left disabled:cursor-default md:h-80 md:w-[26rem]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Back inner content (papers) */}
        <div
          className="absolute inset-0 rounded-md bg-[#f4e6c8] p-6 text-[#1a120a] shadow-2xl"
          style={{ transform: "translateZ(-1px)" }}
        >
          <div className="border-b border-black/20 pb-2 font-mono text-[10px] uppercase tracking-widest">
            Confidential · Interdept.
          </div>
          <p className="mt-3 font-serif text-lg italic">
            "{title}"
          </p>
          <p className="mt-2 text-xs opacity-70">
            The following documents are for the assigned detective only. Chain-of-custody logs enclosed.
          </p>
        </div>
        {/* Front cover */}
        <motion.div
          initial={false}
          animate={{ rotateX: open ? -155 : 0 }}
          transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 origin-top rounded-md p-6 shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, #d9a45c 0%, #b4813d 60%, #8a5a25 100%)",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="flex h-full flex-col justify-between text-[#2a1a08]">
            <div>
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.35em]">
                <span>Case File</span>
                <span>{number}</span>
              </div>
              <div className="mt-4 h-px bg-black/30" />
              <p className="mt-6 font-serif text-3xl font-bold uppercase leading-tight tracking-wide md:text-4xl">
                {title}
              </p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-70">Assigned</p>
                <p className="font-serif text-base italic">Det. You</p>
              </div>
              {/* Classified stamp */}
              <div className="rotate-[-8deg] rounded border-[3px] border-[#8b1a1a] px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-[#8b1a1a] opacity-85">
                Classified
              </div>
            </div>
          </div>
        </motion.div>
      </motion.button>
      {!open && (
        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
          Click folder to open
        </p>
      )}
    </div>
  );
}

/* ================================================================== */
/*  3. CRIME SCENE                                                    */
/* ================================================================== */

function SceneEnv({ caseRef, inv }: { caseRef: Case; inv: ReturnType<typeof useInvestigation> }) {
  const [active, setActive] = useState<Evidence | null>(null);
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#050a12] via-[#070d17] to-[#03060b]">
      {/* Cold blue ambience */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(60,120,200,0.12),transparent_60%)]" />
      {/* Rain grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='2.5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-4 py-10 md:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#D4AF37]">Perimeter · Live</p>
            <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">
              {caseRef.location}
            </h2>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
            {inv.investigated.size} / {caseRef.hotspots.length} hotspots searched
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)]">
          <div className="relative aspect-[16/9]">
            <img
              src={crimeSceneImg}
              alt="Crime scene"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.7))]" />
            {/* Police tape */}
            <div className="pointer-events-none absolute inset-x-0 top-6 -rotate-2 bg-[repeating-linear-gradient(90deg,#f5c518_0_28px,#0b0b0b_28px_60px)] py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-black shadow-lg">
              <span className="mx-auto block text-center">POLICE LINE · DO NOT CROSS · POLICE LINE · DO NOT CROSS</span>
            </div>

            {caseRef.hotspots.map((h) => {
              const done = inv.investigated.has(h.id);
              return (
                <button
                  key={h.id}
                  onClick={(e) => {
                    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    inv.investigateHotspot(h.id, r.left + r.width / 2, r.top + r.height / 2);
                    const ev = caseRef.evidence.find((x) => x.id === h.evidenceId);
                    if (ev) setActive(ev);
                  }}
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  aria-label={h.label}
                >
                  <span className="relative flex h-9 w-9 items-center justify-center">
                    {!done && (
                      <>
                        <span className="absolute inset-0 animate-ping rounded-full bg-[#D4AF37]/40" />
                        <span className="absolute inset-1 rounded-full bg-[#D4AF37]/30 blur-md" />
                      </>
                    )}
                    <span
                      className={cn(
                        "relative grid h-5 w-5 place-items-center rounded-full border-2 transition",
                        done ? "border-emerald-400/70 bg-emerald-400/25" : "border-[#D4AF37] bg-black/60",
                      )}
                    >
                      {done ? <Eye className="h-2.5 w-2.5 text-emerald-200" /> : <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Evidence collected inline */}
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {caseRef.evidence.map((e) => {
            const found = inv.examined.has(e.id);
            return (
              <button
                key={e.id}
                onClick={() => found && setActive(e)}
                className={cn(
                  "rounded-lg border p-3 text-left transition",
                  found
                    ? "border-white/15 bg-white/5 text-white hover:border-[#D4AF37]/50"
                    : "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/25",
                )}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest">
                  <Fingerprint className="h-3 w-3" />
                  {found ? "Collected" : "Not found"}
                </div>
                <p className="mt-1 text-sm font-medium">{found ? e.label : "Undiscovered clue"}</p>
              </button>
            );
          })}
        </div>
      </div>

      <EvidenceDetail evidence={active} onClose={() => setActive(null)} inv={inv} />
    </div>
  );
}

function EvidenceDetail({
  evidence,
  onClose,
  inv,
}: {
  evidence: Evidence | null;
  onClose: () => void;
  inv: ReturnType<typeof useInvestigation>;
}) {
  return (
    <AnimatePresence>
      {evidence && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-2xl border border-white/10 bg-[#0e1218] p-6 shadow-2xl md:rounded-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#D4AF37]">
                  Evidence · {evidence.tag}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold text-white">{evidence.label}</h3>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/70">{evidence.detail}</p>
            <div className="mt-4 rounded-md border border-white/10 bg-black/30 p-3 text-xs text-white/60">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Location</p>
              <p className="mt-1">{evidence.location}</p>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => inv.toggleImportant(evidence.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs uppercase tracking-widest transition",
                  inv.important.has(evidence.id)
                    ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                    : "border-white/15 text-white/70 hover:border-white/40",
                )}
              >
                <Pin className="h-3 w-3" /> Mark important
              </button>
              <button
                onClick={onClose}
                className="ml-auto text-xs uppercase tracking-widest text-white/50 hover:text-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================== */
/*  4. EVIDENCE LAB                                                   */
/* ================================================================== */

function LabEnv({ caseRef, inv }: { caseRef: Case; inv: ReturnType<typeof useInvestigation> }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0a1014] via-[#0c1218] to-[#050709]">
      {/* Sterile cyan light */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,220,255,0.08),transparent_55%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-[1500px] px-4 py-10 md:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#D4AF37]">
              Forensics Bay · Sterile
            </p>
            <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">
              Evidence Lab
            </h2>
            <p className="mt-1 max-w-lg text-sm text-white/50">
              Arrange, flip, and thread clues together. Two items + Compare reveals a connection.
            </p>
          </div>
          <div className="flex gap-3 font-mono text-[10px] uppercase tracking-widest text-white/50">
            <span className="rounded border border-white/10 bg-white/5 px-2 py-1">
              {inv.discoveredConnections.length}/{caseRef.connections.length} threads
            </span>
            <span className="rounded border border-white/10 bg-white/5 px-2 py-1">
              {inv.examined.size} clues
            </span>
          </div>
        </div>

        {inv.examined.size === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/40 p-16 text-center">
            <FlaskConical className="mx-auto h-8 w-8 text-white/30" />
            <p className="mt-4 text-sm text-white/50">
              No evidence in the bay yet. Collect clues from the crime scene.
            </p>
          </div>
        ) : (
          <EvidenceTable
            case={caseRef}
            examined={inv.examined}
            placements={inv.deskPlacements}
            important={inv.important}
            compareSet={inv.compareSet}
            notes={inv.notebook}
            evidenceStates={inv.evidenceStates}
            discoveredConnections={inv.discoveredConnections}
            discoveredKeys={inv.discoveredConnectionKeys}
            onMove={(id, p) => inv.setDeskPlacement(id, p)}
            onRotate={(id) => inv.rotateEvidence(id)}
            onFlip={inv.flipEvidence}
            onToggleImportant={inv.toggleImportant}
            onToggleCompare={inv.toggleCompare}
            onClearCompare={inv.clearCompare}
            onTryConnect={inv.tryConnect}
            onAddNote={inv.addEvidenceNote}
            onRemoveNote={inv.removeNote}
          />
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  5. INTERROGATION ROOM                                             */
/* ================================================================== */

function InterrogationEnv({ caseRef, inv }: { caseRef: Case; inv: ReturnType<typeof useInvestigation> }) {
  const [activeId, setActiveId] = useState<string>(caseRef.suspects[0]?.id ?? "");
  const [accuseOpen, setAccuseOpen] = useState(false);
  const active = caseRef.suspects.find((s) => s.id === activeId) ?? null;
  const interviewed = active ? inv.interviewed.has(active.id) : false;
  const score = active ? inv.suspicionScores[active.id]?.score ?? 0 : 0;
  const band = active ? inv.suspicionScores[active.id]?.band ?? "low" : "low";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-black">
      {/* Overhead spotlight */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 45%, rgba(255,235,180,0.14), transparent 65%)",
        }}
      />
      {/* One-way mirror strip */}
      <div className="pointer-events-none absolute inset-x-0 top-16 h-14 border-y border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.01]">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 font-mono text-[9px] uppercase tracking-[0.4em] text-white/25">
          <span>◆ ONE-WAY MIRROR ◆</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
            REC
          </span>
        </div>
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl grid-cols-1 gap-8 px-4 py-24 lg:grid-cols-[220px_1fr] lg:px-6">
        {/* Roster */}
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
            Room roster
          </p>
          {caseRef.suspects.map((s) => {
            const done = inv.interviewed.has(s.id);
            const sc = inv.suspicionScores[s.id];
            return (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={cn(
                  "flex items-center gap-3 rounded-md border px-3 py-2 text-left transition",
                  activeId === s.id
                    ? "border-[#D4AF37]/50 bg-white/5 text-white"
                    : "border-white/5 text-white/60 hover:border-white/15 hover:text-white",
                )}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 font-mono text-[10px] font-semibold">
                  {s.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{s.name}</p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/40">
                    {done ? `Interviewed · ${sc?.band ?? "low"}` : "Not interviewed"}
                  </p>
                </div>
              </button>
            );
          })}

          <button
            onClick={() => setAccuseOpen(true)}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-md border border-[#C62828]/50 bg-[#C62828]/10 px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-[#f8a4a4] transition hover:bg-[#C62828]/20"
          >
            <Gavel className="h-3.5 w-3.5" /> File Accusation
          </button>
        </div>

        {/* Chair spotlight */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="mx-auto max-w-2xl"
              >
                <div className="mb-6 flex flex-col items-center text-center">
                  <div className="mb-4 grid h-28 w-28 place-items-center rounded-full border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.02] font-display text-3xl font-semibold text-white/90 shadow-[0_0_60px_rgba(255,230,180,0.15)]">
                    {active.initials}
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-white md:text-3xl">
                    {active.name}
                  </h3>
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
                    {active.occupation} · {active.relationship}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-black/60 p-5 shadow-inner backdrop-blur">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#D4AF37]">Statement</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/80 italic">
                    "{active.statement}"
                  </p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-white/40">Alibi</p>
                  <p className="mt-1 text-sm text-white/60">{active.alibi}</p>

                  {interviewed && active.secret && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 rounded-md border border-[#C62828]/40 bg-[#C62828]/10 p-3"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[#f8a4a4]">
                        What they didn't say
                      </p>
                      <p className="mt-1 text-sm text-white/85">{active.secret}</p>
                    </motion.div>
                  )}

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-white/40">
                        Suspicion · {band}
                      </p>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={false}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.6 }}
                          className={cn(
                            "h-full",
                            band === "prime" && "bg-[#C62828]",
                            band === "high" && "bg-red-500/80",
                            band === "medium" && "bg-amber-400/80",
                            band === "low" && "bg-emerald-500/60",
                          )}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => inv.interviewSuspect(active.id)}
                      disabled={interviewed}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs uppercase tracking-widest transition",
                        interviewed
                          ? "cursor-default border-white/10 bg-white/5 text-white/40"
                          : "border-[#D4AF37]/60 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20",
                      )}
                    >
                      <Mic className="h-3 w-3" />
                      {interviewed ? "Recorded" : "Start Interview"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {accuseOpen && (
        <AccuseModal caseRef={caseRef} inv={inv} onClose={() => setAccuseOpen(false)} />
      )}
    </div>
  );
}

/* ================================================================== */
/*  Accusation modal (shared)                                         */
/* ================================================================== */

function AccuseModal({
  caseRef, inv, onClose,
}: {
  caseRef: Case;
  inv: ReturnType<typeof useInvestigation>;
  onClose: () => void;
}) {
  const [killer, setKiller] = useState<string>("");
  const [weapon, setWeapon] = useState<string>("");
  const [motive, setMotive] = useState<string>("");
  const [primary, setPrimary] = useState<string>("");
  const [confirm, setConfirm] = useState(false);

  const canFile = killer && weapon && motive && primary;
  const examinedEv = caseRef.evidence.filter((e) => inv.examined.has(e.id));

  const submit = () => {
    inv.submitVerdict(killer, weapon, motive, primary);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0e1218] p-6 shadow-2xl md:p-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#C62828]">FILE ACCUSATION</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-white">Name the killer</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-6 space-y-5">
          <Picker label="Killer" value={killer} onChange={setKiller} options={caseRef.suspects.map(s => ({ id: s.id, label: s.name }))} />
          <Picker label="Weapon" value={weapon} onChange={setWeapon} options={caseRef.weaponOptions.map(w => ({ id: w.id, label: w.label }))} />
          <Picker label="Motive" value={motive} onChange={setMotive} options={caseRef.motiveOptions.map(m => ({ id: m.id, label: m.label }))} />
          <Picker label="Primary Evidence" value={primary} onChange={setPrimary} options={examinedEv.map(e => ({ id: e.id, label: e.label }))} disabledMsg={!examinedEv.length ? "Collect evidence first" : undefined} />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
            Once filed, the verdict is permanent.
          </p>
          {!confirm ? (
            <button
              onClick={() => canFile && setConfirm(true)}
              disabled={!canFile}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-widest transition",
                canFile ? "bg-[#C62828] text-white hover:bg-[#a02020]" : "cursor-not-allowed bg-white/10 text-white/30",
              )}
            >
              <Gavel className="h-4 w-4" /> File
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setConfirm(false)} className="rounded-md border border-white/15 px-3 py-2 text-xs uppercase tracking-widest text-white/70 hover:text-white">Cancel</button>
              <button onClick={submit} className="rounded-md bg-[#C62828] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[#a02020]">Confirm accusation</button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Picker({
  label, value, onChange, options, disabledMsg,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
  disabledMsg?: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">{label}</p>
      {disabledMsg ? (
        <p className="mt-2 rounded-md border border-white/10 bg-white/5 p-3 text-xs text-white/40">{disabledMsg}</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs transition",
                value === o.id
                  ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  6. WAR ROOM                                                       */
/* ================================================================== */

function WarRoomEnv() {
  const story = useStory();
  const { board, archived, revealedClues } = story;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Cork board texture */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top, #4a2f18 0%, #2a1a0d 60%, #180d06 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-50 mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-4 py-10 md:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#D4AF37]">
              Restricted · Task Force Only
            </p>
            <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">
              War Room
            </h2>
            <p className="mt-1 max-w-lg text-sm text-white/60">
              Every solved case adds a pin. Every recurring clue tightens the thread.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center font-mono text-[10px] uppercase tracking-widest text-white/60">
            <StatChip label="Cases" value={String(archived.length)} />
            <StatChip label="Threads" value={String(revealedClues.length)} />
            <StatChip label="Day" value={String(story.currentDay)} />
          </div>
        </div>

        {archived.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/40 p-16 text-center">
            <Network className="mx-auto h-8 w-8 text-white/30" />
            <p className="mt-4 text-sm text-white/50">
              The board is empty. Solve today's case to pin the first victim.
            </p>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-black/30 bg-[#3a2412]/50 p-8 shadow-inner">
            {/* Board pins */}
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {board.pins.map((p) => (
                <PinCard key={p.id} pin={p} />
              ))}
            </div>

            {/* Shared clues */}
            {revealedClues.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">
                  Shared Clues
                </p>
                <div className="flex flex-wrap gap-2">
                  {revealedClues.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-black/40 px-3 py-1 text-xs text-white/80"
                    >
                      <span className="text-[#D4AF37]">{c.symbol}</span>
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-white/15 bg-black/40 px-2 py-1.5 text-white">
      <p className="text-[9px] text-white/50">{label}</p>
      <p className="font-display text-base font-semibold">{value}</p>
    </div>
  );
}

function PinCard({ pin }: { pin: { kind: string; label: string; sublabel?: string; symbol?: string } }) {
  const tone =
    pin.kind === "victim"
      ? "border-white/20 bg-[#f5ebd6] text-[#1a120a]"
      : pin.kind === "clue"
      ? "border-[#D4AF37]/60 bg-[#1a120a]/90 text-[#D4AF37]"
      : "border-white/20 bg-[#0e1218]/85 text-white";
  return (
    <div className={cn("relative -rotate-1 rounded-md border p-3 shadow-lg", tone)} style={{ transform: `rotate(${(Math.random() * 4 - 2).toFixed(1)}deg)` }}>
      <span className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#C62828] shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
      <p className="font-mono text-[9px] uppercase tracking-widest opacity-60">{pin.kind}</p>
      <p className="mt-1 font-serif text-sm font-semibold leading-tight">
        {pin.symbol ? <span className="mr-1">{pin.symbol}</span> : null}
        {pin.label}
      </p>
      {pin.sublabel && <p className="mt-1 text-[10px] opacity-70">{pin.sublabel}</p>}
    </div>
  );
}

/* ================================================================== */
/*  7. RECONSTRUCTION THEATER                                         */
/* ================================================================== */

function TheaterEnv({ caseRef, inv }: { caseRef: Case; inv: ReturnType<typeof useInvestigation> }) {
  const v = inv.verdict;
  const [curtainUp, setCurtainUp] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    const t = window.setTimeout(() => setCurtainUp(true), reduce ? 100 : 900);
    return () => window.clearTimeout(t);
  }, [reduce]);

  if (!v) return null;
  const sol = caseRef.solution;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-black text-white">
      {/* Curtains */}
      <AnimatePresence>
        {!curtainUp && (
          <>
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1] }}
              className="pointer-events-none absolute inset-y-0 left-0 z-40 w-1/2"
              style={{
                background: "linear-gradient(90deg, #4d0808 0%, #7a1010 40%, #380505 100%)",
                boxShadow: "inset -30px 0 60px rgba(0,0,0,0.7)",
              }}
            />
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1] }}
              className="pointer-events-none absolute inset-y-0 right-0 z-40 w-1/2"
              style={{
                background: "linear-gradient(-90deg, #4d0808 0%, #7a1010 40%, #380505 100%)",
                boxShadow: "inset 30px 0 60px rgba(0,0,0,0.7)",
              }}
            />
          </>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,235,180,0.06),transparent_70%)]" />

      <div className="relative mx-auto max-w-4xl px-4 py-16 md:px-6">
        <AnimatePresence>
          {curtainUp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-[#D4AF37]">
                  Reconstruction · Playback
                </p>
                <h2 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide md:text-6xl">
                  {v.grade === "F" ? "The Truth" : "Case Closed"}
                </h2>
                <p className="mt-4 text-sm text-white/60">
                  Your verdict — {v.killerName} · {v.weaponLabel} · {v.motiveLabel} — scored
                  <span className="mx-2 font-display text-2xl text-[#D4AF37]">{v.grade}</span>
                  ({v.totalScore}/{v.maxScore})
                </p>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-3">
                <Chapter title="WHO" body={caseRef.suspects.find(s => s.id === sol.killerId)?.name ?? "Unknown"} correct={v.correctKiller} delay={0.2} />
                <Chapter title="WHY" body={caseRef.motiveOptions.find(m => m.id === sol.motiveId)?.label ?? "Unknown"} correct={v.correctMotive} delay={0.5} />
                <Chapter title="HOW" body={caseRef.weaponOptions.find(w => w.id === sol.weaponId)?.label ?? "Unknown"} correct={v.correctWeapon} delay={0.8} />
              </div>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">Reconstruction</p>
                <ol className="mt-4 space-y-4">
                  {sol.reconstruction.map((beat, i) => (
                    <motion.li
                      key={beat.time + i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 1 + i * 0.15 }}
                      className="flex gap-4"
                    >
                      <div className="w-20 shrink-0 font-mono text-xs uppercase tracking-widest text-[#D4AF37]">
                        {beat.time}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{beat.label}</p>
                        <p className="mt-1 text-sm leading-relaxed text-white/60">{beat.detail}</p>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + sol.reconstruction.length * 0.15 + 0.4, duration: 0.8 }}
                className="mt-10 text-center font-serif text-lg italic text-white/70"
              >
                "{sol.epilogue}"
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Chapter({ title, body, correct, delay }: { title: string; body: string; correct: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "rounded-xl border p-6 text-center",
        correct ? "border-emerald-400/40 bg-emerald-500/5" : "border-[#C62828]/40 bg-[#C62828]/5",
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/40">{title}</p>
      <p className="mt-3 font-display text-xl font-semibold text-white">{body}</p>
      <p className={cn(
        "mt-3 font-mono text-[10px] uppercase tracking-widest",
        correct ? "text-emerald-300" : "text-[#f8a4a4]",
      )}>
        {correct ? "Confirmed" : "Mistaken"}
      </p>
    </motion.div>
  );
}
