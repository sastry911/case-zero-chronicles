import { createFileRoute, Link } from "@tanstack/react-router";
import { Fingerprint, Mail, Lock, Github } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/case-zero/button";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Case Zero" },
      { name: "description", content: "Sign in to Case Zero to continue your investigation." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="dark relative grid min-h-screen bg-background text-foreground lg:grid-cols-2">
      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-hero lg:block">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
              <Fingerprint className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Case</span>
              <span className="text-sm font-semibold tracking-wider">ZERO</span>
            </span>
          </Link>

          <div className="max-w-md">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Case file · 0247</p>
            <blockquote className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight">
              "Three witnesses. Three stories. Only one of them is telling the truth — and the
              truth is what convicts."
            </blockquote>
            <p className="mt-4 text-sm text-muted-foreground">— Field notes, Detective A. Mercer</p>
          </div>

          <div className="text-xs text-muted-foreground">© 2026 Case Zero Studios</div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
              <Fingerprint className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold tracking-wider">CASE ZERO</span>
          </Link>

          <h1 className="text-3xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back, detective." : "Open a case file."}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to continue today's investigation."
              : "Create an account to start solving daily mysteries."}
          </p>

          <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field label="Email" icon={Mail} type="email" placeholder="detective@case-zero.app" />
            <Field
              label="Password"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              hint={mode === "signin" ? <a href="#" className="text-xs text-accent hover:underline">Forgot?</a> : undefined}
            />

            <Button className="w-full" size="lg">
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="bg-background px-3 text-xs uppercase tracking-widest text-muted-foreground">or</span></div>
            </div>

            <Button type="button" variant="secondary" className="w-full" size="lg">
              <Github className="h-4 w-4" /> Continue with GitHub
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to Case Zero? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-foreground hover:text-accent"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  hint,
  ...props
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {hint}
      </div>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          {...props}
          className="h-11 w-full rounded-md border border-input bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </label>
  );
}
