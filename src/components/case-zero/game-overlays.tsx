import { motion, AnimatePresence } from "@/components/case-zero/motion";
import { Award, Sparkles } from "lucide-react";
import { useUI } from "@/lib/ui-store";

export function GameOverlays() {
  const { xpFloaters, achievements } = useUI();
  return (
    <>
      {/* XP floaters */}
      <div className="pointer-events-none fixed inset-0 z-[60]">
        <AnimatePresence>
          {xpFloaters.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -60, scale: 1 }}
              exit={{ opacity: 0, y: -90 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ position: "absolute", left: f.x, top: f.y }}
              className="-translate-x-1/2 select-none"
            >
              <div className="flex items-center gap-1 rounded-full border border-accent/40 bg-background/80 px-3 py-1 font-mono text-sm font-bold text-accent shadow-glow backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />+{f.amount} XP
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Achievements */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
        <AnimatePresence>
          {achievements.map((a) => (
            <motion.div
              key={a.uid}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="pointer-events-auto flex items-center gap-3 rounded-xl border border-accent/40 bg-gradient-to-br from-surface to-background p-3 pr-4 shadow-glow backdrop-blur"
            >
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/40">
                <Award className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-widest text-accent">Achievement</p>
                <p className="text-sm font-semibold text-foreground">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
