import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow",
  secondary:
    "bg-surface text-foreground border border-border hover:border-accent/40 hover:bg-surface/80",
  ghost:
    "text-foreground hover:bg-surface",
  accent:
    "bg-accent text-accent-foreground hover:brightness-105",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

type AnyLinkProps = React.ComponentProps<typeof Link>;
export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: BaseProps & AnyLinkProps) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...(props as AnyLinkProps)}>
      {children}
    </Link>
  );
}
