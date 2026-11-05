"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { site, registerHref } from "@/content/site";
import { asset } from "@/lib/asset";
import { useGsap, prefersReducedMotion } from "@/lib/motion";

/** The last word, over 2026 footage of the medals: the marker circles "move." as you arrive. */
export function Closing() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const { gsap } = useGsap();

  useEffect(() => {
    const el = root.current!;
    const v = video.current!;
    const reduce = prefersReducedMotion();
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    let io: IntersectionObserver | undefined;
    if (!reduce && !saveData) {
      const small = window.matchMedia("(max-width: 700px)").matches;
      io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            if (!v.src) v.src = asset(`/media/video/medals-${small ? 720 : 1280}.mp4`);
            v.play().catch(() => {});
          } else v.pause();
        },
        { rootMargin: "200px" },
      );
      io.observe(el);
    }
    const ring = el.querySelector(".close__ring path");
    if (reduce) {
      gsap.set(ring, { drawSVG: "100%" });
      return () => io?.disconnect();
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(".close__bg video", { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true } });
      gsap
        .timeline({ scrollTrigger: { trigger: ".close__title", start: "top 75%" } })
        .fromTo(".close__line", { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.1, ease: "power4.out" })
        .fromTo(ring, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1, ease: "power2.inOut" }, 0.6)
        .fromTo(".close__meta > *", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 0.7);
    }, el);
    return () => {
      io?.disconnect();
      ctx.revert();
    };
  }, [gsap]);

  return (
    <section className="close" ref={root} aria-labelledby="close-title" data-theme="dark">
      <div className="close__bg" aria-hidden="true">
        <video ref={video} muted loop playsInline preload="none" poster={asset("/media/video/medals-poster.jpg")} />
        <div className="close__veil" />
      </div>
      <div className="wrap close__inner">
        <p className="eyebrow eyebrow--light">Econs Expo {site.edition}</p>
        <h2 id="close-title" className="close__title">
          <span className="close__mask">
            <span className="close__line">Your</span>
          </span>{" "}
          <span className="close__move">
            <span className="close__mask">
              <span className="close__line">move.</span>
            </span>
            <svg className="close__ring ink" viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden="true">
              <path d="M 220 12 C 330 8, 396 40, 392 82 C 388 128, 300 152, 192 150 C 86 148, 8 124, 10 78 C 12 36, 96 12, 204 12 C 262 12, 304 20, 336 32" />
            </svg>
          </span>
        </h2>
        <div className="close__meta">
          <p className="close__body">
            {site.date.label} <span className="tbc tbc--light">date to be confirmed</span>
            <br />
            {site.venue.name}, {site.venue.address}
          </p>
          <div className="close__ctas">
            <Link href={registerHref} className="btn btn--paper btn--big">
              Register interest
            </Link>
            <Link prefetch={false} href="/attend/" className="btn btn--line-light btn--big">
              How the day works
            </Link>
          </div>
          <p className="close__cap hand">2026 · the winners’ medals</p>
        </div>
      </div>
    </section>
  );
}
