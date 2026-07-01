import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Send, CheckCircle2, MessageSquare, Building2 } from "lucide-react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Card } from "@/components/case-zero/card";
import { Button } from "@/components/case-zero/button";
import { Badge } from "@/components/case-zero/badge";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Case Zero" },
      { name: "description", content: "Get in touch with the Case Zero studio — press, partnerships, or feedback." },
      { property: "og:title", content: "Contact — Case Zero" },
      { property: "og:description", content: "Send a message to the Case Zero studio." },
    ],
  }),
  component: ContactPage,
});

const SUPPORT_EMAIL = "hello@case-zero.app";

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", topic: "General", message: "" });

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-accent">Contact</p>
          <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Send the studio a message.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Press, partnerships, bug reports, or a suspect you think we should investigate — we read every note.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Form */}
          <Card className="p-6 sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <CheckCircle2 className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-xl font-semibold">Message received.</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Thanks, {form.name || "detective"}. We'll reply to{" "}
                  <span className="text-foreground">{form.email || SUPPORT_EMAIL}</span> within a couple of days.
                </p>
                <Button
                  variant="secondary"
                  className="mt-6"
                  onClick={() => { setSent(false); setForm({ name: "", email: "", topic: "General", message: "" }); }}
                >
                  Send another
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                className="space-y-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Name" required>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-accent/60"
                    />
                  </Field>
                  <Field label="Email" required>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-accent/60"
                    />
                  </Field>
                </div>

                <Field label="Topic">
                  <select
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent/60"
                  >
                    <option>General</option>
                    <option>Press</option>
                    <option>Partnership</option>
                    <option>Bug report</option>
                    <option>Feedback</option>
                  </select>
                </Field>

                <Field label="Message" required>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what's on your mind..."
                    className="w-full resize-none rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-accent/60"
                  />
                </Field>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    We'll reply within 2 business days.
                  </p>
                  <Button type="submit" size="lg">
                    <Send className="h-4 w-4" /> Send message
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Side info */}
          <div className="space-y-4">
            <Card className="p-5">
              <Badge tone="accent"><Mail className="h-3 w-3" /> Email</Badge>
              <p className="mt-3 text-sm text-muted-foreground">Prefer email? Reach us directly at</p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-1 block break-all text-base font-semibold text-foreground hover:text-accent"
              >
                {SUPPORT_EMAIL}
              </a>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Placeholder address · not monitored
              </p>
            </Card>

            <Card className="p-5">
              <Badge tone="primary"><MessageSquare className="h-3 w-3" /> Bug reports</Badge>
              <p className="mt-3 text-sm text-muted-foreground">
                Found a broken clue or a case that wouldn't close? Choose "Bug report" as the topic and include
                the case number.
              </p>
            </Card>

            <Card className="p-5">
              <Badge tone="muted"><Building2 className="h-3 w-3" /> Studio</Badge>
              <p className="mt-3 text-sm text-muted-foreground">Case Zero Studios</p>
              <p className="text-sm text-foreground">Remote · Worldwide</p>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
        {required && <span className="text-primary">*</span>}
      </span>
      {children}
    </label>
  );
}
