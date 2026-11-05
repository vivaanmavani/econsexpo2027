// One place decides what the site says about the date, registration and the countdown.
// Pure functions of the configured facts and the clock, so home, nav, closing and Attend always agree.

export const ATTEND_PATH = "/attend/";
export const REGISTER_PATH = "/attend/#register";

export type StatusInput = {
  name: string;
  edition: string;
  date: { label: string; confirmed: boolean; startsAt: string | null };
  registerUrl: string | null;
  registrationClosesAt: string | null;
};

export type Countdown = { label: string; iso: string; targetLabel: string; remainingMs: number };

export type EventStatus = {
  dateLabel: string;
  dateNote: string | null;
  registration: "pending" | "open" | "closed";
  registerHref: string;
  registerLabel: string;
  registerExternal: boolean;
  registrationNote: string;
  countdown: Countdown | null;
  started: boolean;
};

/** Only absolute instants count: an ISO timestamp with an explicit offset, such as 2027-02-20T09:00:00+08:00. */
export function parseInstant(value: string | null): number | null {
  if (!value || !/(Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : null;
}

/** The official form, if a valid https address has been configured. */
export function signupUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

export function resolveRegisterHref(value: string | null) {
  return signupUrl(value) ?? REGISTER_PATH;
}

const singapore = new Intl.DateTimeFormat("en-SG", {
  timeZone: "Asia/Singapore",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
export const formatInstant = (t: number) => `${singapore.format(t)}, Singapore time`;

export function deriveStatus(s: StatusInput, now: number): EventStatus {
  const url = signupUrl(s.registerUrl);
  const closes = url ? parseInstant(s.registrationClosesAt) : null;
  const closed = closes !== null && now >= closes;
  const start = s.date.confirmed ? parseInstant(s.date.startsAt) : null;
  const started = start !== null && now >= start;
  const title = `${s.name} ${s.edition}`;

  let countdown: Countdown | null = null;
  if (closes !== null && !closed) {
    countdown = {
      label: "Registration closes in",
      iso: s.registrationClosesAt!,
      targetLabel: `Registration closes ${formatInstant(closes)}`,
      remainingMs: Math.max(0, closes - now),
    };
  } else if (start !== null && !started) {
    countdown = {
      label: `${title} begins in`,
      iso: s.date.startsAt!,
      targetLabel: `${title} begins ${formatInstant(start)}`,
      remainingMs: Math.max(0, start - now),
    };
  }

  const registration = !url ? "pending" : closed || started ? "closed" : "open";
  return {
    dateLabel: s.date.label,
    dateNote: s.date.confirmed ? null : "To be confirmed",
    registration,
    registerHref: registration === "open" ? url! : registration === "pending" ? REGISTER_PATH : ATTEND_PATH,
    registerLabel: registration === "open" ? "Register now" : registration === "pending" ? "Register interest" : "See event details",
    registerExternal: registration === "open",
    registrationNote:
      registration === "open" ? "Registration is open." : registration === "pending" ? "Registration has not opened yet." : "Registration has closed.",
    countdown,
    started,
  };
}

/** Days, hours, minutes and seconds left, clamped at zero. */
export function splitRemaining(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor(s / 3600) % 24, minutes: Math.floor(s / 60) % 60, seconds: s % 60 };
}
