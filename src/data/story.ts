/**
 * Story Engine — static narrative catalog for FILE 001: The Crimson Thread.
 *
 * This file is the writer's room. It declares what CAN happen across the
 * 30-night file: the case slots, the returning cast, the recurring clues
 * and the mid-season events. Runtime discovery / archiving lives in
 * `src/lib/story-engine.ts` and reads from this catalog.
 */

export type CauseOfDeath =
  | "Blunt force trauma"
  | "Strangulation"
  | "Gunshot"
  | "Poisoning"
  | "Fall from height"
  | "Stabbing"
  | "Drowning"
  | "Undetermined";

export interface RecurringClue {
  id: string;
  symbol: string;
  name: string;
  /** Deliberately vague. Never explain on reveal. */
  hint: string;
  /** Optional group used to draw red-string connections between clues. */
  motif?: string;
}

export interface ReturningCharacter {
  id: string;
  name: string;
  role: string;
  bio: string;
  /** Days on which this character surfaces (1..30). Used by the board / cases. */
  appearsOnDays: number[];
}

export type MidSeasonEventKind =
  | "evidence_disappears"
  | "witness_dies"
  | "suspect_returns"
  | "detective_resigns"
  | "anonymous_message";

export interface MidSeasonEvent {
  id: string;
  triggerDay: number;
  kind: MidSeasonEventKind;
  headline: string;
  body: string;
  /** Optional character or clue this event references. */
  refs?: { characterId?: string; clueId?: string };
}

export interface CasePlan {
  /** Stable id matching the investigation module (e.g. "case-001"). */
  id: string;
  day: number;
  number: string;
  title: string;
  victim: string;
  location: string;
  causeOfDeath: CauseOfDeath;
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Which recurring clue this case secretly plants. */
  recurringClueId: string;
  /** Optional returning characters that appear in this case. */
  characterIds?: string[];
  synopsis: string;
}

export interface FileDefinition {
  id: string;
  number: string;
  title: string;
  tagline: string;
  lore: string;
  totalDays: number;
  cases: CasePlan[];
  clues: RecurringClue[];
  characters: ReturningCharacter[];
  events: MidSeasonEvent[];
}

/* ================================================================
   Recurring clues — six motifs, each surfacing 4-6 times in the file.
   ================================================================ */
export const RECURRING_CLUES: RecurringClue[] = [
  {
    id: "clue-thread",
    symbol: "//",
    name: "Crimson silk thread",
    hint: "A single dyed silk fibre, wound tight. Never matches anything the victim was wearing.",
    motif: "thread",
  },
  {
    id: "clue-coin",
    symbol: "◎",
    name: "Unmarked silver coin",
    hint: "Blank on both faces. Slightly warm to the touch on arrival.",
    motif: "coin",
  },
  {
    id: "clue-watch",
    symbol: "⧖",
    name: "Broken pocket watch",
    hint: "The minute hand is always missing. The hour hand always points to 3.",
    motif: "watch",
  },
  {
    id: "clue-dna",
    symbol: "≈",
    name: "Unregistered DNA trace",
    hint: "Human. Not in any database. Repeats across scenes with zero forensic explanation.",
    motif: "trace",
  },
  {
    id: "clue-photo",
    symbol: "▤",
    name: "Burned photograph",
    hint: "Only a corner survives. Same corner. Same fingertip visible each time.",
    motif: "photo",
  },
  {
    id: "clue-cipher",
    symbol: "§",
    name: "Cipher note",
    hint: "Three lines of substitution cipher. The key hasn't been broken. Yet.",
    motif: "cipher",
  },
];

/* ================================================================
   Returning characters — 5 recurring NPCs the player will meet again.
   ================================================================ */
export const RETURNING_CHARACTERS: ReturningCharacter[] = [
  {
    id: "char-sr-detective",
    name: "DCP Vikram Rao",
    role: "Senior Detective",
    bio: "Twenty-two years on the force. Signs off on every arrest you make. Trusts patterns more than confessions.",
    appearsOnDays: [1, 4, 9, 15, 22, 30],
  },
  {
    id: "char-forensics",
    name: "Dr. Anaya Shroff",
    role: "Forensics Lead",
    bio: "Runs the city lab. First to notice the crimson fibre wasn't native to the crime scene. Skeptical of coincidence.",
    appearsOnDays: [1, 3, 6, 11, 18, 25],
  },
  {
    id: "char-reporter",
    name: "Meera Iqbal",
    role: "Crime Reporter",
    bio: "The Deccan Ledger. Prints what the police won't. Sometimes she knows things before you do.",
    appearsOnDays: [2, 7, 14, 21, 28],
  },
  {
    id: "char-me",
    name: "Dr. Farhan Kaul",
    role: "Medical Examiner",
    bio: "Dry, precise, unflappable. Delivers cause of death like a weather report.",
    appearsOnDays: [1, 5, 8, 12, 17, 23, 29],
  },
  {
    id: "char-informant",
    name: "The Cartographer",
    role: "Anonymous Informant",
    bio: "Contacts you only via cipher notes. Signs every message with a small hand-drawn map. Motive unknown.",
    appearsOnDays: [6, 13, 20, 27],
  },
];

