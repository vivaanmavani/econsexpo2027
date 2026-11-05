"use client";

import { useEffect, useRef, useState } from "react";
import { edition2026, type Speaker } from "@/content/site";
import { asset } from "@/lib/asset";
import { useGsap, prefersReducedMotion } from "@/lib/motion";

type Props = { tone?: "light" | "dark"; speakers?: Speaker[]; edition?: string };

/** Guest speakers in a level row. Each opens a profile with a short, sourced bio. */
export function SpeakerCards({ tone = "light", speakers = edition2026.speakers, edition = "2026" }: Props) {
  const root = useRef<HTMLUListElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [current, setCurrent] = useState<Speaker | null>(null);
  const { gsap } = useGsap();

  useEffect(() => {
    if (current && !dialog.current!.open) dialog.current!.showModal();
  }, [current]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    const ctx = gsap.context(() => {
      // A timing stagger only: every card finishes at zero offset, so the row stays level.
      gsap.fromTo(".sc__card", { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out", clearProps: "transform", scrollTrigger: { trigger: el, start: "top 82%" } });
    }, el);
    return () => ctx.revert();
  }, [gsap]);

  const close = () => {
    const d = dialog.current!;
    d.classList.add("is-closing");
    window.setTimeout(() => {
      d.classList.remove("is-closing");
      d.close();
    }, 220);
  };

  return (
    <>
      <ul className={`sc sc--${tone}`} ref={root} style={{ ["--cols" as string]: speakers.length }}>
        {speakers.map((s) => (
          <li key={s.slug}>
            <button
              type="button"
              className="sc__card"
              data-cursor="Read"
              aria-haspopup="dialog"
              aria-label={`Read the biography of ${s.name}, ${s.role}, ${s.org}`}
              onClick={(e) => {
                opener.current = e.currentTarget;
                setCurrent(s);
              }}
            >
              <span className="sc__photo">
                <img src={asset(`/media/speakers/${s.slug}.jpg`)} alt="" width={480} height={480} loading="lazy" />
              </span>
              <span className="sc__name">{s.name}</span>
              <span className="sc__role">
                {s.role}, {s.org}
              </span>
              <span className="sc__more" aria-hidden="true">
                Read biography
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="profile"
        aria-labelledby="speaker-name"
        onClose={() => {
          setCurrent(null);
          opener.current?.focus();
        }}
        onClick={(e) => e.target === e.currentTarget && close()}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
      >
        {current && (
          <div className="profile__card">
            <div className="profile__photo">
              <img src={asset(`/media/speakers/${current.slug}.jpg`)} alt={`Portrait of ${current.name}`} width={480} height={480} />
            </div>
            <div className="profile__body">
              <p className="eyebrow">Guest speaker, Econs Expo {edition}</p>
              <h2 id="speaker-name" className="profile__name">
                {current.name}
              </h2>
              <p className="profile__role hand">
                {current.role}, {current.org}
              </p>
              <p className="profile__intro">{current.bio}</p>
              <p className="sc__note">
                Title as at Econs Expo {edition}.
                {current.source && (
                  <>
                    {" "}
                    Source:{" "}
                    <a href={current.source.href} target="_blank" rel="noopener noreferrer">
                      {current.source.label}
                      <span className="sr"> (opens in a new tab)</span>
                    </a>
                  </>
                )}
              </p>
            </div>
            <button className="profile__close" onClick={close} autoFocus>
              <span className="sr">Close profile</span>
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
