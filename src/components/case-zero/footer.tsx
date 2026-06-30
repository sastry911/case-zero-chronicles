import { Link } from "@tanstack/react-router";
import { Fingerprint, Github, Twitter, Instagram } from "lucide-react";

export function Footer() {
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
              <li><Link to="/dashboard" className="text-foreground/80 hover:text-foreground">Today's case</Link></li>
              <li><Link to="/leaderboard" className="text-foreground/80 hover:text-foreground">Leaderboard</Link></li>
              <li><Link to="/profile" className="text-foreground/80 hover:text-foreground">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Studio</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-foreground/80 hover:text-foreground">About</a></li>
              <li><a href="#" className="text-foreground/80 hover:text-foreground">Press kit</a></li>
              <li><a href="#" className="text-foreground/80 hover:text-foreground">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 lg:items-end">
          <div className="flex items-center gap-2">
            <a href="#" aria-label="Twitter" className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-accent/50">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-accent/50">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="GitHub" className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-accent/50">
              <Github className="h-4 w-4" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Case Zero Studios. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
