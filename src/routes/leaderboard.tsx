import { createFileRoute } from "@tanstack/react-router";
import { Crown, Flame, Medal, Search, Target, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { PageLayout } from "@/components/case-zero/page-layout";
import { Card } from "@/components/case-zero/card";
import { Badge } from "@/components/case-zero/badge";
import { leaderboard } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Case Zero" },
      { name: "description", content: "The world's top detectives, ranked by solved cases, accuracy, and streak." },
    ],
  }),
  component: Leaderboard,
});

const tabs = ["Global", "Friends", "This week"] as const;

function Leaderboard() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Global");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => leaderboard.filter((e) => e.handle.toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  const podium = leaderboard.slice(0, 3);
  const rest = filtered.filter((e) => e.rank > 3);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Hall of detectives</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Leaderboard</h1>
          <p className="max-w-xl text-muted-foreground">
            Top investigators across the globe. Rankings refresh hourly.
          </p>
        </div>

        {/* Podium */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {podium.map((p, i) => (
            <Card
              key={p.handle}
              gradient
              className={cn(
                "relative overflow-hidden",
                i === 0 && "sm:order-2 sm:-mt-4 ring-1 ring-accent/40",
                i === 1 && "sm:order-1",
                i === 2 && "sm:order-3",
              )}
            >
              <div className={cn(
                "absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full font-mono text-xs font-bold",
                i === 0 && "bg-accent text-accent-foreground",
                i === 1 && "bg-surface-elevated text-foreground",
                i === 2 && "bg-primary/20 text-primary",
              )}>
                {i === 0 ? <Crown className="h-4 w-4" /> : <Medal className="h-4 w-4" />}
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 font-mono text-sm font-semibold">
                {p.handle.slice(0, 2).toUpperCase()}
              </div>
              <div className="mt-4 font-mono text-sm text-muted-foreground">#{p.rank}</div>
              <div className="text-lg font-semibold tracking-tight">{p.handle}</div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border/60 pt-4 text-center">
                <div>
                  <div className="font-mono text-base font-semibold text-accent">{p.solved}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Solved</div>
                </div>
                <div>
                  <div className="font-mono text-base font-semibold text-accent">{p.streak}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Streak</div>
                </div>
                <div>
                  <div className="font-mono text-base font-semibold text-accent">{p.accuracy}%</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Acc.</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors",
                  tab === t ? "bg-surface-elevated text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search detective"
              className="h-10 w-full rounded-md border border-input bg-surface pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:border-accent/60 focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <Card className="mt-5 overflow-hidden p-0">
          <div className="grid grid-cols-[60px_minmax(0,1fr)_repeat(4,minmax(0,1fr))] items-center gap-3 border-b border-border/60 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>Rank</span>
            <span>Detective</span>
            <span className="hidden sm:block">Solved</span>
            <span className="hidden sm:block">Streak</span>
            <span className="text-right sm:text-left">XP</span>
            <span className="hidden text-right sm:block">Accuracy</span>
          </div>
          <ul>
            {rest.map((e) => {
              const isMe = e.handle === "case.zero";
              return (
                <li
                  key={e.handle}
                  className={cn(
                    "grid grid-cols-[60px_minmax(0,1fr)_repeat(4,minmax(0,1fr))] items-center gap-3 border-b border-border/40 px-5 py-3.5 text-sm last:border-0",
                    isMe && "bg-primary/5",
                  )}
                >
                  <span className="font-mono text-muted-foreground">#{e.rank}</span>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 font-mono text-[10px] font-semibold">
                      {e.handle.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate font-medium">{e.handle}</span>
                    {isMe && <Badge tone="accent">You</Badge>}
                  </div>
                  <span className="hidden font-mono sm:block">{e.solved}</span>
                  <span className="hidden font-mono sm:flex items-center gap-1"><Flame className="h-3 w-3 text-primary" />{e.streak}</span>
                  <span className="text-right font-mono text-accent sm:text-left">{e.xp.toLocaleString()}</span>
                  <span className="hidden text-right font-mono sm:block"><Target className="mr-1 inline h-3 w-3 text-muted-foreground" />{e.accuracy}%</span>
                </li>
              );
            })}
            {rest.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-muted-foreground">No detectives match "{q}".</li>
            )}
          </ul>
        </Card>
      </div>
    </PageLayout>
  );
}
