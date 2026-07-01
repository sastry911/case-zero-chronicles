import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CloudRain,
  Clock,
  FileWarning,
  Fingerprint,
  Hash,
  MapPin,
  Radio,
  Shield,
  Skull,
  Sparkles,
  Thermometer,
} from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { currentSeason } from "@/data/season";
import { todaysCase } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Morning Briefing — Case Zero" },
      { name: "description", content: "Your incoming investigation, delivered." },
    ],
  }),
  component: Dashboard,
});

const VICTIM = "Emily Carter, 34 — architect";
const SCENE = "Platform 7, Hyderabad Metro";
const CRIME_TIME = "23:47, last night";
const DISPATCH_REF = "HYD-DIS-08812-A";

const EASE = [0.22, 1, 0.36, 1] as const;

function Dashboard() {
  const s = currentSeason;
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [accepting, setAccepting] = useState(false);
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), reduce ? 200 : 1800);
    return () => clearTimeout(t);
  }, [reduce]);

  const onAccept = () => {
    if (accepting) return;
    setAccepting(true);
    setTimeout(() => {
      navigate({ to: "/case/$caseId", params: { caseId: todaysCase.id } });
    }, reduce ? 250 : 1500);
  };

  return (
    <PageLayout>
      <AnimatePresence>{splash && <DispatchSplash key="splash" />}</AnimatePresence>

      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-grid opacity-[0.18] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
          <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
          <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={splash ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE, staggerChildren: 0.09, delayChildren: 0.05 }}
          className="relative mx-auto max-w-5xl px-4 pb-24 pt-14 sm:px-6 lg:px-8"
        >
          {/* Timestamp header */}
          <Reveal className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span>08:00 AM · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</span>
            <span className="h-px flex-1 bg-border/60" />
            <span className="text-accent">Priority · Homicide</span>
          </Reveal>

          {/* Briefing title */}
          <Reveal as="h1" className="mt-6 text-balance font-serif text-4xl font-light leading-[1] tracking-tight text-foreground sm:text-6xl">
            Morning Briefing
          </Reveal>
          <Reveal as="p" className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Coffee's on the desk. A file just landed on top of it. What's inside will occupy your day.
          </Reveal>

          {/* File label */}
          <Reveal className="mt-10 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-border/50 pt-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent">{s.number}</span>
            <span className="text-lg font-semibold uppercase tracking-[0.2em] text-foreground sm:text-xl">
              {s.title}
            </span>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Day {String(s.currentDay).padStart(2, "0")} of {s.totalDays}
            </span>
          </Reveal>

          {/* Incoming investigation — arrives like a file dropped on the desk */}
          <motion.section
            initial={{ opacity: 0, y: 40, rotate: -1.2, scale: 0.98 }}
            animate={splash ? {} : { opacity: 1, y: 0, rotate: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
            className="mt-8 overflow-hidden rounded-2xl border border-border/70 bg-surface/80 shadow-2xl backdrop-blur"
          >
            {/* Header strip */}
            <div className="flex items-center justify-between border-b border-border/60 bg-background/60 px-5 py-3">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
                <Radio className="h-3 w-3 animate-pulse" />
                Incoming Investigation
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Classified · Eyes only
              </div>
            </div>

            {/* Case brief */}
            <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1.3fr_1fr]">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Case</p>
                <h2 className="mt-2 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  The Last Train
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  {todaysCase.blurb}
                </p>

                <motion.button
                  whileHover={reduce ? undefined : { scale: 1.02 }}
                  whileTap={reduce ? undefined : { scale: 0.98 }}
                  onClick={onAccept}
                  disabled={accepting}
                  className={cn(
                    "group mt-8 inline-flex items-center gap-3 rounded-md border border-primary/60 bg-gradient-to-b from-primary to-primary/80 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.24em] text-white shadow-glow transition-shadow",
                    "hover:brightness-110 hover:shadow-[0_0_40px_-5px_rgb(198_40_40_/_0.6)]",
                    "disabled:cursor-wait disabled:opacity-90",
                  )}
                >
                  <Shield className="h-4 w-4" />
                  {accepting ? "Opening file…" : "Accept Case"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Signature required · Chain of custody begins on accept
                </p>
              </div>

              <dl className="grid grid-cols-1 gap-y-5 border-l border-border/50 pl-6">
                <BriefRow icon={MapPin} label="Location" value={SCENE} />
                <BriefRow icon={Skull} label="Victim" value={VICTIM} />
                <BriefRow icon={Clock} label="Time of incident" value={CRIME_TIME} />
                <BriefRow icon={Shield} label="Lead detective" value="You" accent />
                <BriefRow icon={Fingerprint} label="Est. investigation" value="~15 minutes" />
              </dl>
            </div>
          </motion.section>

          {/* Ambient footer info */}
          <motion.section
            initial="hidden"
            animate={splash ? "hidden" : "shown"}
            variants={{ shown: { transition: { staggerChildren: 0.1, delayChildren: 0.9 } } }}
            className="mt-6 grid gap-4 md:grid-cols-3"
          >
            <InfoCard icon={CloudRain} label="Weather at scene">
              <p className="text-sm font-semibold text-foreground">Overcast · 24°C</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Light rain since 22:00. Platform CCTV partially obscured by condensation.
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <Thermometer className="h-3 w-3" /> Feels like 22°
              </p>
            </InfoCard>

            <InfoCard icon={Hash} label="Dispatch reference">
              <p className="font-mono text-sm font-semibold tracking-wider text-accent">{DISPATCH_REF}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Logged by Sgt. R. Menon, 05:12 AM. Forwarded to your desk under Homicide, Bureau 4.
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Status · Open
              </p>
            </InfoCard>

            <InfoCard icon={FileWarning} label="Incident report">
              <p className="text-xs leading-relaxed text-foreground/90">
                A body has been discovered inside Platform 7 of Hyderabad Metro. The victim has been identified.
                No suspect has been arrested. Lead detective assigned: <span className="font-semibold text-accent">You</span>.
              </p>
            </InfoCard>
          </motion.section>

          {/* Subtle file context */}
          <Reveal as="p" className="mt-10 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-accent" />
            One clue tonight will bind this case to the next
          </Reveal>
        </motion.div>

        {/* Folder opening overlay */}
        <AnimatePresence>{accepting && <FolderOpenOverlay key="folder" />}</AnimatePresence>
      </div>
    </PageLayout>
  );
}

