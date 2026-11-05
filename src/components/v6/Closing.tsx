"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Symbol } from "@/components/v6/Symbol";
import { Attend } from "@/components/v6/Attend";
import { RegisterLink } from "@/components/EventStatus";
import { useGsap, prefersReducedMotion } from "@/lib/motion";

/** The last word: the symbol again, the facts, and the one thing to do next. */
export function Closing() {
  const root = useRef<HTMLElement>(null);
  const { gsap } = useGsap();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    const paths = el.querySelectorAll(".sym path");
    const ctx = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 65%" } })
        .fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.8, stagger: 0.2, ease: "power3.inOut" }, 0)
        .fromTo(".sym__dot", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.5, ease: "back.out(2.6)" }, 0.8)
        .fromTo(".c6__line", { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.08, ease: "power4.out" }, 0.3);
    }, el);
    return () => ctx.revert();
  }, [gsap]);

  return (
    <section className="c6 s6" id="attend" ref={root} aria-labelledby="c6-title">
      <div className="wrap">
        <div className="c6__lead">
          <Symbol className="c6__sym" />
          <h2 id="c6-title" className="c6__title">
            <span className="o6__mask">
              <span className="c6__line">Your move.</span>
            </span>
          </h2>
          <div className="o6__ctas">
            <RegisterLink className="b6 b6--ink" />
            <Link prefetch={false} href="/attend/" className="b6 b6--ghost">
              See attendance details
            </Link>
          </div>
        </div>
        <Attend />
      </div>
    </section>
  );
}
