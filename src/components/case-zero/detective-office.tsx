import { useMemo } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * DetectiveOffice — persistent, evolving headquarters for Case Zero.
 *
 * Everything is pure CSS + inline SVG so it stays crisp at every viewport
 * and can be animated cheaply. The scene lives inside a 16:9 stage that
 * scales to fill the available screen; nothing here should feel like UI.
 */
export interface DetectiveOfficeProps {
  day: number;
  totalDays: number;
  folderArrived: boolean;
  folderOpen: boolean;
  onFolderClick: () => void;
  caseTitle: string;
  caseNumber: string;
  caseBlurb: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function DetectiveOffice(props: DetectiveOfficeProps) {
  const { day, totalDays, folderArrived, folderOpen, onFolderClick, caseTitle, caseNumber } = props;
  const reduce = useReducedMotion();

  // Obsession level 0..4 based on how deep into the File the player is.
  const obsession = useMemo(() => Math.min(4, Math.floor((day - 1) / Math.max(1, totalDays / 5))), [day, totalDays]);

  // Time-of-day → window sky. Player arrives in the morning by default but
  // window reflects real local time so returning at night feels different.
  const hour = new Date().getHours();
  const sky = skyFor(hour);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Deep ambient — the room beyond the frame */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,#1a130b_0%,#0a0a10_55%,#050608_100%)]" />
      {/* Film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")",
        }}
      />

      {/* Camera pull-in on mount */}
      <motion.div
        initial={{ scale: reduce ? 1 : 1.04, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
        className="relative flex h-full w-full items-center justify-center"
      >
        {/* 16:9 stage */}
        <div className="relative aspect-[16/9] max-h-full w-full max-w-[1600px] overflow-hidden">
          {/* Back wall */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#1c150c_0%,#120c07_45%,#0b0805_100%)]" />
          {/* Wall panelling shadow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(212,175,55,0.05),transparent_55%)]" />
          {/* Wall vignette */}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_260px_60px_rgba(0,0,0,0.9)]" />

          {/* --- Window (top-left) --- */}
          <Window sky={sky} hour={hour} />

          {/* --- Cork board (top-right) --- */}
          <CorkBoard obsession={obsession} />

          {/* --- Archive cabinet (right) --- */}
          <ArchiveCabinet />

          {/* --- Desk plane (foreground) --- */}
          <Desk />

          {/* Warm lamp light pooled on desk */}
          <div
            className="pointer-events-none absolute left-[6%] right-[10%] bottom-[6%] top-[38%] rounded-[50%] blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at 30% 55%, rgba(255,190,120,0.35) 0%, rgba(255,150,80,0.15) 25%, rgba(0,0,0,0) 60%)",
            }}
          />

          {/* --- Desk objects --- */}
          <Lamp reduce={!!reduce} />
          <Terminal />
          <FileTray obsession={obsession} />
          <CoffeeMugs obsession={obsession} reduce={!!reduce} />
          <NewspaperClippings obsession={obsession} />

          {/* --- Signature: today's case folder --- */}
          <CaseFolder
            arrived={folderArrived}
            open={folderOpen}
            onClick={onFolderClick}
            caseTitle={caseTitle}
            caseNumber={caseNumber}
            reduce={!!reduce}
          />

          {/* Front vignette / depth-of-field foreground */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- Sky palette based on real local hour ---------- */

function skyFor(hour: number) {
  // Dawn 5-7, Day 7-17, Dusk 17-20, Night 20-5
  if (hour >= 5 && hour < 7) return { from: "#ffb47a", to: "#3a2a4a", label: "Dawn" };
  if (hour >= 7 && hour < 17) return { from: "#b7c9db", to: "#3c5470", label: "Day" };
  if (hour >= 17 && hour < 20) return { from: "#f28b5b", to: "#2b1c34", label: "Dusk" };
  return { from: "#0f1a2e", to: "#050810", label: "Night" };
}

/* ---------- Window ---------- */

function Window({ sky, hour }: { sky: { from: string; to: string; label: string }; hour: number }) {
  const night = hour >= 20 || hour < 6;
  return (
    <div className="absolute left-[4%] top-[8%] h-[38%] w-[26%]">
      {/* Frame */}
      <div className="absolute inset-0 rounded-sm border-2 border-[#3a2a1c] bg-[#0a0a10] shadow-[0_0_60px_-10px_rgba(0,0,0,0.9)]">
        <div className="absolute inset-2 overflow-hidden rounded-[2px]">
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${sky.from}, ${sky.to})` }} />
          {/* Rain streaks */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen"
            style={{
              backgroundImage:
                "repeating-linear-gradient(105deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 5px)",
            }}
          />
          {/* Distant city lights at night */}
          {night && (
            <div className="absolute inset-x-0 bottom-3 flex h-6 items-end gap-[2px] px-2 opacity-80">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-sm"
                  style={{
                    height: `${20 + ((i * 37) % 60)}%`,
                    background: (i * 7) % 3 === 0 ? "#f9c26b" : "#2b3348",
                    boxShadow: (i * 7) % 3 === 0 ? "0 0 6px rgba(249,194,107,0.7)" : "none",
                  }}
                />
              ))}
            </div>
          )}
          {/* Muntins (window cross) */}
          <div className="absolute inset-0">
            <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-[#3a2a1c]" />
            <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-[#3a2a1c]" />
          </div>
        </div>
      </div>
      {/* Sill */}
      <div className="absolute -bottom-2 -left-2 -right-2 h-3 rounded-sm bg-[#2a1e13] shadow-[0_6px_16px_rgba(0,0,0,0.7)]" />
      {/* Cool spill of window light */}
      <div className="pointer-events-none absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(180,210,240,0.14),transparent_60%)] blur-2xl" />
    </div>
  );
}

/* ---------- Cork board with progressive clutter ---------- */

function CorkBoard({ obsession }: { obsession: number }) {
  // 0..4 → number of pinned items and strings
  const pins = 2 + obsession * 2; // 2..10
  const strings = obsession;      // 0..4

  const photos = useMemo(() => Array.from({ length: pins }).map((_, i) => ({
    id: i,
    left: 6 + ((i * 37) % 82),
    top: 8 + ((i * 53) % 72),
    rot: (((i * 17) % 20) - 10),
    kind: i % 3 === 0 ? "photo" : i % 3 === 1 ? "note" : "clipping",
  })), [pins]);

  return (
    <div className="absolute right-[4%] top-[6%] h-[42%] w-[36%]">
      {/* Frame */}
      <div className="absolute inset-0 rounded-[3px] border-[6px] border-[#2a1c10] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)]">
        {/* Cork texture */}
        <div
          className="absolute inset-0 rounded-[1px]"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #c89b5b 0%, #a67640 40%, #7a5028 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.6' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* Red strings behind pins */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {photos.slice(0, strings + 1).map((p, i) => {
            const next = photos[(i + 1) % Math.max(1, strings + 1)];
            if (!next || next === p) return null;
            return (
              <motion.line
                key={`s-${i}`}
                x1={p.left}
                y1={p.top}
                x2={next.left}
                y2={next.top}
                stroke="#b22222"
                strokeWidth="0.35"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 1.2, delay: 0.8 + i * 0.15, ease: EASE }}
              />
            );
          })}
        </svg>

        {/* Pinned items */}
        {photos.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: -8, rotate: p.rot + 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, rotate: p.rot, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 + i * 0.08, ease: EASE }}
            className="absolute"
            style={{ left: `${p.left}%`, top: `${p.top}%`, transform: `rotate(${p.rot}deg)` }}
          >
            <PinnedItem kind={p.kind as "photo" | "note" | "clipping"} seed={i} />
            <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#b22222] shadow-[0_0_4px_rgba(0,0,0,0.7)]" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PinnedItem({ kind, seed }: { kind: "photo" | "note" | "clipping"; seed: number }) {
  if (kind === "photo") {
    return (
      <div className="h-12 w-10 rounded-[2px] border border-[#eae2d0] bg-[#e8dfc9] p-[3px] shadow-md sm:h-16 sm:w-14">
        <div className="h-full w-full bg-[linear-gradient(135deg,#2a2a34,#141420)]">
          <div className="mx-auto mt-2 h-4 w-4 rounded-full bg-[#3a3a48] sm:h-6 sm:w-6" />
          <div className="mx-auto mt-1 h-1 w-6 rounded-sm bg-[#3a3a48]/70 sm:w-8" />
        </div>
      </div>
    );
  }
  if (kind === "note") {
    return (
      <div className="w-12 rounded-[2px] bg-[#f4e6a1] p-1 font-mono text-[7px] leading-tight text-[#3a2a10] shadow-md sm:w-16 sm:text-[9px]">
        {seed % 2 === 0 ? "check alibi 23:47" : "why the fibre?"}
      </div>
    );
  }
  return (
    <div className="w-14 rounded-[2px] bg-[#efe6d2] p-1 shadow-md sm:w-20">
      <div className="h-1 w-3/4 bg-[#2a2a34]" />
      <div className="mt-[3px] space-y-[2px]">
        <div className="h-[2px] w-full bg-[#3a3a44]/70" />
        <div className="h-[2px] w-5/6 bg-[#3a3a44]/60" />
        <div className="h-[2px] w-4/6 bg-[#3a3a44]/60" />
      </div>
    </div>
  );
}

/* ---------- Archive cabinet ---------- */

function ArchiveCabinet() {
  return (
    <div className="absolute bottom-[8%] right-[2%] h-[54%] w-[16%]">
      <div className="relative h-full w-full rounded-[2px] bg-[linear-gradient(180deg,#1e1912_0%,#120e08_100%)] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.9)]">
        {/* Top ledge */}
        <div className="absolute -top-1 left-0 right-0 h-2 rounded-sm bg-[#241c11]" />
        {/* Drawers */}
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="absolute inset-x-2 border-b border-[#080604]" style={{ top: `${6 + i * 23}%`, height: "20%" }}>
            <div className="flex h-full items-center justify-center">
              <div className="h-1 w-6 rounded-sm bg-[#8a6a3a] shadow-[0_1px_0_rgba(0,0,0,0.7)]" />
            </div>
            <div className="absolute left-2 top-2 font-mono text-[7px] uppercase tracking-widest text-[#8a6a3a]/70">
              F00{i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Desk ---------- */

function Desk() {
  return (
    <>
      {/* Desk top */}
      <div
        className="absolute inset-x-0 bottom-0 h-[46%]"
        style={{
          background:
            "linear-gradient(180deg,#3a2814 0%,#2a1c0d 30%,#1a1108 100%)",
          boxShadow: "inset 0 20px 40px -20px rgba(0,0,0,0.9), inset 0 -30px 40px -20px rgba(0,0,0,0.8)",
        }}
      />
      {/* Wood grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='120'><filter id='g'><feTurbulence type='turbulence' baseFrequency='0.02 0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>\")",
        }}
      />
      {/* Desk front edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[45.5%] h-px bg-[#a06a2e]/40" />
    </>
  );
}

/* ---------- Lamp ---------- */

function Lamp({ reduce }: { reduce: boolean }) {
  return (
    <div className="absolute bottom-[36%] left-[6%] w-[10%]">
      {/* Base */}
      <div className="absolute -bottom-4 left-1/2 h-3 w-14 -translate-x-1/2 rounded-full bg-[#0f0a05] shadow-[0_4px_10px_rgba(0,0,0,0.7)]" />
      {/* Pole */}
      <div className="absolute -bottom-3 left-1/2 h-24 w-[3px] -translate-x-1/2 bg-[#2a1c10]" />
      {/* Shade */}
      <div className="absolute -top-6 left-1/2 h-10 w-16 -translate-x-1/2">
        <div className="absolute inset-x-0 top-0 h-full rounded-b-[40%] bg-[linear-gradient(180deg,#3a2510,#1a1006)] shadow-[inset_0_-6px_10px_rgba(0,0,0,0.7)]" />
        {/* Bulb glow */}
        <motion.div
          animate={reduce ? undefined : { opacity: [0.85, 1, 0.9, 1], scale: [1, 1.02, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-x-2 bottom-1 h-2 rounded-full bg-[#ffd58a] blur-[2px]"
        />
      </div>
      {/* Warm spill directly under shade */}
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,180,90,0.5),transparent_60%)] blur-2xl" />
    </div>
  );
}

/* ---------- CRT terminal ---------- */

function Terminal() {
  return (
    <div className="absolute bottom-[30%] left-[22%] w-[14%]">
      {/* Stand */}
      <div className="absolute -bottom-3 left-1/2 h-2 w-16 -translate-x-1/2 rounded-sm bg-[#0f0a05]" />
      {/* Body */}
      <div className="relative h-24 w-full rounded-[6px] bg-[#151212] p-1.5 shadow-[0_10px_20px_rgba(0,0,0,0.7)]">
        <div className="relative h-full w-full overflow-hidden rounded-[3px] bg-[#020604]">
          {/* Scanlines */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,255,120,0.08) 0 1px, transparent 1px 3px)" }}
          />
          <div className="relative p-1.5 font-mono text-[7px] leading-tight text-[#7dffb0]">
            <p>&gt; case_zero// active</p>
            <p>&gt; awaiting brief_</p>
            <motion.p
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="mt-1"
            >
              _
            </motion.p>
          </div>
          {/* CRT glow */}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(0,255,120,0.15)]" />
        </div>
      </div>
    </div>
  );
}

/* ---------- File tray ---------- */

function FileTray({ obsession }: { obsession: number }) {
  const papers = 1 + obsession; // 1..5
  return (
    <div className="absolute bottom-[8%] right-[22%] w-[14%]">
      {/* Wire frame */}
      <div className="relative h-10 w-full rounded-sm border border-[#2a2018] bg-[#1a1108]/50 shadow-[0_6px_14px_rgba(0,0,0,0.7)]">
        {Array.from({ length: papers }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-x-2 rounded-[1px] bg-[#efe6d2] shadow-sm"
            style={{
              top: `${4 + i * 4}px`,
              height: "6px",
              transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (0.5 + i * 0.3)}deg)`,
              opacity: 0.9 - i * 0.08,
            }}
          />
        ))}
        <div className="absolute -bottom-1 left-2 h-1.5 w-6 rounded-sm bg-[#0f0a05]" />
        <div className="absolute -bottom-1 right-2 h-1.5 w-6 rounded-sm bg-[#0f0a05]" />
      </div>
      <div className="mt-1 text-center font-mono text-[7px] uppercase tracking-[0.28em] text-foreground/40">In tray</div>
    </div>
  );
}

