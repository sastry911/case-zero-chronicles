export type EvidenceTag = "physical" | "witness" | "document" | "digital";
export type SuspicionLevel = "low" | "medium" | "high" | "prime";
export type Importance = "low" | "medium" | "high" | "critical";

export interface TimelineEvent {
  id: string;
  time: string;
  label: string;
  detail: string;
}

export interface Evidence {
  id: string;
  label: string;
  summary: string;
  detail: string;
  tag: EvidenceTag;
  importance: Importance;
  xp: number;
  location: string;
  collectedAt: string;
  collectedBy: string;
  chainOfCustody: string[];
  relatedSuspectIds: string[];
  /** Adds points to each suspect's suspicion meter when this evidence is examined. */
  suspicionImpact: Record<string, number>;
  notebookNote: string;
  timelineUnlock?: TimelineEvent;
  /** Optional forensic lab report — only revealed once evidence is collected. */
  forensicReport?: string;
  /** If true, the clue looks meaningful but does not point to the true killer. */
  redHerring?: boolean;
}

export interface Suspect {
  id: string;
  name: string;
  initials: string;
  occupation: string;
  relationship: string;
  alibi: string;
  statement: string;
  baselineSuspicion: number;
  motive: string;
  timeline: TimelineEvent[];
  /** Revealed once the suspect has been interviewed. */
  secret?: string;
}

export interface CrimeSceneHotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  evidenceId: string;
}

export interface CaseChoice {
  id: string;
  label: string;
  detail?: string;
}

export interface CaseObjective {
  id: string;
  label: string;
  kind: "hotspots" | "evidence" | "suspects" | "timeline" | "forensics" | "notebook";
  target?: number;
}

export interface ReconstructionBeat {
  time: string;
  label: string;
  detail: string;
}

export interface CaseSolution {
  killerId: string;
  weaponId: string;
  motiveId: string;
  keyEvidenceIds: string[];
  reconstruction: ReconstructionBeat[];
  epilogue: string;
}

export interface Case {
  id: string;
  number: string;
  title: string;
  blurb: string;
  victim: {
    name: string;
    age: number;
    occupation: string;
    causeOfDeath: string;
    timeOfDeath: string;
  };
  location: string;
  date: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedMinutes: number;
  briefing: string;
  evidence: Evidence[];
  suspects: Suspect[];
  hotspots: CrimeSceneHotspot[];
  baseTimeline: TimelineEvent[];
  weaponOptions: CaseChoice[];
  motiveOptions: CaseChoice[];
  objectives: CaseObjective[];
  solution: CaseSolution;
}

