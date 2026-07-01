import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { DetectiveOffice } from "@/components/case-zero/detective-office";
import { currentSeason } from "@/data/season";
import { todaysCase } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Detective Office — Case Zero" },
      { name: "description", content: "Step into your detective's office. Today's case is waiting on the desk." },
    ],
  }),
  component: Dashboard,
});

const EASE = [0.22, 1, 0.36, 1] as const;

function Dashboard() {
  const s = currentSeason;
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [entered, setEntered] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);

  // Small delay so the office "settles" before the folder arrives.
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), reduce ? 50 : 700);
    return () => clearTimeout(t);
  }, [reduce]);

  const onAcceptCase = () => {
    if (accepting) return;
    setAccepting(true);
    setTimeout(() => {
      navigate({ to: "/case/$caseId", params: { caseId: todaysCase.id } });
    }, reduce ? 200 : 1100);
  };

  return (
    <PageLayout withFooter={false}>
      <div className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-[#07090d]">
        {/* The persistent, evolving office */}
        <DetectiveOffice
          day={s.currentDay}
          totalDays={s.totalDays}
          folderArrived={entered}
          folderOpen={folderOpen}
          onFolderClick={() => setFolderOpen(true)}
          caseTitle={todaysCase.title}
          caseNumber={todaysCase.number}
          caseBlurb={todaysCase.blurb}
        />

        {/* Ambient HUD — timestamp only, kept minimal so it feels like a room, not a UI */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="pointer-events-none absolute left-6 top-6 z-30 font-mono text-[10px] uppercase tracking-[0.32em] text-foreground/60"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })} · {s.number} · Day {String(s.currentDay).padStart(2, "0")} / {s.totalDays}
          </div>
        </motion.div>

        {/* Case brief drawer — slides up from the folder when opened */}
        <AnimatePresence>
          {folderOpen && (
            <motion.div
              key="brief"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-10 sm:pb-14"
            >
              <div className="pointer-events-auto w-full max-w-xl rounded-2xl border border-border/60 bg-surface/85 p-6 shadow-2xl backdrop-blur-xl sm:p-7">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.32em] text-accent">
                  <span>{todaysCase.number} · Classified</span>
                  <span className="text-muted-foreground">Est. {todaysCase.estimatedMinutes} min</span>
                </div>
                <h2 className="mt-3 font-serif text-2xl font-light leading-tight text-foreground sm:text-3xl">
                  {todaysCase.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {todaysCase.blurb}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setFolderOpen(false)}
                    className="text-xs uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Close file
                  </button>
                  <motion.button
                    whileHover={reduce ? undefined : { scale: 1.02 }}
                    whileTap={reduce ? undefined : { scale: 0.97 }}
                    onClick={onAcceptCase}
                    disabled={accepting}
                    className={cn(
                      "group inline-flex items-center gap-2.5 rounded-md border border-primary/60 bg-gradient-to-b from-primary to-primary/80 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-glow transition-shadow",
                      "hover:shadow-[0_0_40px_-5px_rgb(198_40_40_/_0.6)]",
                      "disabled:cursor-wait disabled:opacity-90",
                    )}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    {accepting ? "Entering scene…" : "Accept Case"}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Departure flash — brief warm bloom before routing */}
        <AnimatePresence>
          {accepting && (
            <motion.div
              key="depart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-0 z-[60] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.25),rgba(7,9,13,0.95)_70%)]"
            />
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}

// Memoised prop stability handled inline; component is a leaf render.
export { Dashboard };
export const useOfficeDay = () => useMemo(() => currentSeason.currentDay, []);
