export type ArchivedStatus = "solved" | "failed" | "active" | "locked";

export interface SharedClue {
  id: string;
  symbol: string; // short glyph, e.g. "01" or "▲"
  name: string;
  hint: string; // vague, unresolved
  foundOnDay: number; // 0 = prologue / pre-season
  originCaseId: string | null;
  appearances: number; // how many cases it has surfaced in
}

export interface ArchivedCase {
  id: string;
  number: string;
  title: string; // "Sealed" for locked days
  day: number;
  status: ArchivedStatus;
  difficulty: 1 | 2 | 3 | 4 | 5;
  closedAt?: string; // e.g. "23:12"
  verdict?: string; // suspect name or "Unresolved"
  recurringClueId?: string | null; // the mysterious clue this case revealed
}

export type MasterminStatus = "Unknown" | "Theory forming" | "Shadow named" | "Identified";

export interface Season {
  id: string;
  number: string; // "FILE 001"
  title: string;
  tagline: string;
  loreBrief: string;
  totalDays: number;
  currentDay: number;
  hiddenConnections: number;
  unresolvedEvidence: number;
  masterminStatus: MasterminStatus;
  cases: ArchivedCase[];
  sharedClues: SharedClue[];
}

const buildCaseSlots = (currentDay: number, total: number, seeded: ArchivedCase[]): ArchivedCase[] => {
  const seededByDay = new Map(seeded.map((c) => [c.day, c]));
  const out: ArchivedCase[] = [];
  for (let d = 1; d <= total; d++) {
    if (seededByDay.has(d)) {
      out.push(seededByDay.get(d)!);
    } else if (d < currentDay) {
      out.push({
        id: `f001-d${d}`,
        number: `Case #${String(d).padStart(3, "0")}`,
        title: "Unrecorded",
        day: d,
        status: "failed",
        difficulty: 3,
      });
    } else if (d === currentDay) {
      out.push({
        id: `f001-d${d}`,
        number: `Case #${String(d).padStart(3, "0")}`,
        title: "Awaiting briefing",
        day: d,
        status: "active",
        difficulty: 3,
      });
    } else {
      out.push({
        id: `f001-d${d}`,
        number: `Case #${String(d).padStart(3, "0")}`,
        title: "Sealed",
        day: d,
        status: "locked",
        difficulty: 3,
      });
    }
  }
  return out;
};

export const currentSeason: Season = {
  id: "file-001",
  number: "FILE 001",
  title: "The Crimson Thread",
  tagline: "Thirty nights. Thirty crimes. One hand behind all of them.",
  loreBrief:
    "A single crimson fibre keeps appearing at unrelated murder scenes across the city. Someone is stitching these cases together — and only a detective who works every night for thirty days will see the pattern.",
  totalDays: 30,
  currentDay: 1,
  hiddenConnections: 0,
  unresolvedEvidence: 1,
  masterminStatus: "Unknown",
  cases: buildCaseSlots(1, 30, [
    {
      id: "case-001",
      number: "Case #001",
      title: "The Last Train",
      day: 1,
      status: "active",
      difficulty: 4,
      recurringClueId: "clue-thread",
    },
  ]),
  sharedClues: [
    {
      id: "clue-thread",
      symbol: "//",
      name: "A single crimson thread",
      hint: "A fibre of dyed silk, wound tight. Found near the victim of the prologue file — not consistent with anything she was wearing.",
      foundOnDay: 0,
      originCaseId: null,
      appearances: 1,
    },
  ],
};

export function getCaseByDay(day: number): ArchivedCase | undefined {
  return currentSeason.cases.find((c) => c.day === day);
}
