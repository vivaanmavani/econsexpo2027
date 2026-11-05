// Event facts. Every field carries its status so nothing provisional is shown as final.
// Source: "Econs Expo Marketing 2027" (Drive), checked 29 Oct 2026.

import { deriveStatus, resolveRegisterHref } from "@/lib/status";

export const site = {
  name: "Econs Expo",
  edition: "2027",
  tagline: "Economics, out loud.",
  description:
    "A student-led inter-school economics conference hosted by St. Joseph's Institution International, Singapore. Buzz in, pitch a portfolio and steer a country through a crisis.",
  // `label` is what people read. `startsAt` is the instant the countdown targets: set it with `confirmed: true`
  // once the organisers confirm a date and time, as ISO with the Singapore offset, e.g. "2027-02-20T09:00:00+08:00".
  date: { label: "20 February 2027", short: "20 Feb 2027", confirmed: false, startsAt: null as string | null },
  venue: {
    name: "St. Joseph's Institution International",
    short: "SJI International",
    address: "490 Thomson Road, Singapore 298191",
  },
  // An estimate, so always shown as expected attendance.
  participants: { label: "Around 150 students", audience: "Students from schools across Singapore", confirmed: false },
  // No sign-up form exists yet. Set its https URL here and every Register link switches to it.
  registerUrl: null as string | null,
  // With a form, an ISO timestamp with +08:00 here counts down to closing first, then hands over to the conference.
  registrationClosesAt: null as string | null,
  instagram: "https://www.instagram.com/econs_expo/",
  instagramHandle: "@econs_expo",
};

export const registerHref = resolveRegisterHref(site.registerUrl);
/** Configuration-only view (no clock) for server-rendered copy such as the FAQs. */
export const baseStatus = deriveStatus(site, 0);

export type Experience = {
  id: "buzzer" | "pitch" | "crisis";
  index: string;
  title: string;
  kicker: string;
  body: string;
  /** The short version printed on the folder insert. */
  surface: string;
  photo: string;
  photoAlt: string;
  photoPos?: string;
  caption: string;
};

// The three planned 2027 experiences. Photos are from 2026 and captioned as such.
export const experiences: Experience[] = [
  {
    id: "buzzer",
    index: "01",
    title: "Economics Buzzer Competition",
    kicker: "Fast recall, under pressure",
    body: "Teams race through rounds of economics questions, from first principles to the headlines. Know it, buzz it, explain it.",
    surface: "Team rounds of economics questions spanning concepts and current issues.",
    photo: "hall-clap",
    photoAlt: "Participants applauding across the hall at Econs Expo 2026",
    photoPos: "50% 60%",
    caption: "2026 · the main hall",
  },
  {
    id: "pitch",
    index: "02",
    title: "Investment Pitch",
    kicker: "One briefing, one portfolio, one pitch",
    body: "After a live economic briefing, your team builds a strategy for a hypothetical $1,000,000 portfolio and defends it to the judges. Beginner, intermediate and advanced categories are planned.",
    surface: "A live briefing, a hypothetical $1,000,000 portfolio and a strategy defended to the judges. Categories are planned.",
    photo: "hall-pitch",
    photoAlt: "Teams working on laptops during the 2026 stock pitch round",
    photoPos: "55% 55%",
    caption: "2026 · stock pitch round",
  },
  {
    id: "crisis",
    index: "03",
    title: "Economic Crisis Simulation",
    kicker: "Shocks arrive. You decide.",
    body: "Take a seat as a nation's ministers. Negotiate, publish policy and respond as economic and political shocks hit, round after round.",
    surface: "Teams act as ministers, negotiate, publish policy and respond to successive shocks.",
    photo: "crisis-tables",
    photoAlt: "Participants around a table during the 2026 crisis simulation",
    photoPos: "45% 50%",
    caption: "2026 · crisis simulation",
  },
];

export type Speaker = { slug: string; name: string; role: string; org: string; bio: string; source: { label: string; href: string } | null };

// Add approved 2027 speakers here. Empty shows the announcement status; the row accepts any number.
export const speakers2027: Speaker[] = [];

// Econs Expo 2026, from the 2026 archive Drive. Previous edition only.
export const edition2026 = {
  date: "Saturday 25 April 2026",
  participants: "72",
  // Photos and titles from the committee's own 2026 records (Marketing 2027 doc). Bios use public sources, linked.
  speakers: [
    {
      slug: "huray",
      name: "Robert Huray",
      role: "Chairman, Southeast Asia",
      org: "Deutsche Bank",
      bio: "Robert Huray joined Deutsche Bank in 2023 from Credit Suisse to cover the bank's largest clients across Singapore, Malaysia and Indonesia.",
      source: { label: "finews.asia", href: "https://www.finews.asia/people/39398-deutsche-bank-hires-southeast-asia-vice-chair" },
    },
    {
      slug: "lim",
      name: "Lim Zi-Kuan",
      role: "Co-Head of M&A, Asia Pacific",
      org: "Deutsche Bank",
      bio: "Lim Zi-Kuan leads mergers and acquisitions for Asia Pacific at Deutsche Bank from Singapore. He joined in 2023 after 20 years at Credit Suisse, most recently as head of M&A for Southeast Asia and frontier markets.",
      source: { label: "finews.asia", href: "https://www.finews.asia/people/39012-credit-suisse-deutsche-bank-lim-zi-kuan" },
    },
    {
      slug: "powdthavee",
      name: "Prof. Nattavudh Powdthavee",
      role: "Professor of Economics",
      org: "Nanyang Technological University",
      bio: "Nick Powdthavee is a behavioural economist who studies happiness and wellbeing. He joined NTU in 2022 from Warwick Business School, and wrote The Happiness Equation: The Surprising Economics of Our Most Valuable Asset.",
      source: { label: "IZA", href: "https://www.iza.org/person/2823/nattavudh-powdthavee" },
    },
    {
      slug: "kannan",
      name: "Dr Prakash Kannan",
      role: "Chief Economist",
      org: "GIC",
      bio: "Prakash Kannan is Chief Economist and Director of the Economics & Investment Strategy department at GIC, where he shapes the top-down view of the investment environment and the asset allocation strategy. Before joining GIC in 2012 he worked at the International Monetary Fund and Bank Negara Malaysia.",
      source: null as { label: string; href: string } | null,
    },
  ] as Speaker[],
  programme: ["Guest speaker fireside and panel", "Economics crash courses", "Stock propositions", "Econs Crisis simulation", "Closing ceremony and medals"],
};
