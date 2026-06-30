import { useCallback, useSyncExternalStore } from "react";
import type { Case, Evidence } from "@/data/case001";
import { suspicionBand, type SuspicionLevel } from "@/data/case001";
import { ui } from "./ui-store";

interface NotebookNote {
  id: string;
  evidenceId: string;
  note: string;
  at: string;
  pinned: boolean;
  custom: boolean;
}

interface InvestigationState {
  examinedEvidence: Set<string>;
  investigatedHotspots: Set<string>;
  interviewedSuspects: Set<string>;
  importantEvidence: Set<string>;
  notebook: NotebookNote[];
  xp: number;
  intuition: number;
  unlockedAchievements: Set<string>;
  compareSet: string[]; // up to 2 evidence ids
}

const initial = (): InvestigationState => ({
  examinedEvidence: new Set(),
  investigatedHotspots: new Set(),
  interviewedSuspects: new Set(),
  importantEvidence: new Set(),
  notebook: [],
  xp: 0,
  intuition: 0,
  unlockedAchievements: new Set(),
  compareSet: [],
});

const stores = new Map<string, Store>();

const ACHIEVEMENTS = [
  { id: "first_clue", label: "Sharp Eye", detail: "First clue uncovered", test: (s: InvestigationState) => s.examinedEvidence.size >= 1 },
  { id: "evidence_hunter", label: "Evidence Hunter", detail: "Collected 5 clues", test: (s: InvestigationState) => s.examinedEvidence.size >= 5 },
  { id: "interrogator", label: "Interrogator", detail: "Interviewed every suspect", test: (s: InvestigationState, c: Case) => s.interviewedSuspects.size >= c.suspects.length },
  { id: "master_observer", label: "Master Observer", detail: "Examined every object", test: (s: InvestigationState, c: Case) => s.examinedEvidence.size >= c.evidence.length },
  { id: "intuition_unlocked", label: "Detective Intuition", detail: "Intuition fully charged", test: (s: InvestigationState) => s.intuition >= 100 },
] as const;

class Store {
  private state: InvestigationState = initial();
  private listeners = new Set<() => void>();
  constructor(private caseRef: Case) {}

  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
  getSnapshot = () => this.state;

  private emit() {
    this.state = { ...this.state };
    this.listeners.forEach((l) => l());
    this.checkAchievements();
  }

  private checkAchievements() {
    for (const a of ACHIEVEMENTS) {
      if (this.state.unlockedAchievements.has(a.id)) continue;
      if (a.test(this.state, this.caseRef)) {
        this.state.unlockedAchievements = new Set(this.state.unlockedAchievements).add(a.id);
        ui.unlockAchievement({ id: a.id, label: a.label, detail: a.detail });
      }
    }
  }

  examineEvidence(e: Evidence, x?: number, y?: number) {
    if (this.state.examinedEvidence.has(e.id)) return;
    this.state.examinedEvidence = new Set(this.state.examinedEvidence).add(e.id);
    this.state.notebook = [
      ...this.state.notebook,
      {
        id: `n-${e.id}`,
        evidenceId: e.id,
        note: e.notebookNote,
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        pinned: e.importance === "critical",
        custom: false,
      },
    ];
    this.state.xp += e.xp;
    this.state.intuition = Math.min(100, this.state.intuition + Math.round(e.xp * 0.7));
    ui.spawnXp(e.xp, x, y);
    this.emit();
  }

  investigateHotspot(hotspotId: string, x?: number, y?: number) {
    if (this.state.investigatedHotspots.has(hotspotId)) return;
    const hotspot = this.caseRef.hotspots.find((h) => h.id === hotspotId);
    if (!hotspot) return;
    this.state.investigatedHotspots = new Set(this.state.investigatedHotspots).add(hotspotId);
    const ev = this.caseRef.evidence.find((e) => e.id === hotspot.evidenceId);
    if (ev) this.examineEvidence(ev, x, y);
    else this.emit();
  }

  interviewSuspect(id: string) {
    if (this.state.interviewedSuspects.has(id)) return;
    this.state.interviewedSuspects = new Set(this.state.interviewedSuspects).add(id);
    this.state.xp += 10;
    this.state.intuition = Math.min(100, this.state.intuition + 5);
    ui.spawnXp(10);
    this.emit();
  }

