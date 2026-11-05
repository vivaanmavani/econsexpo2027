// Checks the date, registration and countdown rules. Run with: node scripts/status.test.mjs (Node 22.18+ or 24)
import assert from "node:assert/strict";
import { deriveStatus, parseInstant, signupUrl, splitRemaining } from "../src/lib/status.ts";

const base = { name: "Econs Expo", edition: "2027", date: { label: "20 February 2027", confirmed: false, startsAt: null }, registerUrl: null, registrationClosesAt: null };
const at = (iso) => Date.parse(iso);
const form = "https://forms.example.com/expo";

// Reference snapshot: provisional date, no form, no countdown, even if a timestamp is present.
let s = deriveStatus(base, at("2026-11-05T00:00:00+08:00"));
assert.equal(s.dateNote, "To be confirmed");
assert.equal(s.registerHref, "/attend/#register");
assert.equal(s.registerLabel, "Register interest");
assert.equal(s.registrationNote, "Registration has not opened yet.");
assert.equal(s.countdown, null);
s = deriveStatus({ ...base, date: { ...base.date, startsAt: "2027-02-20T09:00:00+08:00" } }, 0);
assert.equal(s.countdown, null, "an unconfirmed date never counts down");

// Timestamps need an explicit offset; forms must be https.
assert.equal(parseInstant("2027-02-20T09:00:00"), null);
assert.equal(parseInstant("not a date+08:00"), null);
assert.equal(parseInstant("2027-02-20T09:00:00+08:00"), at("2027-02-20T01:00:00Z"));
assert.equal(signupUrl("javascript:alert(1)"), null);
assert.equal(signupUrl("http://forms.example.com"), null);
assert.equal(signupUrl(form), form);

// Confirmed date and time: conference countdown, shown in Singapore time.
const confirmed = { ...base, date: { label: "20 February 2027", confirmed: true, startsAt: "2027-02-20T09:00:00+08:00" } };
s = deriveStatus(confirmed, at("2027-02-19T09:00:00+08:00"));
assert.equal(s.dateNote, null);
assert.equal(s.countdown.remainingMs, 86400000);
assert.match(s.countdown.targetLabel, /Saturday.*20 February 2027.*9:00.*Singapore time/i);

// Form with a deadline: registration counts down first, then hands over to the conference.
const open = { ...confirmed, registerUrl: form, registrationClosesAt: "2027-02-01T23:59:00+08:00" };
s = deriveStatus(open, at("2027-02-01T23:58:59+08:00"));
assert.equal(s.registration, "open");
assert.equal(s.registerHref, form);
assert.equal(s.registerExternal, true);
assert.equal(s.countdown.label, "Registration closes in");
assert.equal(s.countdown.remainingMs, 1000);
s = deriveStatus(open, at("2027-02-01T23:59:00+08:00"));
assert.equal(s.registration, "closed");
assert.equal(s.registerHref, "/attend/");
assert.equal(s.registerExternal, false);
assert.equal(s.countdown.label, "Econs Expo 2027 begins in");

// A deadline without a form is ignored. An open form with a provisional date has no conference countdown.
assert.equal(deriveStatus({ ...base, registrationClosesAt: "2027-02-01T23:59:00+08:00" }, 0).countdown, null);
s = deriveStatus({ ...base, registerUrl: form }, 0);
assert.equal(s.registration, "open");
assert.equal(s.countdown, null);

// After the start: no countdown, registration closed. Remaining time clamps at zero.
s = deriveStatus(open, at("2027-02-20T09:00:00+08:00"));
assert.equal(s.started, true);
assert.equal(s.countdown, null);
assert.equal(s.registration, "closed");
assert.deepEqual(splitRemaining(-5000), { days: 0, hours: 0, minutes: 0, seconds: 0 });
assert.deepEqual(splitRemaining(90061000), { days: 1, hours: 1, minutes: 1, seconds: 1 });
console.log("status rules: all passed");
