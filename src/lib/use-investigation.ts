import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Case, CaseObjective, Evidence, EvidenceConnection } from "@/data/case001";
import { suspicionBand, type SuspicionLevel } from "@/data/case001";
import { ui } from "./ui-store";

export type EvidenceState = "found" | "examined" | "analyzed" | "linked" | "proven";

export interface DeskPlacement {
  x: number; // percent 0-100 of desk width
  y: number; // percent 0-100 of desk height
  rotation: number; // degrees
  flipped: boolean;
}

const DEFAULT_PLACEMENT: DeskPlacement = { x: 50, y: 50, rotation: 0, flipped: false };


interface NotebookNote {
  id: string;
  evidenceId: string;
  note: string;
  at: string;
  pinned: boolean;
  custom: boolean;
  suspicious?: boolean;
  group?: string;
}

export interface Verdict {
  killerId: string;
  weaponId: string;
  motiveId: string;
  primaryEvidenceId: string;
  correctKiller: boolean;
  correctWeapon: boolean;
  correctMotive: boolean;
  correctPrimary: boolean;
  killerName: string;
  weaponLabel: string;
  motiveLabel: string;
  primaryEvidenceLabel: string;
  evidenceScore: number;
  totalScore: number;
  maxScore: number;
  grade: string;
  submittedAt: number;
}

interface InvestigationState {
  examinedEvidence: Set<string>;
  investigatedHotspots: Set<string>;
  interviewedSuspects: Set<string>;
  importantEvidence: Set<string>;
  forensicsRead: Set<string>;
  notebook: NotebookNote[];
  xp: number;
  intuition: number;
  unlockedAchievements: Set<string>;
  compareSet: string[];
  verdict: Verdict | null;
  deskPlacements: Record<string, DeskPlacement>;
  pickedUp: Set<string>;
  discoveredConnections: Set<string>;
  failedPairs: string[]; // rolling history of last failed compare keys for feedback
}

const initial = (): InvestigationState => ({
  examinedEvidence: new Set(),
  investigatedHotspots: new Set(),
  interviewedSuspects: new Set(),
  importantEvidence: new Set(),
  forensicsRead: new Set(),
  notebook: [],
  xp: 0,
  intuition: 0,
  unlockedAchievements: new Set(),
  compareSet: [],
  verdict: null,
  deskPlacements: {},
  pickedUp: new Set(),
  discoveredConnections: new Set(),
  failedPairs: [],
});

const STORAGE_PREFIX = "case-zero:inv:";
const STORAGE_VERSION = 3;

function serialize(state: InvestigationState) {
  return JSON.stringify({
    v: STORAGE_VERSION,
    examinedEvidence: [...state.examinedEvidence],
    investigatedHotspots: [...state.investigatedHotspots],
    interviewedSuspects: [...state.interviewedSuspects],
    importantEvidence: [...state.importantEvidence],
    forensicsRead: [...state.forensicsRead],
    notebook: state.notebook,
    xp: state.xp,
    intuition: state.intuition,
    unlockedAchievements: [...state.unlockedAchievements],
    compareSet: state.compareSet,
    verdict: state.verdict,
    deskPlacements: state.deskPlacements,
    pickedUp: [...state.pickedUp],
    discoveredConnections: [...state.discoveredConnections],
  });
}

function deserialize(raw: string | null): InvestigationState | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    if (p?.v !== STORAGE_VERSION) return null;
    return {
      examinedEvidence: new Set<string>(p.examinedEvidence ?? []),
      investigatedHotspots: new Set<string>(p.investigatedHotspots ?? []),
      interviewedSuspects: new Set<string>(p.interviewedSuspects ?? []),
      importantEvidence: new Set<string>(p.importantEvidence ?? []),
      forensicsRead: new Set<string>(p.forensicsRead ?? []),
      notebook: p.notebook ?? [],
      xp: p.xp ?? 0,
      intuition: p.intuition ?? 0,
      unlockedAchievements: new Set<string>(p.unlockedAchievements ?? []),
      compareSet: p.compareSet ?? [],
      verdict: p.verdict ?? null,
      deskPlacements: p.deskPlacements ?? {},
      pickedUp: new Set<string>(p.pickedUp ?? []),
      discoveredConnections: new Set<string>(p.discoveredConnections ?? []),
      failedPairs: [],
    };
  } catch {
    return null;
  }
}


const stores = new Map<string, Store>();

