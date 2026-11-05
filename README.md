# Econs Expo 2027

The website for Econs Expo 2027, the student-led inter-school economics conference hosted by SJI International.

Design direction: one continuous journey from cream paper to deep forest and back, with graph-paper
texture, the supply-and-demand symbol and small touches of gold. The homepage tokens are in `src/app/expo.css`.

## Stack

Next.js (static export), React, TypeScript, GSAP (ScrollTrigger, DrawSVG) and Lenis. No backend.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/
```

## Updating content

- Event facts, the three experiences and the 2026 edition: `src/content/site.ts`.
  Set `registerUrl` once a sign-up form exists, and every Register button switches to it.
- Countdown: set `date.confirmed: true` and `date.startsAt` (ISO with `+08:00`) once the date and time are
  confirmed. With a form, `registrationClosesAt` counts down to closing first. The rules are in `src/lib/status.ts`.
- 2027 speakers: add approved people to `speakers2027` in `src/content/site.ts`.
- Photo story order, captions and placement: `photoStory` in `src/content/gallery.ts`.
- The committee: `src/content/team.ts`. Only add social links a person has approved.
- Photos: put originals in a folder and run `node scripts/media.mjs <photos-dir> <montage.mp4>`.
  It writes AVIF and WebP at 640, 1280 and 2048 px, plus the silent montage loops.

## Checks

`npm run lint`, then `node scripts/status.test.mjs` for the date, registration and countdown rules.

`node scripts/shoot.cjs <url> <out-dir> 1440,390` captures scroll screenshots and reports
console errors and horizontal overflow.
