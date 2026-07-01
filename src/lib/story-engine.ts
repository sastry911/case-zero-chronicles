/**
 * Story Engine — runtime state for FILE 001.
 *
 * Owns what the player has actually done across the file:
 *  - which cases are archived (with verdict metadata)
 *  - which recurring clues have surfaced
 *  - which mid-season events have played
 *  - the conspiracy board projection (photos + red-string connections)
 *
 * Persists to localStorage. Exposes a `useStory()` hook and a
 * `useLiveSeason()` hook that produces a Season-shaped object for the
 * existing UI to consume without any layout changes.
 */

import { useCallback, useSyncExternalStore } from "react";
import {
  FILE_001,
  getCasePlan,
  getCharacter,
  getRecurringClue,
  type CasePlan,
  type CauseOfDeath,
  type MidSeasonEvent,
  type RecurringClue,
  type ReturningCharacter,
} from "@/data/story";
import type { ArchivedCase, MasterminStatus, Season, SharedClue } from "@/data/season";

const STORAGE_KEY = "case-zero:story:v1";

export interface ArchivedRecord {
  caseId: string;
  day: number;
  title: string;
  victim: string;
  location: string;
  causeOfDeath: CauseOfDeath;
  solved: boolean;
  verdictName: string;
  timeTakenMinutes: number;
  archivedAt: number;
  recurringClueId: string;
}

export interface BoardPin {
  id: string;
  kind: "victim" | "clue" | "character";
  label: string;
  sublabel?: string;
  day?: number;
  symbol?: string;
}

export interface BoardConnection {
  from: string;
  to: string;
  reason: string;
}

interface StoryState {
  archived: Record<string, ArchivedRecord>;
  revealedClueIds: string[];
  clueAppearances: Record<string, number>;
  seenEventIds: string[];
}

const emptyState = (): StoryState => ({
  archived: {},
  revealedClueIds: [],
  clueAppearances: {},
  seenEventIds: [],
});

function load(): StoryState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<StoryState>;
    return {
      archived: parsed.archived ?? {},
      revealedClueIds: parsed.revealedClueIds ?? [],
      clueAppearances: parsed.clueAppearances ?? {},
      seenEventIds: parsed.seenEventIds ?? [],
    };
  } catch {
    return emptyState();
  }
}

class StoryStore {
  private state: StoryState = load();
  private listeners = new Set<() => void>();

  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  getSnapshot = () => this.state;

  private persist() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      /* quota */
    }
  }

  private emit() {
    this.state = { ...this.state };
    this.persist();
    this.listeners.forEach((l) => l());
  }

  /** Archive a case and reveal its recurring clue. Idempotent per caseId. */
  archiveCase(input: {
    caseId: string;
    solved: boolean;
    verdictName: string;
    timeTakenMinutes?: number;
  }): ArchivedRecord | null {
    const plan = getCasePlan(input.caseId);
    if (!plan) return null;
    if (this.state.archived[input.caseId]) return this.state.archived[input.caseId];

    const record: ArchivedRecord = {
      caseId: plan.id,
      day: plan.day,
      title: plan.title,
      victim: plan.victim,
      location: plan.location,
      causeOfDeath: plan.causeOfDeath,
      solved: input.solved,
      verdictName: input.verdictName,
      timeTakenMinutes: input.timeTakenMinutes ?? 15,
      archivedAt: Date.now(),
      recurringClueId: plan.recurringClueId,
    };

    this.state.archived = { ...this.state.archived, [plan.id]: record };
    this.revealClueInternal(plan.recurringClueId);
    this.emit();
    return record;
  }

  private revealClueInternal(clueId: string) {
    const appearances = { ...this.state.clueAppearances };
    appearances[clueId] = (appearances[clueId] ?? 0) + 1;
    this.state.clueAppearances = appearances;
    if (!this.state.revealedClueIds.includes(clueId)) {
      this.state.revealedClueIds = [...this.state.revealedClueIds, clueId];
    }
  }

  markEventSeen(id: string) {
    if (this.state.seenEventIds.includes(id)) return;
    this.state.seenEventIds = [...this.state.seenEventIds, id];
    this.emit();
  }

  reset() {
    this.state = emptyState();
    this.persist();
    this.listeners.forEach((l) => l());
  }
}

