import { useCallback, useSyncExternalStore } from "react";

interface InvestigationState {
  examinedEvidence: Set<string>;
  interviewedSuspects: Set<string>;
  notebook: { evidenceId: string; note: string; at: string }[];
}

const stores = new Map<string, Store>();

class Store {
  private state: InvestigationState = {
    examinedEvidence: new Set(),
    interviewedSuspects: new Set(),
    notebook: [],
  };
  private listeners = new Set<() => void>();

  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  getSnapshot = () => this.state;

  private emit() {
    this.state = { ...this.state };
    this.listeners.forEach((l) => l());
  }

  examineEvidence(id: string, note: string) {
    if (this.state.examinedEvidence.has(id)) return;
    this.state.examinedEvidence = new Set(this.state.examinedEvidence).add(id);
    this.state.notebook = [
      ...this.state.notebook,
      { evidenceId: id, note, at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ];
    this.emit();
  }

  interviewSuspect(id: string) {
    if (this.state.interviewedSuspects.has(id)) return;
    this.state.interviewedSuspects = new Set(this.state.interviewedSuspects).add(id);
    this.emit();
  }
}

function getStore(caseId: string) {
  let s = stores.get(caseId);
  if (!s) {
    s = new Store();
    stores.set(caseId, s);
  }
  return s;
}

export function useInvestigation(caseId: string, totalEvidence: number, totalSuspects: number) {
  const store = getStore(caseId);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const examineEvidence = useCallback(
    (id: string, note: string) => store.examineEvidence(id, note),
    [store],
  );
  const interviewSuspect = useCallback((id: string) => store.interviewSuspect(id), [store]);

  const evidenceProgress = totalEvidence ? state.examinedEvidence.size / totalEvidence : 0;
  const suspectProgress = totalSuspects ? state.interviewedSuspects.size / totalSuspects : 0;
  const progress = Math.round(((evidenceProgress + suspectProgress) / 2) * 100);

  return {
    examined: state.examinedEvidence,
    interviewed: state.interviewedSuspects,
    notebook: state.notebook,
    progress,
    examineEvidence,
    interviewSuspect,
  };
}