export const case001: Case = {
  id: "case-001",
  number: "Case #001",
  title: "The Last Train",
  blurb:
    "A renowned architect is found dead in the rear car of the 23:47 express. Five passengers. One has something to hide.",
  victim: {
    name: "Emily Carter",
    age: 38,
    occupation: "Principal Architect, Carter & Vance Studio",
    causeOfDeath: "Blunt-force trauma to the occipital region",
    timeOfDeath: "Between 23:48 and 23:54",
  },
  location: "Hyderabad Metro — Northbound Express, Car 7",
  date: "June 30, 2026",
  difficulty: 4,
  estimatedMinutes: 15,
  briefing:
    "At 00:12, transit police were called to the rear car of the 23:47 northbound express. Emily Carter, principal architect of a contested civic project, was found slumped against the rear vestibule door. Her phone was wiped, her satchel emptied of one folder, and a single torn ticket stub lay at her feet. Five passengers boarded that car. None left between 23:47 and 00:12. The killer is still on board.",
  evidence: [
    {
      id: "ev-01",
      label: "Torn ticket stub",
      summary: "Carriage 7 · Seat 12B · Punched 23:51",
      detail:
        "Half of a paper ticket recovered beside the victim. The punch mark dates the entry into Car 7 at 23:51 — four minutes after departure. The torn edge matches no stub from the four ticketed passengers, suggesting an additional, unticketed entrant.",
      tag: "physical",
      importance: "high",
      xp: 25,
      location: "Floor, rear vestibule, Car 7",
      collectedAt: "00:18",
      collectedBy: "Officer Reyna Kohli",
      chainOfCustody: ["Officer Kohli (00:18)", "Forensics, Lab B (00:54)", "Evidence locker CZ-001 (01:32)"],
      relatedSuspectIds: ["sus-02", "sus-04"],
      suspicionImpact: { "sus-02": 12, "sus-04": 8 },
      notebookNote: "Punched at 23:51 — someone boarded Car 7 after departure.",
      timelineUnlock: { id: "tu-01", time: "23:51", label: "Unticketed entry", detail: "An extra passenger boards Car 7 mid-route." },
      forensicReport: "Lab B: paper stock matches metro-issue booklets. Ink residue on the punch dates the mark to within four minutes of the argument. No fingerprints — the entrant wore gloves.",
    },
    {
      id: "ev-02",
      label: "Conductor's testimony",
      summary: "Two figures arguing near rear door at 23:51",
      detail:
        "Daniel Okafor, the night conductor, places two passengers in heated conversation near the rear vestibule of Car 7 at 23:51 — the same minute the rogue ticket was punched. He describes a tall man in a charcoal coat and a woman in a dark green scarf. Voss owns a dark green scarf; Hale wears charcoal.",
      tag: "witness",
      importance: "high",
      xp: 25,
      location: "Conductor's deposition, Hyderabad Metro HQ",
      collectedAt: "01:05",
      collectedBy: "Det. Alex Mercer",
      chainOfCustody: ["Mercer (01:05)", "Case file CZ-001 (01:40)"],
      relatedSuspectIds: ["sus-01", "sus-02", "sus-04"],
      suspicionImpact: { "sus-01": 8, "sus-02": 10, "sus-04": 4 },
      notebookNote: "Okafor saw two passengers arguing near the rear door at 23:51.",
      timelineUnlock: { id: "tu-02", time: "23:51", label: "Argument observed", detail: "Conductor reports raised voices in Car 7." },
      forensicReport: "Deposition cross-checked against Okafor's radio log. The 'woman in a green scarf' detail conflicts with the tunnel-light audit — that stretch of Car 7 was too dark to read colour. Testimony downgraded.",
    },
    {
      id: "ev-03",
      label: "Encrypted message",
      summary: "Sent from victim's phone at 23:44 — burner recipient",
      detail:
        "Three minutes before departure, Carter sent a Signal message reading: 'If I don't make it off this train, the folder is in Aune's hands.' The recipient's number is a burner, registered the same morning at a kiosk two stations south.",
      tag: "digital",
      importance: "critical",
      xp: 35,
      location: "Cloud backup, Forensics Lab B",
      collectedAt: "02:11",
      collectedBy: "Digital Forensics, A. Mehta",
      chainOfCustody: ["Mehta (02:11)", "Encrypted evidence vault (02:40)"],
      relatedSuspectIds: ["sus-05"],
      suspicionImpact: { "sus-01": 4 },
      notebookNote: "Victim believed her life was at risk before boarding. Folder entrusted to Sister Aune.",
      timelineUnlock: { id: "tu-03", time: "23:44", label: "Premonition message", detail: "Carter warns an unknown contact she may not survive the ride." },
      forensicReport: "Digital forensics: the burner SIM pings a tower two stations south. Recovered metadata proves message reached Aune's device before departure. No reply was ever sent.",
    },
    {
      id: "ev-04",
      label: "Annotated blueprint",
      summary: "Civic-center plans, folded in victim's coat",
      detail:
        "A blueprint for the contested Banjara Hills civic center, annotated in red. The annotations flag structural shortcuts on floors 3–7 — the same floors signed off by Eleanor Voss six weeks ago. A signature panel has been torn away.",
      tag: "document",
      importance: "critical",
      xp: 35,
      location: "Inside victim's coat pocket",
      collectedAt: "00:31",
      collectedBy: "Officer Reyna Kohli",
      chainOfCustody: ["Kohli (00:31)", "Forensics, Lab B (01:02)", "Evidence locker CZ-001 (01:45)"],
      relatedSuspectIds: ["sus-01", "sus-03"],
      suspicionImpact: { "sus-01": 18, "sus-03": -4 },
      notebookNote: "Victim was documenting structural shortcuts approved by Voss.",
      timelineUnlock: { id: "tu-04", time: "23:30", label: "Motive surfaces", detail: "Blueprint reveals Voss as Carter's target." },
      forensicReport: "Paper analysis: the missing signature panel was torn, not cut. Fibre residue on the tear matches a brass edge — likely the corner of a bookend or heavy office object, not scissors or a blade.",
    },
    {
      id: "ev-05",
      label: "CCTV gap",
      summary: "Car 7 camera dark from 23:49 to 23:55",
      detail:
        "Metro CCTV shows the Car 7 interior feed cut from 23:49:08 to 23:55:42. Logs indicate the breaker was tripped manually from the conductor's panel — accessible only with a staff key.",
      tag: "digital",
      importance: "medium",
      xp: 20,
      location: "Metro Control, Server Room 2",
      collectedAt: "03:20",
      collectedBy: "Digital Forensics, A. Mehta",
      chainOfCustody: ["Mehta (03:20)", "Encrypted evidence vault (03:55)"],
      relatedSuspectIds: ["sus-04"],
      suspicionImpact: { "sus-04": 16 },
      notebookNote: "Camera cut required a staff key — narrows access to crew.",
      timelineUnlock: { id: "tu-05", time: "23:49", label: "Cameras blacked out", detail: "Someone with a staff key kills the Car 7 feed." },
    },
    {
      id: "ev-06",
      label: "Brass cufflink",
      summary: "Engraved 'M.H.', found under seat 12A",
      detail:
        "A single brass cufflink engraved with the initials 'M.H.' Marcus Hale claims he lost the pair months ago, but the engraving style matches a bespoke set commissioned in May.",
      tag: "physical",
      importance: "critical",
      xp: 35,
      location: "Under seat 12A, Car 7",
      collectedAt: "00:42",
      collectedBy: "Officer Reyna Kohli",
      chainOfCustody: ["Kohli (00:42)", "Forensics, Lab B (01:12)", "Evidence locker CZ-001 (01:50)"],
      relatedSuspectIds: ["sus-02"],
      suspicionImpact: { "sus-02": 20 },
      notebookNote: "Cufflink initials 'M.H.' place Hale at the scene despite his denial.",
      timelineUnlock: { id: "tu-06", time: "23:52", label: "Hale placed at scene", detail: "Cufflink ties Marcus Hale to seat 12A." },
    },
  ],
  suspects: [
    {
      id: "sus-01",
      name: "Eleanor Voss",
      initials: "EV",
      occupation: "Managing Partner, Voss & Carter Holdings",
      relationship: "Business partner of 11 years",
      alibi: "Claims she was in Car 4, reviewing contracts. No witness corroborates.",
      statement:
        "'Emily and I disagreed about the Banjara project, yes — but we disagreed about everything. That's how the firm worked. I would never have hurt her.'",
      baselineSuspicion: 30,
      motive: "Disputed civic contract worth ₹42 crore; Carter was preparing to expose her sign-offs.",
      timeline: [
        { id: "t1", time: "23:30", label: "Boarded at platform 3", detail: "Spotted by station agent buying a coffee." },
        { id: "t2", time: "23:47", label: "Train departs", detail: "Voss seated in Car 4, per her statement." },
        { id: "t3", time: "23:51", label: "Whereabouts unverified", detail: "No witness; conductor describes a woman in a green scarf in Car 7." },
        { id: "t4", time: "00:12", label: "Found in Car 4", detail: "Reading a contract when transit police arrived." },
      ],
      secret: "Under interrogation, Voss admits she left Car 4 briefly at 23:53 — to make a call about the very sign-offs Carter was preparing to publish.",
    },
    {
      id: "sus-02",
      name: "Marcus Hale",
      initials: "MH",
      occupation: "Former apprentice, freelance draughtsman",
      relationship: "Apprentice publicly dismissed by Carter two years ago",
      alibi: "Says he was asleep in Car 6 the entire trip.",
      statement:
        "'She ruined my career in front of half the industry. I hated her, sure. But I've been clean for two years. I wouldn't throw that away.'",
      baselineSuspicion: 35,
      motive: "Career destroyed by Carter's public dismissal; recent debts tied to forged credentials.",
      timeline: [
        { id: "t1", time: "23:39", label: "Boarded at platform 3", detail: "Carrying a single satchel, hood up." },
        { id: "t2", time: "23:47", label: "Train departs", detail: "Seated alone in Car 6." },
        { id: "t3", time: "23:51", label: "Seen near Car 7 vestibule", detail: "Matches conductor's 'tall man in charcoal coat' description." },
        { id: "t4", time: "00:09", label: "Returned to Car 6", detail: "Observed by another passenger, breathing heavily." },
      ],
      secret: "When pressed, Hale's story cracks — he admits he boarded the 23:47 specifically because he knew Carter's Monday commute. He denies the killing. He denies the cufflink. He does not deny watching her.",
    },
    {
      id: "sus-03",
      name: "Junko Reyes",
      initials: "JR",
      occupation: "Investigative journalist, The Deccan Ledger",
      relationship: "Source-handler for Carter's whistle-blowing on the civic project",
      alibi: "In Car 2, recording an interview. Audio file timestamps check out.",
      statement:
        "'Emily was about to break a story that would have ended Voss. I wanted her alive more than anyone on this train.'",
      baselineSuspicion: 15,
      motive: "None apparent — Carter was her source.",
      timeline: [
        { id: "t1", time: "23:42", label: "Boarded at platform 3", detail: "With recording equipment." },
        { id: "t2", time: "23:47", label: "Train departs", detail: "Begins interview in Car 2." },
        { id: "t3", time: "23:51", label: "Recording continues", detail: "Audio places her in Car 2 throughout." },
        { id: "t4", time: "00:12", label: "Cooperating with police", detail: "Volunteered her recordings immediately." },
      ],
      secret: "Reyes quietly confirms she has a second copy of Carter's blueprint annotations. She will publish, with or without a killer named.",
    },
    {
      id: "sus-04",
      name: "Daniel Okafor",
      initials: "DO",
      occupation: "Night conductor, Hyderabad Metro",
      relationship: "Stranger to the victim — but holds the only staff key",
      alibi: "On duty, walking the train. No fixed location.",
      statement:
        "'I saw the two of them arguing near the rear door. I should have stopped. I didn't. That's all I know.'",
      baselineSuspicion: 25,
      motive: "Recent gambling debts; rumours of taking unrecorded payments.",
      timeline: [
        { id: "t1", time: "23:47", label: "Train departs", detail: "Walking Car 5 toward the rear." },
        { id: "t2", time: "23:49", label: "CCTV breaker tripped", detail: "Conductor's panel — staff key required." },
        { id: "t3", time: "23:51", label: "Witnessed argument in Car 7", detail: "Describes a man and a woman near the rear door." },
        { id: "t4", time: "00:08", label: "Reports body", detail: "Calls it in from the conductor's intercom." },
      ],
      secret: "Okafor confesses: he was paid ₹40,000 that morning to kill the Car 7 feed for six minutes. He didn't know why. He didn't ask.",
    },
    {
      id: "sus-05",
      name: "Sister Aune",
      initials: "SA",
      occupation: "Train chaplain, Metro Welfare Trust",
      relationship: "Carter's confidante; named in the encrypted message",
      alibi: "In Car 1, with two other passengers in prayer.",
      statement:
        "'She gave me a folder, yes. She asked me to keep it safe. I did not open it. I never would.'",
      baselineSuspicion: 10,
      motive: "None established; Carter trusted her with the folder.",
      timeline: [
        { id: "t1", time: "23:35", label: "Met Carter at platform", detail: "Brief exchange — folder handed over." },
        { id: "t2", time: "23:47", label: "Train departs", detail: "Begins prayer service in Car 1." },
        { id: "t3", time: "23:51", label: "In Car 1", detail: "Witnessed by two passengers." },
        { id: "t4", time: "00:15", label: "Surrenders folder", detail: "Hands sealed folder to transit police." },
      ],
      secret: "Aune opened the folder. She read enough to know Carter was right. She sealed it again before the police arrived.",
    },
  ],
  hotspots: [
    { id: "hs-01", x: 62, y: 84, label: "Torn paper on floor", evidenceId: "ev-01" },
    { id: "hs-02", x: 38, y: 30, label: "Conductor's vestibule", evidenceId: "ev-02" },
    { id: "hs-03", x: 18, y: 22, label: "Victim's phone glow", evidenceId: "ev-03" },
    { id: "hs-04", x: 70, y: 78, label: "Folded blueprint", evidenceId: "ev-04" },
    { id: "hs-05", x: 84, y: 14, label: "Dead CCTV camera", evidenceId: "ev-05" },
    { id: "hs-06", x: 50, y: 68, label: "Glint under seat 12A", evidenceId: "ev-06" },
  ],
  baseTimeline: [
    { id: "b1", time: "23:30", label: "Passengers gather", detail: "Five passengers board the 23:47 northbound at platform 3." },
    { id: "b2", time: "23:47", label: "Train departs", detail: "Doors close. No further entries or exits until 00:12." },
    { id: "b3", time: "00:12", label: "Body discovered", detail: "Conductor finds Emily Carter slumped against the rear vestibule." },
  ],
  weaponOptions: [
    { id: "w-torch", label: "Weighted maglite", detail: "Heavy service torch. Standard metro staff issue." },
    { id: "w-wrench", label: "Vestibule wrench", detail: "Kept in the rear-door emergency locker." },
    { id: "w-bookend", label: "Brass bookend", detail: "From the victim's satchel — a gift from her studio." },
    { id: "w-umbrella", label: "Umbrella handle", detail: "Solid teak. Belonged to a passenger." },
  ],
  motiveOptions: [
    { id: "m-revenge", label: "Career revenge", detail: "A public humiliation, two years unpaid." },
    { id: "m-contract", label: "Contract cover-up", detail: "Silence Carter before she went public." },
    { id: "m-debts", label: "Paid to silence", detail: "Gambling debts, a quiet envelope." },
    { id: "m-faith", label: "Personal faith", detail: "A confessor turned zealot." },
  ],
  objectives: [
    { id: "obj-hotspots", label: "Sweep every hotspot on the scene", kind: "hotspots" },
    { id: "obj-evidence", label: "Collect all six pieces of evidence", kind: "evidence" },
    { id: "obj-suspects", label: "Interview all five passengers", kind: "suspects" },
    { id: "obj-timeline", label: "Reconstruct the full timeline", kind: "timeline" },
    { id: "obj-forensics", label: "Read every forensic report", kind: "forensics" },
    { id: "obj-notebook", label: "Pin at least three deductions", kind: "notebook", target: 3 },
  ],
  solution: {
    killerId: "sus-02",
    weaponId: "w-bookend",
    motiveId: "m-revenge",
    keyEvidenceIds: ["ev-06", "ev-02", "ev-04", "ev-01"],
    reconstruction: [
      { time: "23:44", label: "The warning", detail: "Carter, sensing she is being followed, messages Sister Aune and hands off the folder at the platform." },
      { time: "23:47", label: "Departure", detail: "The 23:47 leaves platform 3. Hale is already aboard in Car 6, waiting." },
      { time: "23:49", label: "Cameras die", detail: "Okafor kills the Car 7 feed for an unrelated bribe — accidentally handing Hale the cover he needed." },
      { time: "23:51", label: "The confrontation", detail: "Hale slips into Car 7, punches a fresh ticket, and corners Carter at the vestibule. Voice raised — the conductor hears it and moves on." },
      { time: "23:52", label: "The blow", detail: "Hale swings the brass bookend from Carter's own satchel. One strike. He tears the signature panel from the blueprint and vanishes back to Car 6." },
      { time: "00:12", label: "Discovery", detail: "The lights come up at the tunnel exit. Okafor finds the body. Carter's folder is already safe with Aune." },
    ],
    epilogue:
      "Marcus Hale killed Emily Carter for a career she took from him two years earlier. The bookend was a small cruelty — Carter had gifted it to the studio the year she promoted him, and then, a year later, fired him with it on the shelf behind her.",
  },
};


export const allCases: Case[] = [case001];

export function getCaseById(id: string): Case | undefined {
  return allCases.find((c) => c.id === id);
}

export function suspicionBand(score: number): SuspicionLevel {
  if (score >= 80) return "prime";
  if (score >= 55) return "high";
  if (score >= 30) return "medium";
  return "low";
}
