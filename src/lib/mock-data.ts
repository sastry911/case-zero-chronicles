export type CaseStatus = "available" | "in-progress" | "solved" | "failed";

export interface CaseSummary {
  id: string;
  number: string;
  title: string;
  blurb: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedMinutes: number;
  status: CaseStatus;
  date: string;
  location: string;
}

export const todaysCase: CaseSummary = {
  id: "case-001",
  number: "Case #001",
  title: "The Last Train",
  blurb:
    "A renowned architect is found dead in the rear car of the 23:47 express. Five passengers. One has something to hide.",
  difficulty: 4,
  estimatedMinutes: 15,
  status: "in-progress",
  date: "June 30, 2026",
  location: "Northbound Express · Car 7",
};

export const recentCases: CaseSummary[] = [
  {
    id: "case-000",
    number: "Case #000",
    title: "Silence at Willow Court",
    blurb: "A pianist vanishes mid-concert. Only the audience saw what really happened.",
    difficulty: 3,
    estimatedMinutes: 12,
    status: "solved",
    date: "June 29, 2026",
    location: "Willow Concert Hall",
  },
  {
    id: "case-m02",
    number: "Case #M-02",
    title: "Ink on the Ledger",
    blurb: "A forged signature, a missing safe, and a partner with too many alibis.",
    difficulty: 4,
    estimatedMinutes: 18,
    status: "solved",
    date: "June 28, 2026",
    location: "Aldrich & Vale, Solicitors",
  },
  {
    id: "case-m01",
    number: "Case #M-01",
    title: "The Harbor Light",
    blurb: "The lighthouse keeper never left his post — yet his footprints lead inland.",
    difficulty: 2,
    estimatedMinutes: 10,
    status: "failed",
    date: "June 27, 2026",
    location: "Greycliff Point",
  },
];

export interface Evidence {
  id: string;
  label: string;
  detail: string;
  tag: "physical" | "witness" | "document" | "digital";
}

export const caseEvidence: Evidence[] = [
  { id: "e1", label: "Torn ticket stub", detail: "Carriage 7, seat 12B. Punched at 23:51.", tag: "physical" },
  { id: "e2", label: "Conductor's testimony", detail: "Saw two passengers argue near the rear door.", tag: "witness" },
  { id: "e3", label: "Encrypted message", detail: "Sent from victim's phone at 23:44 — recipient unknown.", tag: "digital" },
  { id: "e4", label: "Architectural plans", detail: "Marked-up blueprints found folded in the victim's coat.", tag: "document" },
];

export interface Suspect {
  id: string;
  name: string;
  role: string;
  motive: string;
  initials: string;
}

export const caseSuspects: Suspect[] = [
  { id: "s1", name: "Eleanor Voss", role: "Business partner", motive: "Disputed contract worth millions.", initials: "EV" },
  { id: "s2", name: "Marcus Hale", role: "Former apprentice", motive: "Publicly humiliated and dismissed.", initials: "MH" },
  { id: "s3", name: "Junko Reyes", role: "Investigative journalist", motive: "Building a story he was burying.", initials: "JR" },
  { id: "s4", name: "Daniel Okafor", role: "Night conductor", motive: "Owed a debt he couldn't repay.", initials: "DO" },
  { id: "s5", name: "Sister Aune", role: "Train chaplain", motive: "Knew a secret he refused to confess.", initials: "SA" },
];

export interface LeaderEntry {
  rank: number;
  handle: string;
  solved: number;
  streak: number;
  xp: number;
  accuracy: number;
}

export const leaderboard: LeaderEntry[] = [
  { rank: 1, handle: "noir.detective", solved: 184, streak: 92, xp: 48210, accuracy: 96 },
  { rank: 2, handle: "the.archivist", solved: 171, streak: 64, xp: 44980, accuracy: 94 },
  { rank: 3, handle: "redroom", solved: 168, streak: 41, xp: 43120, accuracy: 93 },
  { rank: 4, handle: "case.zero", solved: 152, streak: 28, xp: 39870, accuracy: 91 },
  { rank: 5, handle: "midnight.ledger", solved: 149, streak: 33, xp: 38540, accuracy: 90 },
  { rank: 6, handle: "ash.&.embers", solved: 141, streak: 19, xp: 36210, accuracy: 89 },
  { rank: 7, handle: "lantern", solved: 138, streak: 22, xp: 35880, accuracy: 88 },
  { rank: 8, handle: "vesper", solved: 132, streak: 14, xp: 34110, accuracy: 87 },
  { rank: 9, handle: "halcyon", solved: 127, streak: 11, xp: 32990, accuracy: 86 },
  { rank: 10, handle: "ironwood", solved: 121, streak: 9, xp: 31420, accuracy: 85 },
];

export const profile = {
  handle: "case.zero",
  name: "Detective Alex Mercer",
  joined: "March 2026",
  rank: 4,
  rankTitle: "Senior Investigator",
  streak: 28,
  xp: 39870,
  xpToNext: 2130,
  solved: 152,
  failed: 14,
  accuracy: 91,
  fastestSolve: "4m 12s",
};
