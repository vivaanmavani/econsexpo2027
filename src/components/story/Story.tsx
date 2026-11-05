"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { Buzzer, Portfolio, Shock, ASSETS, type Split } from "@/components/ExperienceWidgets";
import { experiences, site, registerHref } from "@/content/site";
import { useGsap, prefersReducedMotion } from "@/lib/motion";

// The notebook graph is 600 × 460 with its origin at (60, 410).
type Shape = { a: string; b: string; bOn: boolean; x: string; y: string };

const shapes: Shape[] = [
  // Scarcity: a production possibility frontier, and the one Econs Expo pushes out.
  { a: "M 60 130 C 250 130, 380 240, 400 410", b: "M 60 70 C 330 70, 480 230, 500 410", bOn: true, x: "everything else", y: "economics" },
  // The Buzzer: points climbing one buzz at a time.
  { a: "M 60 410 L 130 410 L 130 345 L 210 345 L 210 285 L 300 285 L 300 205 L 390 205 L 390 135 L 480 135 L 480 70 L 560 70", b: "M 560 70 L 561 70", bOn: false, x: "seconds", y: "points" },
  // The Pitch: a portfolio that has to be defended, wiggle by wiggle.
  { a: "M 60 260 L 100 238 L 130 272 L 170 210 L 210 232 L 250 178 L 282 204 L 320 150 L 352 192 L 392 128 L 430 150 L 470 98 L 502 122 L 552 78", b: "M 60 260 L 570 260", bOn: true, x: "time", y: "value" },
  // The Crisis: demand and supply, about to be knocked over.
  { a: "M 110 90 L 520 380", b: "M 110 380 L 520 90", bOn: true, x: "quantity", y: "price" },
  // Equilibrium: the market settles, and the point is you.
  { a: "M 110 90 L 520 380", b: "M 110 380 L 520 90", bOn: true, x: "quantity", y: "price" },
];

const photos = [
  { slug: "hall-wide", alt: "The 2026 conference hall full of students at their tables", cap: "2026 · the whole hall" },
  { slug: "hall-clap", alt: "Students applauding across the hall at Econs Expo 2026", cap: "2026 · the main hall" },
  { slug: "hall-pitch", alt: "Teams working on laptops during the 2026 stock pitch round", cap: "2026 · stock pitch round" },
  { slug: "crisis-tables", alt: "Delegates around a table during the 2026 crisis simulation", cap: "2026 · crisis simulation" },
  { slug: "award", alt: "A team is presented with an award at the front of the hall in 2026", cap: "2026 · the awards" },
];

const titles = ["Scarcity", "The Buzzer", "The Pitch", "The Crisis", "Equilibrium"];

/**
 * The story of the day, told as one graph in a notebook. The graph stays pinned while the chapters
 * scroll past, and redraws itself for each one: scarcity, the three experiences, then equilibrium.
 */