/* ================================================================
   Mid-season events — narrative beats that fire on specific days.
   ================================================================ */
export const MID_SEASON_EVENTS: MidSeasonEvent[] = [
  {
    id: "evt-evidence-vanishes",
    triggerDay: 7,
    kind: "evidence_disappears",
    headline: "Evidence #A-118 signed out. Never returned.",
    body: "The crimson thread from Case #001 is missing from the property room. The custody log ends with a signature no one recognises.",
    refs: { clueId: "clue-thread" },
  },
  {
    id: "evt-witness-dies",
    triggerDay: 12,
    kind: "witness_dies",
    headline: "Witness found dead in his flat.",
    body: "The commuter who ID'd the fifth passenger from Case #001 was found this morning. Cause of death: undetermined. His notebook is missing.",
  },
  {
    id: "evt-suspect-returns",
    triggerDay: 18,
    kind: "suspect_returns",
    headline: "A face you've seen before.",
    body: "A suspect you cleared earlier in the file is now a witness at tonight's scene. Same coat. Different story.",
  },
  {
    id: "evt-resigns",
    triggerDay: 23,
    kind: "detective_resigns",
    headline: "DCP Rao files his papers.",
    body: "Effective immediately. He leaves a sealed envelope on your desk with a single line: 'Do not trust the coin.'",
    refs: { characterId: "char-sr-detective", clueId: "clue-coin" },
  },
  {
    id: "evt-anonymous",
    triggerDay: 6,
    kind: "anonymous_message",
    headline: "A cipher note arrives at your office.",
    body: "Slid under the door before dawn. Same hand as the last one. Same map in the corner. It hasn't been decoded.",
    refs: { characterId: "char-informant", clueId: "clue-cipher" },
  },
];

/* ================================================================
   Case plans — 30 nights. Only Case #001 has a full investigation
   module today; the rest are narrative stubs that ship victim,
   location, cause of death and recurring clue for the board.
   ================================================================ */
const CLUE_ROTATION = ["clue-thread", "clue-coin", "clue-watch", "clue-dna", "clue-photo", "clue-cipher"];

// A little hand-authored spine, then filler for the rest of the month.
const AUTHORED: Partial<Record<number, Omit<CasePlan, "day" | "number">>> = {
  1: {
    id: "case-001",
    title: "The Last Train",
    victim: "Emily Carter",
    location: "Hyderabad Metro, Platform 7",
    causeOfDeath: "Blunt force trauma",
    difficulty: 4,
    recurringClueId: "clue-thread",
    characterIds: ["char-sr-detective", "char-forensics", "char-me"],
    synopsis: "A junior analyst is found in the last carriage of the 23:47. Five passengers. One of them stayed behind.",
  },
  2: {
    id: "case-002",
    title: "House on Banjara Road",
    victim: "Rajeev Malhotra",
    location: "Banjara Hills, private residence",
    causeOfDeath: "Stabbing",
    difficulty: 3,
    recurringClueId: "clue-coin",
    characterIds: ["char-reporter"],
    synopsis: "A property lawyer is stabbed in his own study. The alarm was disarmed with his own code.",
  },
  3: {
    id: "case-003",
    title: "The Rooftop Bar",
    victim: "Simran Kohli",
    location: "Jubilee Hills, hotel rooftop",
    causeOfDeath: "Fall from height",
    difficulty: 4,
    recurringClueId: "clue-watch",
    characterIds: ["char-forensics"],
    synopsis: "A gallery owner goes over the parapet at 02:11. The security cameras skip forty-two seconds.",
  },
  6: {
    id: "case-006",
    title: "The Cartographer's Note",
    victim: "N/A — attempted",
    location: "Old City post office",
    causeOfDeath: "Undetermined",
    difficulty: 5,
    recurringClueId: "clue-cipher",
    characterIds: ["char-informant"],
    synopsis: "Not a body — a warning. A cipher slid under the postmaster's door. The postmaster is now missing.",
  },
  15: {
    id: "case-015",
    title: "Half of the File",
    victim: "Detective Kavya Rao",
    location: "Police archives, Basement 2",
    causeOfDeath: "Gunshot",
    difficulty: 5,
    recurringClueId: "clue-photo",
    characterIds: ["char-sr-detective", "char-forensics"],
    synopsis: "One of your own. She was pulling every file that referenced the crimson thread. She got as far as fourteen.",
  },
  30: {
    id: "case-030",
    title: "The Cartographer",
    victim: "?",
    location: "?",
    causeOfDeath: "Undetermined",
    difficulty: 5,
    recurringClueId: "clue-cipher",
    characterIds: ["char-sr-detective", "char-forensics", "char-me", "char-reporter", "char-informant"],
    synopsis: "Night thirty. You finally meet the person on the other end of the notes.",
  },
};

