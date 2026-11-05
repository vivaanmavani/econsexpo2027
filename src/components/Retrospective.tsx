"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Film } from "@/components/Film";
import { SpeakerCards } from "@/components/SpeakerCards";
import { Photo } from "@/components/Photo";
import { CountUp } from "@/components/CountUp";
import { edition2026 } from "@/content/site";
import { asset } from "@/lib/asset";
import { useGsap, prefersReducedMotion } from "@/lib/motion";

// Captioned frames that drift over the moving footage at different depths.
const frames = [
  { slug: "fireside", alt: "A guest speaker answers questions in the 2026 fireside chat", cap: "the fireside chat", pos: "40% 50%", speed: 30, cls: "f1" },
  { slug: "team-table", alt: "A team smiling at their table", cap: "one table, one team", pos: "50% 60%", speed: 12, cls: "f2" },
  { slug: "medals", alt: "A handful of gold medals on red, white and blue ribbons", cap: "medals", speed: 44, cls: "f3" },
  { slug: "friends", alt: "Five students posing together on the walkway", cap: "on the walkway", pos: "50% 40%", speed: 22, cls: "f4" },
  { slug: "speaker-chat", alt: "Guest speakers talking with organisers between sessions", cap: "between sessions", speed: 36, cls: "f5" },
  { slug: "thank-you", alt: "Closing slide reading Thank you for attending Econs Expo 2026", cap: "see you next year", speed: 16, cls: "f6" },
];

export function Retrospective() {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLVideoElement>(null);
  const { gsap } = useGsap();

  useEffect(() => {
    const el = root.current!;
    const v = bg.current!;
    const reduce = prefersReducedMotion();
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    let io: IntersectionObserver | undefined;
    if (!reduce && !saveData) {
      const small = window.matchMedia("(max-width: 700px)").matches;
      io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            if (!v.src) v.src = asset(`/media/video/reel-2026-${small ? 720 : 1280}.mp4`);
            v.play().catch(() => {});
          } else v.pause();
        },
        { rootMargin: "200px" },
      );
      io.observe(el);
    }
    if (reduce) return () => io?.disconnect();

    // Phones: gentler depth and a one-off reveal per frame instead of a scrubbed clip.
    const small = window.matchMedia("(max-width: 860px)").matches;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>(".rt__frame").forEach((f) => {
        const s = Number(f.dataset.speed) * (small ? 0.35 : 1);
        gsap.fromTo(f, { y: s * 7 }, { y: -s * 7, ease: "none", scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: true } });
        if (small)
          gsap.fromTo(f.querySelector(".rt__media"), { clipPath: "inset(12% 10% 12% 10%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: f, start: "top 85%" } });
        else
          gsap.fromTo(f.querySelector(".rt__media"), { clipPath: "inset(30% 20% 30% 20%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.out", scrollTrigger: { trigger: f, start: "top 95%", end: "top 55%", scrub: true } });
      });
      gsap.fromTo(".rt__year", { yPercent: 30, autoAlpha: 0.2 }, { yPercent: -10, autoAlpha: 1, ease: "none", scrollTrigger: { trigger: ".rt__head", start: "top bottom", end: "bottom 30%", scrub: true } });
      gsap.fromTo(".rt__veil", { opacity: 0.9 }, { opacity: 0.55, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: true } });
    }, el);
    return () => {
      io?.disconnect();
      ctx.revert();
    };
  }, [gsap]);

  return (
    <section className="rt" id="2026" ref={root} aria-labelledby="rt-title" data-theme="dark">
      <div className="rt__bg" aria-hidden="true">
        <video ref={bg} muted loop playsInline preload="none" poster={asset("/media/video/reel-2026-poster.jpg")} />
        <div className="rt__veil" />
      </div>

      <div className="rt__content">
        <div className="wrap rt__head">
          <p className="eyebrow eyebrow--light">Previous edition</p>
          <h2 id="rt-title" className="rt__title">
            <span className="hand rt__hand">last time</span>
            <span className="rt__year" aria-label="2026">
              2026
            </span>
          </h2>
          <dl className="rt__stats">
            <div>
              <dt>When</dt>
              <dd>{edition2026.date}</dd>
            </div>
            <div>
              <dt>Students</dt>
              <dd>
                <CountUp to={Number(edition2026.participants)} />
              </dd>
            </div>
            <div>
              <dt>Guest speakers</dt>
              <dd>
                <CountUp to={edition2026.speakers.length} />
              </dd>
            </div>
          </dl>
          <div className="rt__actions">
            <Film className="rt__film">
              <span className="rt__play" aria-hidden="true" />
              <span>
                Watch the 2026 film <span className="hand">with sound, 1:21</span>
              </span>
            </Film>
            <Link prefetch={false} href="/2026/" className="btn btn--line-light" data-cursor="Look">
              Photos and programme
            </Link>
          </div>
        </div>

        <div className="wrap rt__field">
          {frames.map((f) => (
            <figure key={f.slug} className={`rt__frame ${f.cls}`} data-speed={f.speed}>
              <div className="rt__media">
                <Photo slug={f.slug} alt={f.alt} sizes="(max-width: 860px) 60vw, 30vw" pos={f.pos} />
              </div>
              <figcaption className="hand">{f.cap}</figcaption>
            </figure>
          ))}
        </div>

        <div className="wrap rt__speakers">
          <h3 className="eyebrow eyebrow--light">2026 guest speakers</h3>
          <SpeakerCards tone="dark" />
        </div>
      </div>

    </section>
  );
}