export function pairKey(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

const ACHIEVEMENTS = [
  { id: "first_clue", label: "Sharp Eye", detail: "First clue uncovered", test: (s: InvestigationState) => s.examinedEvidence.size >= 1 },
  { id: "evidence_hunter", label: "Evidence Hunter", detail: "Collected 5 clues", test: (s: InvestigationState) => s.examinedEvidence.size >= 5 },
  { id: "interrogator", label: "Interrogator", detail: "Interviewed every suspect", test: (s: InvestigationState, c: Case) => s.interviewedSuspects.size >= c.suspects.length },
  { id: "master_observer", label: "Master Observer", detail: "Examined every object", test: (s: InvestigationState, c: Case) => s.examinedEvidence.size >= c.evidence.length },
  { id: "intuition_unlocked", label: "Detective Intuition", detail: "Intuition fully charged", test: (s: InvestigationState) => s.intuition >= 100 },
  { id: "lab_rat", label: "Lab Rat", detail: "Read every forensic report", test: (s: InvestigationState, c: Case) => s.forensicsRead.size >= c.evidence.filter(e => e.forensicReport).length && c.evidence.some(e => e.forensicReport) },
  { id: "first_thread", label: "Red Thread", detail: "Connected two pieces of evidence", test: (s: InvestigationState) => s.discoveredConnections.size >= 1 },
  { id: "web_spinner", label: "Web Spinner", detail: "Discovered every logical connection", test: (s: InvestigationState, c: Case) => c.connections.length > 0 && s.discoveredConnections.size >= c.connections.length },
] as const;


class Store {
  private state: InvestigationState;
  private listeners = new Set<() => void>();
  constructor(private caseRef: Case) {
    const restored = typeof window !== "undefined" ? deserialize(window.localStorage.getItem(STORAGE_PREFIX + caseRef.id)) : null;
    this.state = restored ?? initial();
  }

  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
  getSnapshot = () => this.state;

  private persist() {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(STORAGE_PREFIX + this.caseRef.id, serialize(this.state)); } catch { /* quota */ }
  }

  private emit() {
    this.state = { ...this.state };
    this.persist();
    this.listeners.forEach((l) => l());
    this.checkAchievements();
  }

  private checkAchievements() {
    for (const a of ACHIEVEMENTS) {
      if (this.state.unlockedAchievements.has(a.id)) continue;
      if (a.test(this.state, this.caseRef)) {
        this.state.unlockedAchievements = new Set(this.state.unlockedAchievements).add(a.id);
        ui.unlockAchievement({ id: a.id, label: a.label, detail: a.detail });
        this.persist();
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

  readForensic(evId: string) {
    if (this.state.forensicsRead.has(evId)) return;
    this.state.forensicsRead = new Set(this.state.forensicsRead).add(evId);
    this.state.xp += 5;
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

  toggleSuspicious(noteId: string) {
    this.state.notebook = this.state.notebook.map((n) =>
      n.id === noteId ? { ...n, suspicious: !n.suspicious } : n,
    );
    this.emit();
  }

  setGroup(noteId: string, group: string) {
    this.state.notebook = this.state.notebook.map((n) =>
      n.id === noteId ? { ...n, group: group || undefined } : n,
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

  submitVerdict(killerId: string, weaponId: string, motiveId: string, primaryEvidenceId: string): Verdict {
    const sol = this.caseRef.solution;
    const correctKiller = killerId === sol.killerId;
    const correctWeapon = weaponId === sol.weaponId;
    const correctMotive = motiveId === sol.motiveId;
    const correctPrimary = sol.keyEvidenceIds.includes(primaryEvidenceId);

    // Evidence score: proportion of key evidence examined + bonus for pinning them.
    const keyExamined = sol.keyEvidenceIds.filter(id => this.state.examinedEvidence.has(id)).length;
    const keyPinned = sol.keyEvidenceIds.filter(id => this.state.importantEvidence.has(id) || this.state.notebook.some(n => n.evidenceId === id && n.pinned)).length;
    const evidenceRatio = sol.keyEvidenceIds.length === 0 ? 1 : (keyExamined + keyPinned * 0.5) / (sol.keyEvidenceIds.length * 1.5);
    const evidenceScore = Math.round(evidenceRatio * 40); // /40

    // Points: killer 40, weapon 15, motive 15, primary 10, evidence 40, minus red herrings pinned
    const redHerringsPinned = this.caseRef.evidence.filter(e => e.redHerring && (this.state.importantEvidence.has(e.id))).length;
    let total =
      (correctKiller ? 40 : 0) +
      (correctWeapon ? 15 : 0) +
      (correctMotive ? 15 : 0) +
      (correctPrimary ? 10 : 0) +
      evidenceScore -
      redHerringsPinned * 5;
    const maxScore = 120;
    total = Math.max(0, Math.min(maxScore, total));

    let grade = "F";
    if (correctKiller) {
      if (total >= 105) grade = "S";
      else if (total >= 90) grade = "A";
      else if (total >= 70) grade = "B";
      else if (total >= 55) grade = "C";
      else grade = "D";
    }

    const killer = this.caseRef.suspects.find(s => s.id === killerId);
    const weapon = this.caseRef.weaponOptions.find(w => w.id === weaponId);
    const motive = this.caseRef.motiveOptions.find(m => m.id === motiveId);
    const primary = this.caseRef.evidence.find(e => e.id === primaryEvidenceId);

    const verdict: Verdict = {
      killerId, weaponId, motiveId, primaryEvidenceId,
      correctKiller, correctWeapon, correctMotive, correctPrimary,
      killerName: killer?.name ?? "Unknown",
      weaponLabel: weapon?.label ?? "Unknown",
      motiveLabel: motive?.label ?? "Unknown",
      primaryEvidenceLabel: primary?.label ?? "Unknown",
      evidenceScore,
      totalScore: total,
      maxScore,
      grade,
      submittedAt: Date.now(),
    };
    this.state.verdict = verdict;
    this.state.xp += total;
    ui.spawnXp(total);
    this.emit();
    return verdict;
  }

  resetInvestigation() {
    this.state = initial();
    this.persist();
    this.listeners.forEach((l) => l());
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

export interface ObjectiveProgress {
  objective: CaseObjective;
  current: number;
  total: number;
  complete: boolean;
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

  const objectives: ObjectiveProgress[] = useMemo(() => c.objectives.map((o) => {
    let current = 0, target = 0;
    switch (o.kind) {
      case "hotspots": target = o.target ?? c.hotspots.length; current = state.investigatedHotspots.size; break;
      case "evidence": target = o.target ?? c.evidence.length; current = state.examinedEvidence.size; break;
      case "suspects": target = o.target ?? c.suspects.length; current = state.interviewedSuspects.size; break;
      case "timeline": target = o.target ?? (c.baseTimeline.length + c.evidence.filter(e => e.timelineUnlock).length); current = timeline.length; break;
      case "forensics": target = o.target ?? c.evidence.filter(e => e.forensicReport).length; current = state.forensicsRead.size; break;
      case "notebook": target = o.target ?? 3; current = state.notebook.filter(n => n.pinned).length; break;
    }
    return { objective: o, current: Math.min(current, target), total: target, complete: current >= target };
  }), [c, state.investigatedHotspots, state.examinedEvidence, state.interviewedSuspects, state.forensicsRead, state.notebook, timeline.length]);

  return {
    examined: state.examinedEvidence,
    investigated: state.investigatedHotspots,
    interviewed: state.interviewedSuspects,
    important: state.importantEvidence,
    forensicsRead: state.forensicsRead,
    notebook: state.notebook,
    xp: state.xp,
    intuition: state.intuition,
    achievements: state.unlockedAchievements,
    compareSet: state.compareSet,
    verdict: state.verdict,
    suspicionScores,
    progress,
    timeline,
    objectives,
    examineEvidence: useCallback((e: Evidence, x?: number, y?: number) => store.examineEvidence(e, x, y), [store]),
    investigateHotspot: useCallback((id: string, x?: number, y?: number) => store.investigateHotspot(id, x, y), [store]),
    interviewSuspect: useCallback((id: string) => store.interviewSuspect(id), [store]),
    readForensic: useCallback((id: string) => store.readForensic(id), [store]),
    toggleImportant: useCallback((id: string) => store.toggleImportant(id), [store]),
    togglePin: useCallback((id: string) => store.togglePin(id), [store]),
    toggleSuspicious: useCallback((id: string) => store.toggleSuspicious(id), [store]),
    setGroup: useCallback((id: string, g: string) => store.setGroup(id, g), [store]),
    removeNote: useCallback((id: string) => store.removeNote(id), [store]),
    updateNote: useCallback((id: string, n: string) => store.updateNote(id, n), [store]),
    addCustomNote: useCallback((n: string) => store.addCustomNote(n), [store]),
    toggleCompare: useCallback((id: string) => store.toggleCompare(id), [store]),
    clearCompare: useCallback(() => store.clearCompare(), [store]),
    submitVerdict: useCallback((k: string, w: string, m: string, p: string) => store.submitVerdict(k, w, m, p), [store]),
    resetInvestigation: useCallback(() => store.resetInvestigation(), [store]),
  };
}
