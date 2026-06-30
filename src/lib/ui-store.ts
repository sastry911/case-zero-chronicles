import { useSyncExternalStore } from "react";

export interface XpFloater {
  id: string;
  amount: number;
  x: number;
  y: number;
}

export interface AchievementToast {
  id: string;
  uid: string;
  label: string;
  detail: string;
}

interface UIState {
  soundOn: boolean;
  xpFloaters: XpFloater[];
  achievements: AchievementToast[];
}

class UIStore {
  private state: UIState = { soundOn: true, xpFloaters: [], achievements: [] };
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

  toggleSound() {
    this.state.soundOn = !this.state.soundOn;
    this.emit();
  }

  spawnXp(amount: number, x?: number, y?: number) {
    const id = `xp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const fx = x ?? (typeof window !== "undefined" ? window.innerWidth - 96 : 0);
    const fy = y ?? (typeof window !== "undefined" ? 120 : 0);
    this.state.xpFloaters = [...this.state.xpFloaters, { id, amount, x: fx, y: fy }];
    this.emit();
    setTimeout(() => {
      this.state.xpFloaters = this.state.xpFloaters.filter((f) => f.id !== id);
      this.emit();
    }, 1400);
  }

  unlockAchievement(a: { id: string; label: string; detail: string }) {
    const uid = `${a.id}-${Date.now()}`;
    this.state.achievements = [...this.state.achievements, { ...a, uid }];
    this.emit();
    setTimeout(() => {
      this.state.achievements = this.state.achievements.filter((x) => x.uid !== uid);
      this.emit();
    }, 4200);
  }
}

export const ui = new UIStore();

export function useUI() {
  return useSyncExternalStore(ui.subscribe, ui.getSnapshot, ui.getSnapshot);
}
