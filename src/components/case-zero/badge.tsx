import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "default" | "primary" | "accent" | "success" | "warning" | "danger" | "muted";

const tones: Record<Tone, string> = {
  default: "bg-surface text-foreground border-border",
  primary: "bg-primary/15 text-primary border-primary/30",
  accent: "bg-accent/15 text-accent border-accent/30",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  danger: "bg-red-500/15 text-red-300 border-red-500/30",
  muted: "bg-muted/40 text-muted-foreground border-border",
};

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DifficultyStars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-accent" aria-label={`Difficulty ${value} of ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < value ? "text-accent" : "text-muted/40"}>★</span>
      ))}
    </span>
  );
}
