"use client";

import { useEffect, useRef, useState } from "react";
import { useGsap, prefersReducedMotion } from "@/lib/motion";
import { markReady } from "@/lib/ready";

/**
 * A short opening (about 1.2 s, first visit per session only): the wordmark sets, the marker
 * loops it, and the sheet lifts. The page underneath is already rendered and usable.
 */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const { gsap } = useGsap();

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("ee-intro") === "1";
      sessionStorage.setItem("ee-intro", "1");
    } catch {}
    if (seen || prefersReducedMotion()) {
      setGone(true);
      markReady();
      return;
    }
    const el = root.current!;
    const count = el.querySelector<HTMLElement>(".ld__count")!;
    const n = { v: 0 };
    const tl = gsap
      .timeline({ onComplete: () => setGone(true) })
      .fromTo(".ld__char", { yPercent: 110 }, { yPercent: 0, duration: 0.5, stagger: 0.025, ease: "power4.out" }, 0.03)
      .fromTo(".ld__loop", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.55, ease: "power2.inOut" }, 0.15)
      .to(n, { v: 100, duration: 0.7, ease: "power2.inOut", onUpdate: () => (count.textContent = String(Math.round(n.v)).padStart(3, "0")) }, 0)
      .add(() => markReady(), 0.7)
      .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: "expo.inOut" }, 0.62);
    return () => {
      tl.kill();
    };
  }, [gsap]);

  if (gone) return null;
  return (
    <div className="ld" ref={root} aria-hidden="true">
      <div className="ld__mark">
        <span className="ld__word">
          {"Econs Expo".split("").map((c, i) => (
            <span key={i} className="ld__mask">
              <span className="ld__char">{c === " " ? " " : c}</span>
            </span>
          ))}
        </span>
        <span className="hand ld__yr">’27</span>
        <svg className="ld__ink ink" viewBox="0 0 400 120" preserveAspectRatio="none">
          <path
            className="ld__loop"
            d="M 214 10 C 330 6, 396 26, 392 60 C 388 98, 300 114, 196 112 C 90 110, 8 96, 10 58 C 12 24, 96 8, 200 9 C 250 9, 290 14, 318 22"
          />
        </svg>
      </div>
      <span className="ld__count hand">000</span>
    </div>
  );
}
