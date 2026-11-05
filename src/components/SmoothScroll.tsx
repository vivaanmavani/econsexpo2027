"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useGsap, prefersReducedMotion } from "@/lib/motion";

/** Weighted scroll that ScrollTrigger reads from. Off entirely for reduced motion. */
export function SmoothScroll() {
  const { gsap, ScrollTrigger } = useGsap();

  useEffect(() => {
    // Phones resize the viewport as the address bar slides; re-measuring every trigger then stutters.
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Pins add height after first paint, so re-measure once fonts and images settle, and put an anchor
    // arrival back on its section.
    const w = window as Window & { __eeJump?: boolean };
    // An anchor arrival is a deliberate jump, so the gesture stage must not catch it on the way past.
    if (location.hash) w.__eeJump = true;
    const settle = () => {
      ScrollTrigger.refresh();
      const id = decodeURIComponent(location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (target) {
        const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        const y = target.getBoundingClientRect().top + window.scrollY - pad;
        const l = (window as Window & { __lenis?: Lenis }).__lenis;
        // Lenis clamps to the limit it last measured, which predates the pins.
        l?.resize();
        if (l) l.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
      }
      window.setTimeout(() => {
        w.__eeJump = false;
      }, 200);
    };
    let cancelled = false;
    const whenLoaded = new Promise<void>((done) => {
      if (document.readyState === "complete") done();
      else window.addEventListener("load", () => done(), { once: true });
    });
    Promise.all([document.fonts.ready, whenLoaded]).then(() => {
      if (!cancelled) settle();
    });

    if (prefersReducedMotion()) {
      return () => {
        cancelled = true;
      };
    }
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add("lenis");
    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as Window & { __lenis?: Lenis }).__lenis;
    };
  }, [gsap, ScrollTrigger]);

  return null;
}
