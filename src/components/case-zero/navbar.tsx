import { Link, useRouterState } from "@tanstack/react-router";
import { Fingerprint, LayoutDashboard, Layers, Archive, UserRound, Menu, X, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ui, useUI } from "@/lib/ui-store";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/season", label: "Season", icon: Layers },
  { to: "/archive", label: "Archive", icon: Archive },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { soundOn } = useUI();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30 transition-colors group-hover:bg-primary/25">
            <Fingerprint className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Case</span>
            <span className="text-sm font-semibold tracking-wider text-foreground">ZERO</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-surface text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface/60",
                )}
              >
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={() => ui.toggleSound()}
            aria-label={soundOn ? "Mute sound" : "Enable sound"}
            aria-pressed={soundOn}
            className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <Link
            to="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
          >
            Open file
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden grid h-9 w-9 place-items-center rounded-md text-foreground hover:bg-surface"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {links.map((l) => {
              const Icon = l.icon;
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                    active ? "bg-surface text-foreground" : "text-muted-foreground hover:bg-surface/60",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
            <div className="mt-2 flex items-center gap-2 border-t border-border/60 pt-3">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-md border border-border px-3 py-2 text-center text-sm">
                Sign in
              </Link>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="flex-1 rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground">
                Open file
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