/* ---------- Coffee mugs ---------- */

function CoffeeMugs({ obsession, reduce }: { obsession: number; reduce: boolean }) {
  const count = 1 + obsession; // 1..5
  return (
    <div className="absolute bottom-[16%] left-[40%] flex items-end gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative">
          <div className="h-9 w-8 rounded-b-md rounded-t-sm bg-[linear-gradient(180deg,#eae2d0,#a89a80)] shadow-[0_6px_10px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-x-1 top-1 h-1 rounded-full bg-[#3a1e0a]" />
          </div>
          <div className="absolute -right-1 top-2 h-4 w-2 rounded-r-full border-2 border-[#a89a80] border-l-transparent" />
          {i === 0 && !reduce && (
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-0 h-6 w-4 -translate-x-1/2 -translate-y-full rounded-full bg-white/20 blur-md"
              animate={{ y: [-4, -14, -4], opacity: [0.2, 0.4, 0.15], scaleY: [1, 1.3, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------- Newspaper clippings on desk ---------- */

function NewspaperClippings({ obsession }: { obsession: number }) {
  if (obsession < 2) return null;
  const clippings = Math.min(4, obsession); // 2..4
  return (
    <div className="pointer-events-none absolute inset-x-[26%] bottom-[8%] h-[10%]">
      {Array.from({ length: clippings }).map((_, i) => (
        <div
          key={i}
          className="absolute h-14 w-24 rounded-[2px] bg-[#e8dfc9] p-1 shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
          style={{
            left: `${(i * 22) % 80}%`,
            bottom: `${(i * 6) % 20}px`,
            transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (2 + i * 2)}deg)`,
          }}
        >
          <div className="h-1 w-3/4 bg-[#1a1108]" />
          <div className="mt-1 h-6 w-full bg-[#2a2018]/60" />
          <div className="mt-1 h-[2px] w-5/6 bg-[#1a1108]/60" />
          <div className="mt-[2px] h-[2px] w-4/6 bg-[#1a1108]/60" />
        </div>
      ))}
    </div>
  );
}

/* ---------- The signature: today's case folder ---------- */

function CaseFolder({
  arrived,
  open,
  onClick,
  caseTitle,
  caseNumber,
  reduce,
}: {
  arrived: boolean;
  open: boolean;
  onClick: () => void;
  caseTitle: string;
  caseNumber: string;
  reduce: boolean;
}) {
  return (
    <div className="absolute bottom-[8%] left-1/2 z-20 -translate-x-1/2" style={{ perspective: "1400px" }}>
      <motion.button
        type="button"
        aria-label={`Open ${caseNumber}: ${caseTitle}`}
        onClick={onClick}
        disabled={open}
        initial={reduce ? { opacity: 0 } : { x: -420, y: -220, rotate: -18, opacity: 0 }}
        animate={arrived ? (reduce ? { opacity: 1 } : { x: 0, y: 0, rotate: -2, opacity: 1 }) : {}}
        transition={{ duration: reduce ? 0.3 : 1.05, ease: EASE, delay: 0.1 }}
        whileHover={open || reduce ? undefined : { y: -6, rotate: -1.2, scale: 1.02 }}
        className="group relative block h-[210px] w-[300px] cursor-pointer sm:h-[240px] sm:w-[360px]"
      >
        {/* Soft cast shadow on desk */}
        <div className="absolute -bottom-2 left-4 right-4 h-4 rounded-[50%] bg-black/60 blur-md" />

        {/* Folder body (papers visible when open) */}
        <div
          className="absolute inset-0 rounded-[3px] border border-[#3a2c18] bg-[linear-gradient(180deg,#3a2c18_0%,#241a0b_100%)] shadow-[0_12px_30px_rgba(0,0,0,0.7)]"
        >
          {/* Papers */}
          <div className="absolute inset-3 rounded-[2px] bg-[#efe6d2] p-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-[#7a3b1a]">Homicide Bureau</div>
            <div className="mt-1 h-px bg-[#1a1108]/40" />
            <div className="mt-2 font-mono text-[8px] uppercase tracking-widest text-[#1a1108]/70">{caseNumber}</div>
            <div className="mt-1 font-serif text-lg leading-tight text-[#1a1108]">{caseTitle}</div>
            <div className="mt-3 space-y-[3px]">
              <div className="h-[2px] w-5/6 bg-[#1a1108]/50" />
              <div className="h-[2px] w-4/6 bg-[#1a1108]/40" />
              <div className="h-[2px] w-3/4 bg-[#1a1108]/45" />
              <div className="h-[2px] w-2/3 bg-[#1a1108]/35" />
            </div>
          </div>
        </div>

        {/* CONFIDENTIAL stamp — punches down after arrival */}
        <AnimatePresence>
          {arrived && (
            <motion.div
              key="stamp"
              initial={{ opacity: 0, scale: 1.9, rotate: -18 }}
              animate={{ opacity: 1, scale: 1, rotate: -12 }}
              transition={{ duration: 0.4, delay: reduce ? 0 : 0.55, ease: [0.8, 0, 0.4, 1] }}
              className="pointer-events-none absolute bottom-6 right-6 z-10 border-[3px] border-[#b22222] px-3 py-1 font-mono text-[11px] font-black uppercase tracking-[0.32em] text-[#b22222]"
              style={{ mixBlendMode: "multiply", filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.3))" }}
            >
              Classified
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cover flap — closed by default, rotates open on click */}
        <motion.div
          initial={false}
          animate={open ? { rotateX: -158 } : { rotateX: 0 }}
          transition={{ duration: reduce ? 0.2 : 1, ease: [0.65, 0.05, 0.36, 1] }}
          className="absolute inset-0 origin-top rounded-[3px] border border-[#4a3a20] bg-[linear-gradient(180deg,#4a3a20_0%,#2a1e0e_100%)] shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
          style={{ transformOrigin: "top center", backfaceVisibility: "hidden" }}
        >
          {/* Front tab */}
          <div className="absolute -top-3 left-6 h-3 w-16 rounded-t-sm bg-[#4a3a20]" />
          {/* Wood grain overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><filter id='g'><feTurbulence type='turbulence' baseFrequency='0.02 0.5' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>\")",
            }}
          />
          {/* Cover label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#d4af37]">Case File</div>
            <div className="mt-2 font-serif text-xl font-light tracking-wide text-foreground">{caseTitle}</div>
            <div className="mt-2 h-px w-12 bg-[#b22222]" />
            <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/60">{caseNumber}</div>
          </div>
        </motion.div>

        {/* Hover invitation */}
        <div className={cn(
          "pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.4em] text-accent transition-opacity",
          open ? "opacity-0" : "opacity-0 group-hover:opacity-100",
        )}>
          Open file
        </div>
      </motion.button>
    </div>
  );
}
