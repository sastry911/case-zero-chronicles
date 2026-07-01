import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Fingerprint, Github, Twitter, Instagram, Info, Sparkles, X } from "lucide-react";
import { todaysCase } from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SOCIAL_LINKS: { icon: typeof Twitter; label: string; url: string | null }[] = [
  { icon: Twitter, label: "Twitter", url: null },
  { icon: Instagram, label: "Instagram", url: null },
  { icon: Github, label: "GitHub", url: null },
];

export function Footer() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
              <Fingerprint className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Case</span>
              <span className="text-sm font-semibold tracking-wider">ZERO</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            One murder, one chance. A new investigation every day at midnight.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Play</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/case/$caseId"
                  params={{ caseId: todaysCase.id }}
                  className="text-foreground/80 hover:text-foreground"
                >
                  Today's case
                </Link>
              </li>
              <li>
                <Link to="/files" className="text-foreground/80 hover:text-foreground">
                  Files
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-foreground/80 hover:text-foreground">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Company</h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => setAboutOpen(true)}
                  className="text-foreground/80 hover:text-foreground"
                >
                  About
                </button>
              </li>
              <li>
                <Link to="/contact" className="text-foreground/80 hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>


        <div className="flex flex-col items-start gap-4 lg:items-end">
          <TooltipProvider delayDuration={150}>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, label, url }) => {
                const disabled = !url;
                if (disabled) {
                  return (
                    <Tooltip key={label}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label={`${label} — coming soon`}
                          aria-disabled="true"
                          className="grid h-9 w-9 cursor-not-allowed place-items-center rounded-md border border-border text-muted-foreground/50 opacity-60"
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Coming soon
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-accent/50"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </TooltipProvider>
          <p className="text-xs text-muted-foreground">© 2026 Case Zero Studios. All rights reserved.</p>
        </div>
      </div>

      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
    </footer>
  );
}

function ComingSoonTextLink({ label }: { label: string }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center gap-1.5 text-muted-foreground/70"
          >
            {label}
            <span className="rounded-full border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-accent">
              Soon
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Coming soon
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AboutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border/70 bg-surface p-0">
        <div className="relative overflow-hidden rounded-t-lg border-b border-border/60 bg-gradient-to-br from-primary/15 via-surface to-background p-6">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
              <Info className="h-5 w-5" />
            </span>
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-2xl font-semibold tracking-tight">About Case Zero</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                A daily detective game with a monthly through-line.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="space-y-4 p-6 text-sm leading-relaxed text-foreground/90">
          <p className="text-muted-foreground">
            Case Zero is a browser-based detective experience. Every night at midnight a brand-new murder is
            posted to your desk. You have one shot to name the killer — and fifteen minutes if you want to
            stay on the leaderboard.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <AboutTile
              title="Daily investigations"
              body="One murder per day. Sift evidence, question suspects, close the case before the clock runs out."
            />
            <AboutTile
              title="Monthly Files"
              body="Thirty daily cases stitch into one seasonal File. A single mastermind hides behind them all."
            />
            <AboutTile
              title="Community rankings"
              body="Compare accuracy, solve time and streaks against detectives worldwide on the daily leaderboard."
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            You're currently investigating <span className="font-semibold text-foreground">FILE 001 — The Crimson Thread</span>.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AboutTile({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