export const storyStore = new StoryStore();

/* --------------------------------------------------------------
   Selectors
   -------------------------------------------------------------- */

function currentDay(archived: Record<string, ArchivedRecord>): number {
  // Player is always "on" the day of the next un-archived case.
  const solvedDays = Object.values(archived).map((r) => r.day);
  const maxSolved = solvedDays.length ? Math.max(...solvedDays) : 0;
  return Math.min(FILE_001.totalDays, maxSolved + 1);
}

function projectSeason(state: StoryState): Season {
  const day = currentDay(state.archived);

  const cases: ArchivedCase[] = FILE_001.cases.map((plan) => {
    const rec = state.archived[plan.id];
    if (rec) {
      return {
        id: plan.id,
        number: plan.number,
        title: plan.title,
        day: plan.day,
        status: rec.solved ? "solved" : "failed",
        difficulty: plan.difficulty,
        closedAt: new Date(rec.archivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        verdict: rec.verdictName,
        recurringClueId: rec.recurringClueId,
      };
    }
    if (plan.day < day) {
      return {
        id: plan.id,
        number: plan.number,
        title: "Unrecorded",
        day: plan.day,
        status: "failed",
        difficulty: plan.difficulty,
      };
    }
    if (plan.day === day) {
      return {
        id: plan.id,
        number: plan.number,
        title: plan.title,
        day: plan.day,
        status: "active",
        difficulty: plan.difficulty,
        recurringClueId: plan.recurringClueId,
      };
    }
    return {
      id: plan.id,
      number: plan.number,
      title: "Sealed",
      day: plan.day,
      status: "locked",
      difficulty: plan.difficulty,
    };
  });

  const sharedClues: SharedClue[] = state.revealedClueIds.map((id) => {
    const clue = getRecurringClue(id)!;
    // First case (chronologically) that surfaced this clue.
    const origin = Object.values(state.archived)
      .filter((r) => r.recurringClueId === id)
      .sort((a, b) => a.day - b.day)[0];
    return {
      id: clue.id,
      symbol: clue.symbol,
      name: clue.name,
      hint: clue.hint,
      foundOnDay: origin?.day ?? 0,
      originCaseId: origin?.caseId ?? null,
      appearances: state.clueAppearances[id] ?? 1,
    };
  });

  // Hidden connections = pairs of archived cases sharing a motif.
  const archivedList = Object.values(state.archived);
  let hiddenConnections = 0;
  const seenPairs = new Set<string>();
  for (const a of archivedList) {
    for (const b of archivedList) {
      if (a.caseId === b.caseId) continue;
      if (a.recurringClueId !== b.recurringClueId) continue;
      const key = [a.caseId, b.caseId].sort().join("|");
      if (seenPairs.has(key)) continue;
      seenPairs.add(key);
      hiddenConnections++;
    }
  }

  const clueCount = sharedClues.length;
  const mastermindStatus: MasterminStatus =
    clueCount >= 5 ? "Identified" : clueCount >= 3 ? "Shadow named" : clueCount >= 1 ? "Theory forming" : "Unknown";

  const unresolvedEvidence = sharedClues.reduce((sum, c) => sum + c.appearances, 0);

  return {
    id: FILE_001.id,
    number: FILE_001.number,
    title: FILE_001.title,
    tagline: FILE_001.tagline,
    loreBrief: FILE_001.lore,
    totalDays: FILE_001.totalDays,
    currentDay: day,
    hiddenConnections,
    unresolvedEvidence,
    masterminStatus: mastermindStatus,
    cases,
    sharedClues,
  };
}

export interface ConspiracyBoard {
  pins: BoardPin[];
  connections: BoardConnection[];
  clues: (RecurringClue & { appearances: number })[];
  characters: ReturningCharacter[];
}

function projectBoard(state: StoryState): ConspiracyBoard {
  const pins: BoardPin[] = [];
  const connections: BoardConnection[] = [];

  const archivedList = Object.values(state.archived).sort((a, b) => a.day - b.day);
  for (const rec of archivedList) {
    pins.push({
      id: `pin-victim-${rec.caseId}`,
      kind: "victim",
      label: rec.victim,
      sublabel: `${rec.title} · Day ${rec.day}`,
      day: rec.day,
    });
    const clue = getRecurringClue(rec.recurringClueId);
    if (clue) {
      const cluePinId = `pin-clue-${clue.id}`;
      if (!pins.some((p) => p.id === cluePinId)) {
        pins.push({
          id: cluePinId,
          kind: "clue",
          label: clue.name,
          sublabel: clue.motif ? `Motif · ${clue.motif}` : "Recurring clue",
          symbol: clue.symbol,
        });
      }
      connections.push({
        from: `pin-victim-${rec.caseId}`,
        to: cluePinId,
        reason: `Found at ${rec.location}`,
      });
    }
  }

  // Character pins for anyone whose appearance day is <= currentDay.
  const day = currentDay(state.archived);
  for (const ch of FILE_001.characters) {
    if (ch.appearsOnDays.some((d) => d <= day)) {
      pins.push({
        id: `pin-char-${ch.id}`,
        kind: "character",
        label: ch.name,
        sublabel: ch.role,
      });
    }
  }

  const clues = state.revealedClueIds
    .map((id) => {
      const c = getRecurringClue(id);
      if (!c) return null;
      return { ...c, appearances: state.clueAppearances[id] ?? 1 };
    })
    .filter((x): x is RecurringClue & { appearances: number } => x !== null);

  return {
    pins,
    connections,
    clues,
    characters: FILE_001.characters,
  };
}

/** Which mid-season events have unlocked so far (day-gated). */
function projectActiveEvents(state: StoryState): MidSeasonEvent[] {
  const day = currentDay(state.archived);
  return FILE_001.events.filter((e) => e.triggerDay <= day);
}

/* --------------------------------------------------------------
   Hooks
   -------------------------------------------------------------- */

export function useStory() {
  const state = useSyncExternalStore(storyStore.subscribe, storyStore.getSnapshot, storyStore.getSnapshot);

  const archiveCase = useCallback(
    (input: Parameters<StoryStore["archiveCase"]>[0]) => storyStore.archiveCase(input),
    [],
  );
  const markEventSeen = useCallback((id: string) => storyStore.markEventSeen(id), []);
  const reset = useCallback(() => storyStore.reset(), []);

  return {
    state,
    archived: Object.values(state.archived).sort((a, b) => a.day - b.day),
    revealedClues: state.revealedClueIds
      .map((id) => getRecurringClue(id))
      .filter((c): c is RecurringClue => Boolean(c)),
    seenEventIds: state.seenEventIds,
    currentDay: currentDay(state.archived),
    file: FILE_001,
    board: projectBoard(state),
    activeEvents: projectActiveEvents(state),
    archiveCase,
    markEventSeen,
    reset,
  };
}

export function useLiveSeason(): Season {
  const state = useSyncExternalStore(storyStore.subscribe, storyStore.getSnapshot, storyStore.getSnapshot);
  return projectSeason(state);
}

export function getReturningCastForCase(caseId: string): ReturningCharacter[] {
  const plan = getCasePlan(caseId);
  if (!plan?.characterIds) return [];
  return plan.characterIds
    .map((id) => getCharacter(id))
    .filter((c): c is ReturningCharacter => Boolean(c));
}
