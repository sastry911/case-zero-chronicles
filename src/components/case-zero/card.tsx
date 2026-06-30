import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  className,
  children,
  interactive,
  gradient,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean; gradient?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-surface p-6 shadow-elevated",
        gradient && "bg-card-gradient",
        interactive && "transition-all hover:-translate-y-0.5 hover:border-accent/40",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-4 flex items-start justify-between gap-3", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-lg font-semibold tracking-tight text-foreground", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}
