// Photos from Econs Expo 2026, for the previous-edition gallery. Descriptions only say what is visible.
export const gallery2026 = [
  { slug: "hall-wide", alt: "The 2026 conference hall full of participants at their tables" },
  { slug: "fireside", alt: "A guest speaker answers questions during the fireside chat" },
  { slug: "panel", alt: "Guest speakers in conversation on stage in front of participants" },
  { slug: "whiteboard", alt: "A participant draws cost curves on the whiteboard during a crash course" },
  { slug: "hall-clap", alt: "Participants applauding across the hall" },
  { slug: "team-table", alt: "A team smiling at their table, laptops open" },
  { slug: "briefing", alt: "A participant reads the crisis briefing booklet" },
  { slug: "crisis-tables", alt: "Participants around a table during the crisis simulation" },
  { slug: "hall-pitch", alt: "Teams working on laptops during the stock pitch round" },
  { slug: "pitch-room", alt: "Participants present to a classroom, slides on the screen behind them" },
  { slug: "pitch-stand", alt: "A team stands at the front of a classroom to present" },
  { slug: "laptops", alt: "Participants working on laptops and notes at their tables" },
  { slug: "workshop", alt: "Participants at tables across the hall, working through the round" },
  { slug: "tables-wide", alt: "Participants listening at their tables across the hall" },
  { slug: "hall-qa", alt: "Participants at their tables during the Q&A session" },
  { slug: "speaker-chat", alt: "Guest speakers talking with organisers between sessions" },
  { slug: "tokens", alt: "Guest speakers stand at the front of the hall as participants look on" },
  { slug: "speakers-stage", alt: "Guest speakers and organisers stand together at the front of the hall" },
  { slug: "award", alt: "A team is presented with an award at the front of the hall" },
  { slug: "medals", alt: "Gold Econs Expo 2026 winner medals on red, white and blue ribbons" },
  { slug: "trio", alt: "Three participants smiling on the covered walkway" },
  { slug: "friends", alt: "Five participants posing together on the walkway" },
  { slug: "thank-you", alt: "Closing slide reading Thank you for attending Econs Expo 2026" },
];

export type StoryPhoto = {
  slug: string;
  caption: string;
  alt: string;
  size: "small" | "medium" | "large";
  /** Desktop placement: left in vw, top in svh, width in vw, frame aspect ratio. */
  x: number;
  y: number;
  w: number;
  ar: number;
  pos: string;
};

// The nine-frame photo story on the homepage. All from Econs Expo 2026.
export const photoStory: StoryPhoto[] = [
  { slug: "hall-wide", caption: "Inside the 2026 conference hall", alt: "Participants at round tables across the conference hall at Econs Expo 2026", size: "large", x: 40, y: 13, w: 40, ar: 3 / 2, pos: "50% 62%" },
  { slug: "whiteboard", caption: "Cost curves on the whiteboard", alt: "A participant draws cost curves on a whiteboard at Econs Expo 2026", size: "small", x: 88, y: 50, w: 17, ar: 4 / 5, pos: "62% 50%" },
  { slug: "team-table", caption: "A team together at its table", alt: "Six participants smiling at their table with a laptop open at Econs Expo 2026", size: "medium", x: 118, y: 15, w: 26, ar: 3 / 2, pos: "50% 70%" },
  { slug: "briefing", caption: "Reading the crisis briefing", alt: "A participant reads the crisis briefing booklet at Econs Expo 2026", size: "small", x: 152, y: 52, w: 16, ar: 1, pos: "62% 45%" },
  { slug: "hall-pitch", caption: "Teams at work during the pitch round", alt: "Teams working in the hall during the pitch round at Econs Expo 2026", size: "large", x: 182, y: 13, w: 40, ar: 3 / 2, pos: "50% 55%" },
  { slug: "pitch-room", caption: "A presentation in progress", alt: "Participants present to a classroom with slides on the screen at Econs Expo 2026", size: "medium", x: 230, y: 46, w: 26, ar: 3 / 2, pos: "60% 50%" },
  { slug: "crisis-tables", caption: "Participants work through the crisis round", alt: "Participants around a table with papers and laptops in the crisis round at Econs Expo 2026", size: "large", x: 268, y: 13, w: 40, ar: 3 / 2, pos: "45% 55%" },
  { slug: "panel", caption: "A discussion with the guest panel", alt: "Guest speakers in conversation on stage in front of participants at Econs Expo 2026", size: "medium", x: 318, y: 46, w: 26, ar: 3 / 2, pos: "55% 55%" },
  { slug: "award", caption: "Presenting an award at the close", alt: "A team receives an award at the front of the hall at Econs Expo 2026", size: "large", x: 358, y: 18, w: 42, ar: 3 / 2, pos: "42% 70%" },
];

// Short lines of Expo copy set in the open spaces between photographs. `after` is the photo they follow on phones.
export const photoStoryLines = [
  { lines: ["Economics gets", "interesting", "the moment you", "have to use it."], x: 88, y: 15, w: 26, after: 1 },
  { lines: ["Shocks arrive.", "You decide."], x: 152, y: 19, w: 24, after: 3 },
  { lines: ["One briefing,", "one portfolio,", "one pitch."], x: 230, y: 16, w: 26, after: 5 },
  { lines: ["Know it, buzz it,", "explain it."], x: 318, y: 20, w: 26, after: 7 },
];