const FILLER_TITLES = [
  "The Silent Neighbour", "Rain on the Ring Road", "The Missing Chef", "The Locked Studio",
  "Twelve Missed Calls", "The Antique Dealer", "The Marina", "The Understudy",
  "The Bookseller", "The Wedding Party", "The Blackout", "The River Path",
  "The Late Editor", "The Ticket Booth", "The Storm Drain", "The Auction",
  "The Hostel Room", "The Cargo Bay", "The Radio Tower", "The Empty Chapel",
  "The Cold Kitchen", "The Toll Plaza", "The Ferry", "The Amber Room",
];

const FILLER_VICTIMS = [
  "Anaya Bose", "Karthik Menon", "Devika Rao", "Iqbal Sheikh", "Priya Nair",
  "Rohan Deshpande", "Zoya Ahmed", "Sameer Gupta", "Naina Krishnan", "Aditya Verma",
  "Mira Chatterjee", "Faisal Khan", "Tanvi Reddy", "Arjun Pillai", "Riya Sen",
  "Vikas Rathore", "Kabir Anand", "Nisha Iyer", "Yash Bhatia", "Sana Qureshi",
  "Reeva D'Souza", "Manav Kapoor", "Ishaan Bhatt", "Aarav Sinha",
];

const FILLER_LOCATIONS = [
  "Secunderabad railway yard", "Charminar bylane", "Necklace Road promenade",
  "Gachibowli tech park", "Golconda ridgeline", "Miyapur bus depot",
  "Kondapur nightclub", "Kukatpally market", "Madhapur studio block",
  "Ameerpet metro platform", "Tank Bund walkway", "Hitech City parking basement",
  "Begumpet airfield perimeter", "Somajiguda apartment tower", "Punjagutta cinema",
  "Malakpet rail crossing", "Attapur riverside", "Nampally courthouse loading bay",
  "Manikonda construction site", "Uppal warehouse row", "Bowenpally cold-storage",
  "Falaknuma museum wing", "Shamshabad cargo terminal", "Kompally roadside dhaba",
];

const FILLER_CAUSES: CauseOfDeath[] = [
  "Gunshot", "Strangulation", "Poisoning", "Stabbing", "Blunt force trauma", "Drowning", "Fall from height",
];

function buildAllCasePlans(): CasePlan[] {
  const plans: CasePlan[] = [];
  let fillerIx = 0;
  for (let day = 1; day <= 30; day++) {
    const authored = AUTHORED[day];
    if (authored) {
      plans.push({
        ...authored,
        day,
        number: `Case #${String(day).padStart(3, "0")}`,
      });
    } else {
      const i = fillerIx++;
      plans.push({
        id: `case-${String(day).padStart(3, "0")}`,
        day,
        number: `Case #${String(day).padStart(3, "0")}`,
        title: FILLER_TITLES[i % FILLER_TITLES.length],
        victim: FILLER_VICTIMS[i % FILLER_VICTIMS.length],
        location: FILLER_LOCATIONS[i % FILLER_LOCATIONS.length],
        causeOfDeath: FILLER_CAUSES[i % FILLER_CAUSES.length],
        difficulty: (((day % 5) + 1) as 1 | 2 | 3 | 4 | 5),
        recurringClueId: CLUE_ROTATION[day % CLUE_ROTATION.length],
        synopsis: "Sealed until dispatch releases the briefing.",
      });
    }
  }
  return plans;
}

export const FILE_001: FileDefinition = {
  id: "file-001",
  number: "FILE 001",
  title: "The Crimson Thread",
  tagline: "Thirty nights. Thirty crimes. One hand behind all of them.",
  lore:
    "A single crimson fibre keeps appearing at unrelated murder scenes across the city. Someone is stitching these cases together — and only a detective who works every night for thirty days will see the pattern.",
  totalDays: 30,
  cases: buildAllCasePlans(),
  clues: RECURRING_CLUES,
  characters: RETURNING_CHARACTERS,
  events: MID_SEASON_EVENTS,
};

export function getCasePlan(id: string): CasePlan | undefined {
  return FILE_001.cases.find((c) => c.id === id);
}

export function getRecurringClue(id: string): RecurringClue | undefined {
  return FILE_001.clues.find((c) => c.id === id);
}

export function getCharacter(id: string): ReturningCharacter | undefined {
  return FILE_001.characters.find((c) => c.id === id);
}
