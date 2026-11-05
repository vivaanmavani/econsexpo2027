"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Film } from "@/components/Film";
import { SpeakerCards } from "@/components/SpeakerCards";
import { edition2026, speakers2027 } from "@/content/site";
import { asset } from "@/lib/asset";
import { playWhileVisible, saveData } from "@/lib/media";
import { useGsap, prefersReducedMotion } from "@/lib/motion";

/** Guest speakers on the same forest the photo story ends on: this year's status, then who spoke in 2026. */
export function Past() {
  const root = useRef<HTMLElement>(null);
  const { gsap } = useGsap();

  useEffect(() => {
    const el = root.current!;
    const reduce = prefersReducedMotion();
    let reel: ReturnType<typeof playWhileVisible> | undefined;
    if (!reduce && !saveData()) {
      const v = el.querySelector<HTMLVideoElement>(".pa__reel video")!;
      reel = playWhileVisible(v, {
        rootMargin: "120px",
        load() {
          if (!v.src) v.src = asset(`/media/video/reel-2026-${window.matchMedia("(max-width: 700px)").matches ? 720 : 1280}.mp4`);
        },
      });
    }
    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.fromTo(".sp__line", { yPercent: 105 }, { yPercent: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: ".sp__title", start: "top 85%" } });
      }
    }, el);
    return () => {
      reel?.stop();
      ctx.revert();
    };
  }, [gsap]);

  return (
    <section className="sp" id="speakers" ref={root} aria-labelledby="sp-title" data-theme="dark">
      <div className="wrap">
        <header className="sp__head">
          <h2 id="sp-title" className="sp__title">
            <span className="ps__mask">
              <span className="sp__line">Guest speakers</span>
            </span>
          </h2>
          {speakers2027.length === 0 && <p className="sp__status">2027 guest speakers will be announced once confirmed.</p>}
        </header>

        {speakers2027.length > 0 && (
          <div className="sp__edition">
            <h3 className="sp__h3">Speaking in 2027</h3>
            <SpeakerCards tone="dark" speakers={speakers2027} edition="2027" />
          </div>
        )}

        <div className="sp__edition">
          <h3 className="sp__h3">Who spoke in 2026</h3>
          <SpeakerCards tone="dark" />
        </div>

        <div className="pa" id="2026">
          <div className="pa__reel">
            <video muted loop playsInline preload="none" poster={asset("/media/video/reel-2026-poster.jpg")} aria-hidden="true" />
            <div className="pa__over">
              <Film className="pa__film">
                <span className="pa__play" aria-hidden="true" />
                <span>Watch the 2026 film (1:21, with sound)</span>
              </Film>
            </div>
          </div>
          <div className="pa__text">
            <h3 className="sp__h3">Econs Expo 2026</h3>
            <dl className="pa__facts">
              <div>
                <dt>Date</dt>
                <dd>{edition2026.date}</dd>
              </div>
              <div>
                <dt>Participants</dt>
                <dd>{edition2026.participants}</dd>
              </div>
              <div>
                <dt>Guest speakers</dt>
                <dd>{edition2026.speakers.length}</dd>
              </div>
            </dl>
            <Link prefetch={false} href="/2026/" className="b6 b6--ghost-light">
              See the 2026 archive
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
