"use client";

import { useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { photoStory, photoStoryLines, type StoryPhoto } from "@/content/gallery";
import { useGsap } from "@/lib/motion";
import { navTone } from "@/lib/navTone";

// Vertical scroll per pixel of sideways travel, and the reading moment on the last photograph, as a share of the viewport.
const SCROLL_PER_PX = 0.8;
const END_HOLD = 0.2;
const AHEAD = 3; // photographs prepared ahead of the one entering

// Keep in step with the media queries in expo.css.
const PINNED = "(min-width: 701px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const SWIPE = "(prefers-reduced-motion: no-preference) and ((max-width: 700px) or (pointer: coarse))";

// Paper through the first part, forest through the middle, exactly --forest from then on.
const STOPS: [number, number][] = [
  [0, 0],
  [0.34, 0],
  [0.72, 1],
  [1, 1],
];
function mix(p: number) {
  for (let i = 1; i < STOPS.length; i++) {
    const [p1, v1] = STOPS[i];
    if (p <= p1) {
      const [p0, v0] = STOPS[i - 1];
      return v0 + ((v1 - v0) * (p - p0)) / (p1 - p0);
    }
  }
  return 1;
}

const PAPER = [247, 242, 230];
const FOREST = [14, 26, 20];
const INK = "#121a16";
const LIGHT = "#f7f2e6";
const lum = (c: number[]) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Whichever of ink or paper reads better on the live background. Text never sits at a low-contrast midpoint. */
function foreground(t: number) {
  const bg = lum(PAPER.map((c, i) => c + (FOREST[i] - c) * t));
  const onInk = (bg + 0.05) / (lum([18, 26, 22]) + 0.05);
  const onPaper = (lum(PAPER) + 0.05) / (bg + 0.05);
  return onInk >= onPaper ? INK : LIGHT;
}

const place = (p: { x: number; y: number; w: number }) => ({ ["--x" as string]: p.x, ["--y" as string]: p.y, ["--w" as string]: p.w });
const maxHeight: Record<StoryPhoto["size"], number> = { small: 36, medium: 40, large: 60 };

/** Nine photographs from 2026 on one pinned horizontal track, handing the page from paper to forest. */
export function PhotoStory() {
  const root = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { gsap, ScrollTrigger } = useGsap();

  useEffect(() => {
    const el = root.current!;
    const view = scroller.current!;
    const row = track.current!;
    const night = el.querySelector<HTMLElement>(".ps__night")!;
    const figures = gsap.utils.toArray<HTMLElement>(".ps__fig", row);

    let lastT = -1;
    let lastFg = "";
    // The story only speaks for the header while it is the thing under the header.
    let active = false;
    const tone = () => navTone("story", active && lastFg === LIGHT);
    const setActive = (on: boolean) => {
      active = on;
      tone();
    };
    const apply = (progress: number) => {
      const t = mix(gsap.utils.clamp(0, 1, progress));
      // Skip imperceptible changes, but always land exactly on paper and exactly on forest.
      if (t === lastT || (t > 0 && t < 1 && Math.abs(t - lastT) < 0.0005)) return;
      lastT = t;
      night.style.opacity = String(Number(t.toFixed(4)));
      const fg = foreground(t);
      if (fg !== lastFg) {
        lastFg = fg;
        el.style.setProperty("--ps-fg", fg);
        el.style.setProperty("--ps-accent", fg === LIGHT ? "var(--gold-soft)" : "var(--gold-deep)");
        tone();
      }
    };

    // Photographs on a transformed track never look near the viewport to the browser, so the next few are
    // requested and decoded here, a little ahead of where the visitor is.
    let prepared = 0;
    const prepare = (upTo: number) => {
      for (; prepared < Math.min(upTo, figures.length); prepared++) {
        const img = figures[prepared].querySelector("img")!;
        img.loading = "eager";
        img.decode?.().catch(() => {});
      }
    };
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        prepare(AHEAD);
        near.disconnect();
      },
      { rootMargin: "120% 0px" },
    );
    near.observe(el);

    const mm = gsap.matchMedia();

    mm.add(PINNED, () => {
      // Measured once per refresh and cached: nothing reads layout while the track moves.
      let travel = 0;
      const measure = () => {
        row.style.width = "";
        const last = figures[figures.length - 1];
        const width = last.offsetLeft + last.offsetWidth / 2 + window.innerWidth / 2; // the last photograph ends centred
        row.style.width = `${Math.ceil(width)}px`;
        travel = Math.max(0, Math.ceil(width) - view.clientWidth);
      };
      measure();
      ScrollTrigger.addEventListener("refreshInit", measure);

      let lastAhead = 0;
      const journey = gsap.to(row, {
        x: () => -travel,
        ease: "none",
        onUpdate() {
          const p = this.progress();
          apply(p);
          const ahead = Math.ceil(p * figures.length) + AHEAD;
          if (ahead !== lastAhead) prepare((lastAhead = ahead));
        },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${travel * SCROLL_PER_PX}`,
          scrub: 0.25,
          invalidateOnRefresh: true,
        },
      });
      // One trigger owns the travel above. The pin simply outlasts it by the final reading moment.
      const pin = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${travel * SCROLL_PER_PX + window.innerHeight * END_HOLD}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onToggle: (self) => setActive(self.isActive),
      });

      // Entrances follow horizontal position. Anything already on screen enters with the section.
      const when = (node: HTMLElement) =>
        node.offsetLeft < view.clientWidth * 0.9
          ? { trigger: el, start: "top 55%", once: true }
          : { trigger: node, containerAnimation: journey, start: "left 96%", once: true };

      const reveals = figures.map((fig) => {
        const img = fig.querySelector("img")!;
        const cap = fig.querySelectorAll(".ps__cap-line");
        gsap.set(cap, { yPercent: 105 });
        gsap.set(img, { scale: 1.07, xPercent: 2.5 });
        return gsap
          .timeline({ scrollTrigger: when(fig) })
          .to(img, { scale: 1, xPercent: 0, duration: 1, ease: "power3.out" }, 0)
          .to(cap, { yPercent: 0, duration: 0.55, stagger: 0.06, ease: "power3.out" }, 0.2);
      });
      gsap.utils.toArray<HTMLElement>(".ps__text", row).forEach((block) => {
        const lines = block.querySelectorAll(".ps__text-line");
        gsap.set(lines, { yPercent: 105 });
        reveals.push(gsap.timeline({ scrollTrigger: when(block) }).to(lines, { yPercent: 0, duration: 0.7, stagger: 0.07, ease: "power3.out" }));
      });

      apply(0);
      return () => {
        ScrollTrigger.removeEventListener("refreshInit", measure);
        reveals.forEach((r) => r.scrollTrigger?.kill());
        pin.kill();
        row.style.width = "";
      };
    });

    mm.add(SWIPE, () => {
      // Native swiping keeps every caption reachable. The colour follows the section's vertical passage.
      const update = (p: number) => {
        apply(p);
        prepare(Math.ceil(view.scrollLeft / Math.max(1, view.clientWidth)) + AHEAD + 1);
      };
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 45%",
        end: "bottom 55%",
        onUpdate: (self) => update(self.progress),
        onRefresh: (self) => update(self.progress),
        onToggle: (self) => setActive(self.isActive),
      });
      const swipe = () => prepare(Math.ceil(view.scrollLeft / Math.max(1, view.clientWidth)) + AHEAD + 1);
      view.addEventListener("scroll", swipe, { passive: true });
      return () => {
        st.kill();
        view.removeEventListener("scroll", swipe);
      };
    });

    return () => {
      near.disconnect();
      mm.revert();
      navTone("story", false);
    };
  }, [gsap, ScrollTrigger]);

  return (
    // The wrapper stays put for React: the pin moves the section into a spacer, and React must never
    // be asked to remove a node from a parent it no longer sits in when the route changes.
    <div>
    <section className="ps" ref={root} aria-labelledby="ps-title">
      <div className="ps__day" aria-hidden="true">
        <div className="graph graph--fade-top" />
      </div>
      <div className="ps__night" aria-hidden="true" />
      <div className="ps__view" ref={scroller} tabIndex={0} role="region" aria-labelledby="ps-title">
        <div className="ps__track" ref={track}>
          <div className="ps__intro">
            <h2 id="ps-title" className="ps__title">
              Econs Expo 2026, in nine photographs.
            </h2>
            <p className="ps__note">Every photograph here is from last year’s conference.</p>
          </div>
          {photoStory.map((p, i) => (
            <figure
              key={p.slug}
              className={`ps__fig ps__fig--${p.size}`}
              style={{ ...place(p), ["--ar" as string]: p.ar, ["--maxh" as string]: maxHeight[p.size], order: i * 10 + 10 }}
            >
              <div className="ps__frame">
                <Photo slug={p.slug} alt={p.alt} pos={p.pos} sizes={`(max-width: 700px) 78vw, ${p.w}vw`} />
              </div>
              <figcaption className="ps__cap">
                <span className="ps__mask">
                  <span className="ps__cap-line ps__n">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <span className="ps__mask">
                  <span className="ps__cap-line">{p.caption}</span>
                </span>
              </figcaption>
            </figure>
          ))}
          {photoStoryLines.map((b) => (
            <p key={b.lines[0]} className="ps__text" style={{ ...place(b), order: b.after * 10 + 15 }}>
              {b.lines.map((l) => (
                <span key={l} className="ps__mask">
                  <span className="ps__text-line">{l}</span>
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
    </div>
  );
}