/* ---------- Pieces ---------- */

function Reveal({
  as: Tag = "div",
  className,
  children,
}: {
  as?: "div" | "p" | "h1" | "span";
  className?: string;
  children: React.ReactNode;
}) {
  const MotionTag = motion[Tag] as typeof motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

function BriefRow({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, x: -8 }, shown: { opacity: 1, x: 0 } }}
      className="min-w-0"
    >
      <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </dt>
      <dd className={cn("mt-1.5 text-sm font-semibold", accent ? "text-accent" : "text-foreground")}>
        {value}
      </dd>
    </motion.div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, shown: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.6, ease: EASE }}
      className="rounded-xl border border-border/60 bg-surface/60 p-5 backdrop-blur"
    >
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        <Icon className="h-3 w-3 text-accent" /> {label}
      </div>
      <div className="mt-3">{children}</div>
    </motion.div>
  );
}

/* ---------- Dispatch splash ---------- */

function DispatchSplash() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-background"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-[0.15]" />
        <div className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[140px]" />
      </div>

      <div className="relative flex flex-col items-center gap-6 text-center">
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.5em" }}
          transition={{ duration: 1.1, ease: EASE }}
          className="font-mono text-[11px] uppercase text-accent"
        >
          Case Zero · Homicide Bureau
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground"
        >
          <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Establishing secure line…
        </motion.div>

        <div className="mt-2 h-px w-56 overflow-hidden bg-border/50">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.4, ease: "easeInOut", delay: 0.15 }}
            style={{ transformOrigin: "left" }}
            className="h-full bg-gradient-to-r from-primary via-accent to-primary"
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Folder-opening transition ---------- */

function FolderOpenOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md"
    >
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
      </div>

      {/* Folder */}
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative"
        style={{ perspective: "1400px" }}
      >
        <div className="relative h-[380px] w-[300px] sm:h-[440px] sm:w-[360px]">
          {/* Manila body */}
          <div className="absolute inset-0 rounded-md border border-border/70 bg-gradient-to-br from-[#3a3226] via-[#2b2419] to-[#1c1811] shadow-2xl">
            <div className="absolute inset-x-6 top-6 space-y-2 opacity-90">
              <div className="h-2 w-3/4 rounded bg-foreground/70" />
              <div className="h-2 w-1/2 rounded bg-foreground/40" />
              <div className="mt-6 h-24 rounded bg-foreground/10 border border-foreground/10" />
              <div className="mt-3 h-2 w-2/3 rounded bg-foreground/30" />
              <div className="h-2 w-1/2 rounded bg-foreground/20" />
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 -rotate-6 border-2 border-primary px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
              Classified
            </div>
          </div>

          {/* Cover flap — opens upward */}
          <motion.div
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -165 }}
            transition={{ duration: 0.95, ease: [0.65, 0.05, 0.36, 1], delay: 0.35 }}
            className="absolute inset-0 origin-top rounded-md border border-border/70 bg-gradient-to-br from-[#4a3f2e] via-[#382e21] to-[#26201700] shadow-2xl"
            style={{ transformOrigin: "top center", backfaceVisibility: "hidden" }}
          >
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent">Case File</div>
              <div className="font-serif text-2xl font-light tracking-wide text-foreground">The Last Train</div>
              <div className="mt-2 h-px w-16 bg-primary/60" />
              <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground">
                {DISPATCH_REF}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary animate-pulse">
            Opening classified file…
          </p>
          <div className="mx-auto mt-3 h-px w-40 overflow-hidden bg-border/50">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.3, ease: "linear" }}
              style={{ transformOrigin: "left" }}
              className="h-full bg-gradient-to-r from-primary via-accent to-primary"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