export function Story() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [split, setSplit] = useState<Split>({ equities: 40, bonds: 30, property: 20, cash: 10 });
  const [shocked, setShocked] = useState(false);
  const { gsap, ScrollTrigger } = useGsap();

  // Which chapter is in the middle of the screen.
  useEffect(() => {
    const el = root.current!;
    const triggers = Array.from(el.querySelectorAll<HTMLElement>(".st__ch")).map((ch, i) =>
      ScrollTrigger.create({
        trigger: ch,
        start: "top 60%",
        end: "bottom 60%",
        onToggle: (self) => self.isActive && setActive(i),
      }),
    );
    if (prefersReducedMotion()) return () => triggers.forEach((t) => t.kill());
    const small = window.matchMedia("(max-width: 860px)").matches;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>(".st__ch").forEach((ch) => {
        gsap.fromTo(
          ch.querySelectorAll(".st__reveal"),
          { autoAlpha: 0, y: small ? 22 : 40 },
          { autoAlpha: 1, y: 0, duration: small ? 0.7 : 0.9, stagger: small ? 0.05 : 0.08, ease: "power3.out", scrollTrigger: { trigger: ch, start: "top 72%" } },
        );
      });
      gsap.fromTo(".st__board", { autoAlpha: 0, y: 60, rotate: 2 }, { autoAlpha: 1, y: 0, rotate: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 70%" } });
    }, el);
    return () => {
      triggers.forEach((t) => t.kill());
      ctx.revert();
    };
  }, [gsap, ScrollTrigger]);

  // Redraw the graph for the chapter.
  useEffect(() => {
    const el = root.current!;
    const s = shapes[active];
    const d = prefersReducedMotion() ? 0 : 1.1;
    const tl = gsap.timeline({ defaults: { duration: d, ease: "power3.inOut" } });
    tl.to(el.querySelector(".st__a"), { morphSVG: s.a }, 0)
      .to(el.querySelector(".st__b"), { morphSVG: s.b, autoAlpha: s.bOn ? 1 : 0 }, 0);
    const ann = el.querySelector(`.st__ann--${active}`);
    if (ann && d) tl.fromTo(ann.querySelectorAll("path"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.7, stagger: 0.1, ease: "power2.out" }, 0.6);
    if (active === 3 && d) {
      // The shock lands on its own the first time, so the chapter shows its point.
      const id = window.setTimeout(() => setShocked(true), 900);
      return () => {
        window.clearTimeout(id);
        tl.kill();
      };
    }
    return () => {
      tl.kill();
    };
  }, [active, gsap]);

  useEffect(() => {
    if (!shocked || prefersReducedMotion()) return;
    gsap.fromTo(root.current!.querySelector(".st__paper"), { x: -10 }, { x: 0, duration: 0.6, ease: "elastic.out(1.2, 0.25)" });
  }, [shocked, gsap]);

  const s = shapes[active];
  const xp = Object.fromEntries(experiences.map((e) => [e.id, e]));

  return (
    <section className="st paper-grid" id="story" ref={root} aria-label="The story of the day, in five chapters">
      <div className="wrap st__grid">
        <div className="st__stick">
          <div className="st__board" data-ch={active} data-shocked={shocked && active === 3 ? "" : undefined}>
            <ol className="st__rail" aria-label="Chapters">
              {titles.map((t, i) => (
                <li key={t} className={i === active ? "is-on" : i < active ? "is-past" : undefined}>
                  <a href={`#ch-${i + 1}`} aria-current={i === active ? "step" : undefined}>
                    <span className="tabular">0{i + 1}</span>
                    <span className="st__rail-t">{t}</span>
                  </a>
                </li>
              ))}
            </ol>
            <div className="st__paper">
              <svg className="st__graph ink" viewBox="0 0 600 460" aria-hidden="true">
                <path className="st__axes" d="M 60 22 L 60 410 L 580 410 M 50 36 L 60 20 L 70 36 M 566 400 L 582 410 L 566 420" />
                <text key={`y${active}`} className="st__axt" x={74} y={34}>{s.y}</text>
                <text key={`x${active}`} className="st__axt" x={576} y={446} textAnchor="end">{s.x}</text>
                <path className="st__b" d={shapes[0].b} />
                <path className="st__a" d={shapes[0].a} />

                <g className="st__ann st__ann--0">
                  <path className="st__link" d="M 452 352 C 470 290, 470 210, 428 162" />
                  <circle cx={420} cy={150} r={9} className="st__pt" />
                  <path d="M 476 62 C 494 90, 470 126, 432 144 M 432 144 L 446 128 M 432 144 L 452 146" />
                  <text x={290} y={52}>Expo day: more of both</text>
                  <path d="M 300 316 L 404 266 M 386 264 L 405 265 L 398 282" />
                  <text x={90} y={350}>the frontier moves out</text>
                </g>
                <g className="st__ann st__ann--1">
                  <path className="st__link" d="M 446 352 C 420 330, 350 320, 308 294" />
                  <path d="M 300 205 C 300 170, 290 160, 270 150" />
                  <text x={150} y={142}>buzz!</text>
                  <path d="M 480 135 C 470 110, 455 104, 440 102" />
                  <text x={330} y={98}>buzz!</text>
                </g>
                <g className="st__ann st__ann--2">
                  <path className="st__link" d="M 452 340 C 500 260, 500 170, 474 110" />
                  <text x={70} y={290}>$1,000,000 to start</text>
                  {ASSETS.map((a, i) => (
                    <rect key={a.key} className="st__bar" x={330 + i * 30} y={400 - split[a.key] * 1.6} width={20} height={split[a.key] * 1.6} />
                  ))}
                  <path d="M 280 330 C 296 336, 310 346, 320 360" />
                  <text x={80} y={330}>your split, defended</text>
                </g>
                <g className="st__ann st__ann--3">
                  <path className="st__link" d="M 446 350 C 380 330, 300 290, 280 218" />
                  <text x={526} y={392}>D</text>
                  <text x={526} y={92}>S</text>
                  <g className="st__s1">
                    <path className="st__red" d="M 30 380 L 440 90" />
                    <text className="st__redt" x={420} y={80}>S₁</text>
                    <path className="st__guide" d="M 315 235 L 60 235" />
                    <path className="st__guide st__guide--red" d="M 275 207 L 60 207" />
                    <path className="st__red" d="M 40 238 L 40 196 M 30 208 L 40 194 L 50 208" />
                    <text className="st__redt" x={72} y={192}>prices jump</text>
                  </g>
                </g>
                <g className="st__ann st__ann--4">
                  <path className="st__link" d="M 446 352 C 400 330, 340 290, 322 246" />
                  <text x={526} y={392}>D</text>
                  <text x={526} y={92}>S</text>
                  <path className="st__guide" d="M 315 235 L 315 410 M 315 235 L 60 235" />
                  <circle cx={315} cy={235} r={11} className="st__pt" />
                  <path d="M 362 250 C 350 244, 342 240, 332 238" />
                  <text x={368} y={258}>you, on Expo day</text>
                </g>
              </svg>
              <div className="st__photos">
                {photos.map((p, i) => (
                  <figure key={p.slug} className={`st__pol${i === active ? " is-on" : i < active ? " is-past" : ""}`} aria-hidden={i !== active}>
                    <span className="op__tape" aria-hidden="true" />
                    <Photo slug={p.slug} alt={p.alt} sizes="(max-width: 860px) 34vw, 16vw" />
                    <figcaption className="hand">{p.cap}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="st__chapters">
          <article className="st__ch" id="ch-1" aria-labelledby="ch-1-t">
            <p className="eyebrow st__reveal">Chapter 1 · Scarcity</p>
            <h2 id="ch-1-t" className="display st__reveal">
              Most days, you choose. <span className="hand">Expo day, you don’t.</span>
            </h2>
            <p className="st__body st__reveal">
              Economics starts with scarcity: one afternoon, two things you want to do, pick one. Econs Expo pushes the frontier out.
              One day at {site.venue.short} with around 150 students from schools across Singapore, three experiences and guest
              speakers from finance and policy.
            </p>
            <dl className="st__facts st__reveal">
              <div>
                <dt>When</dt>
                <dd>
                  {site.date.label} <span className="tbc">to be confirmed</span>
                </dd>
              </div>
              <div>
                <dt>Where</dt>
                <dd>{site.venue.address}</dd>
              </div>
            </dl>
          </article>

          <article className="st__ch" id="ch-2" aria-labelledby="ch-2-t">
            <p className="eyebrow st__reveal">Chapter 2 · {xp.buzzer.title}</p>
            <h2 id="ch-2-t" className="display st__reveal">
              Know it. Buzz it. <span className="hand">Explain it.</span>
            </h2>
            <p className="st__body st__reveal">{xp.buzzer.body}</p>
            <div className="st__reveal">
              <Buzzer onTime={() => {}} />
            </div>
          </article>

          <article className="st__ch" id="ch-3" aria-labelledby="ch-3-t">
            <p className="eyebrow st__reveal">Chapter 3 · {xp.pitch.title}</p>
            <h2 id="ch-3-t" className="display st__reveal">
              A million dollars. <span className="hand">Hypothetically.</span>
            </h2>
            <p className="st__body st__reveal">{xp.pitch.body}</p>
            <div className="st__reveal">
              <Portfolio split={split} setSplit={setSplit} />
            </div>
          </article>

          <article className="st__ch" id="ch-4" aria-labelledby="ch-4-t">
            <p className="eyebrow st__reveal">Chapter 4 · {xp.crisis.title}</p>
            <h2 id="ch-4-t" className="display st__reveal">
              Then the shock <span className="hand">hits.</span>
            </h2>
            <p className="st__body st__reveal">{xp.crisis.body}</p>
            <div className="st__reveal">
              <Shock shocked={shocked} setShocked={setShocked} />
            </div>
          </article>

          <article className="st__ch" id="ch-5" aria-labelledby="ch-5-t">
            <p className="eyebrow st__reveal">Chapter 5 · Equilibrium</p>
            <h2 id="ch-5-t" className="display st__reveal">
              Supply is set. <span className="hand">Demand is you.</span>
            </h2>
            <p className="st__body st__reveal">
              One day and about 150 seats. Everything else is up to the people who turn up. Register your interest, then bring
              your school.
            </p>
            <div className="st__ctas st__reveal">
              <Link href={registerHref} className="btn btn--ink btn--big">
                Register interest
              </Link>
              <Link prefetch={false} href="/attend/" className="btn btn--line btn--big">
                How the day works
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