  toggleImportant(id: string) {
    const next = new Set(this.state.importantEvidence);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.state.importantEvidence = next;
    this.emit();
  }

  togglePin(noteId: string) {
    this.state.notebook = this.state.notebook.map((n) =>
      n.id === noteId ? { ...n, pinned: !n.pinned } : n,
    );
    this.emit();
  }

  removeNote(noteId: string) {
    this.state.notebook = this.state.notebook.filter((n) => n.id !== noteId);
    this.emit();
  }

  updateNote(noteId: string, note: string) {
    this.state.notebook = this.state.notebook.map((n) =>
      n.id === noteId ? { ...n, note } : n,
    );
    this.emit();
  }

  addCustomNote(text: string) {
    if (!text.trim()) return;
    this.state.notebook = [
      ...this.state.notebook,
      {
        id: `n-custom-${Date.now()}`,
        evidenceId: "",
        note: text.trim(),
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        pinned: true,
        custom: true,
      },
    ];
    this.emit();
  }

  toggleCompare(id: string) {
    let next = [...this.state.compareSet];
    if (next.includes(id)) next = next.filter((x) => x !== id);
    else {
      next.push(id);
      if (next.length > 2) next.shift();
    }
    this.state.compareSet = next;
    this.emit();
  }

  clearCompare() {
    this.state.compareSet = [];
    this.emit();
  }
}

function getStore(c: Case) {
  let s = stores.get(c.id);
  if (!s) {
    s = new Store(c);
    stores.set(c.id, s);
  }
  return s;
}

export interface SuspectScore {
  id: string;
  score: number;
  band: SuspicionLevel;
}

export function useInvestigation(c: Case) {
  const store = getStore(c);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const suspicionScores: Record<string, SuspectScore> = {};
  for (const s of c.suspects) {
    let score = s.baselineSuspicion;
    for (const evId of state.examinedEvidence) {
      const ev = c.evidence.find((e) => e.id === evId);
      score += ev?.suspicionImpact[s.id] ?? 0;
    }
    if (state.interviewedSuspects.has(s.id)) score += 4;
    score = Math.max(0, Math.min(100, score));
    suspicionScores[s.id] = { id: s.id, score, band: suspicionBand(score) };
  }

  const total = c.evidence.length + c.suspects.length;
  const done = state.examinedEvidence.size + state.interviewedSuspects.size;
  const progress = total ? Math.round((done / total) * 100) : 0;

  const timeline = [...c.baseTimeline];
  for (const evId of state.examinedEvidence) {
    const ev = c.evidence.find((e) => e.id === evId);
    if (ev?.timelineUnlock) timeline.push(ev.timelineUnlock);
  }
  timeline.sort((a, b) => a.time.localeCompare(b.time));

  return {
    examined: state.examinedEvidence,
    investigated: state.investigatedHotspots,
    interviewed: state.interviewedSuspects,
    important: state.importantEvidence,
    notebook: state.notebook,
    xp: state.xp,
    intuition: state.intuition,
    achievements: state.unlockedAchievements,
    compareSet: state.compareSet,
    suspicionScores,
    progress,
    timeline,
    examineEvidence: useCallback((e: Evidence, x?: number, y?: number) => store.examineEvidence(e, x, y), [store]),
    investigateHotspot: useCallback((id: string, x?: number, y?: number) => store.investigateHotspot(id, x, y), [store]),
    interviewSuspect: useCallback((id: string) => store.interviewSuspect(id), [store]),
    toggleImportant: useCallback((id: string) => store.toggleImportant(id), [store]),
    togglePin: useCallback((id: string) => store.togglePin(id), [store]),
    removeNote: useCallback((id: string) => store.removeNote(id), [store]),
    updateNote: useCallback((id: string, n: string) => store.updateNote(id, n), [store]),
    addCustomNote: useCallback((n: string) => store.addCustomNote(n), [store]),
    toggleCompare: useCallback((id: string) => store.toggleCompare(id), [store]),
    clearCompare: useCallback(() => store.clearCompare(), [store]),
  };
}
