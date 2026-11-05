"use client";

import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import { Photo } from "@/components/Photo";
import { Symbol } from "@/components/v6/Symbol";
import { experiences, type Experience } from "@/content/site";
import { goTo } from "@/lib/goto";
import { useGsap } from "@/lib/motion";

// Only what the committee has written down for 2027. Planned, so labelled as such.
const facts: Record<string, string[]> = {
  buzzer: ["Played in teams", "Rounds of economics questions", "From first principles to the headlines"],
  pitch: ["Starts with a live economic briefing", "A hypothetical $1,000,000 portfolio", "Defend your strategy to the judges"],
  crisis: ["You play a nation’s ministers", "Negotiate and publish policy", "New economic and political shocks each round"],
};

// Scene design units: the folder is 1000 × 680, each folded insert 760 × 300 (a third of a 760 × 900 sheet).
// Inserts sit centred on the scene; these are their resting offsets in the pocket and their fan once lifted out.
const INSIDE = [{ y: -120 }, { y: -105 }, { y: -90 }];
const OUT = [
  { x: -46, y: -520, rotation: -5 },
  { x: 0, y: -545, rotation: 0 },
  { x: 46, y: -570, rotation: 5 },
];
const STATES = ["s0", "s1", "s2", "s3"];
const DURATION = [0.8, 0.6, 0.5]; // seconds for each complete reveal
const QUIET = 220; // ms of silence that separates one wheel gesture from the next
const TAIL = 12; // wheel deltas this small are momentum dying away and can't start a gesture
const GESTURES = "(prefers-reduced-motion: no-preference)";

type Geometry = {
  vw: number;
  vh: number;
  mobile: boolean;
  closed: number;
  near: number;
  open: number;
  sceneY: number;
  finals: { x: number; y: number; scale: number }[];
};

/** Screen geometry for the current stage size. Everything the timeline needs comes from here. */
function geometry(stage: HTMLElement): Geometry {
  const vw = stage.clientWidth;
  const vh = stage.clientHeight;
  const mobile = vw < 700;
  const fit = (w: number) => Math.min(w, (vh * 0.86) / 0.68) / 1000;
  const closed = fit(vw * (mobile ? 0.9 : 0.62));
  const near = fit(vw * (mobile ? 0.96 : 0.78));
  const open = (vw * (mobile ? 0.8 : 0.42)) / 1000;
  const sceneY = vh * (mobile ? 0.46 : 0.44);
  // Three across on wide screens. Phones show one sheet at a time.
  const docW = mobile ? Math.min(vw * 0.74, ((vh * 0.6) * 760) / 900) : Math.min(vw * 0.27, ((vh * 0.68) * 760) / 900);
  const spots = mobile ? [0.5, 0.5, 0.5] : [0.2, 0.5, 0.8];
  const docY = mobile ? 0.42 : 0.47;
  const finals = spots.map((x) => ({
    x: (vw * x - vw / 2) / open,
    y: (vh * docY - vh / 2 - sceneY) / open,
    scale: docW / (760 * open),
  }));
  return { vw, vh, mobile, closed, near, open, sceneY, finals };
}

function Insert({ x, index }: { x: Experience; index: number }) {
  const label = `Event ${x.index}`;
  return (
    <div className="pk" data-pk={index}>
      <div className="pk__3d">
        <span className="pk__shadow" />
        <div className="pk__panel pk__mid">
          <div className="pk__face pk__front">
            <p className="pk__surface">
              <span className="pk__mask">
                <span className="pk__text">{x.surface}</span>
              </span>
            </p>
            <span className="pk__crease pk__crease--top" />
            <span className="pk__crease pk__crease--bottom" />
          </div>
        </div>
        <div className="pk__panel pk__bot">
          <div className="pk__face pk__front pk__photo">
            <Photo slug={x.photo} alt="" pos={x.photoPos} sizes="(max-width: 700px) 74vw, 27vw" />
            <span className="pk__edition">Photographed at Econs Expo 2026</span>
            <span className="pk__shade" />
          </div>
          <div className="pk__face pk__back" />
        </div>
        <div className="pk__panel pk__top">
          <div className="pk__face pk__front">
            <div className="pk__head">
              <Symbol className="pk__sym" />
              <span>Econs Expo 2027</span>
              <span className="pk__planned">Planned for 2027</span>
            </div>
            <h3 className="pk__title">
              <span className="pk__mask">
                <span className="pk__text">{x.title}</span>
              </span>
            </h3>
            <span className="pk__shade" />
          </div>
          <div className="pk__face pk__back">
            <span className="pk__label">{label}</span>
            <span className="pk__rule" />
            <span className="pk__name">{x.title}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The three planned events: a folder opened one gesture at a time, then the same events in plain text. */
export function Events() {
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const controls = useRef({ next: () => {}, skip: () => {} });
  const [step, setStep] = useState(0);
  const { gsap, ScrollTrigger } = useGsap();

  useEffect(() => {
    const stage = stageRef.current!;
    const scene = sceneRef.current!;
    const q = gsap.utils.selector(scene);
    const packets = [0, 1, 2].map((i) => q(`[data-pk="${i}"]`)[0] as HTMLElement);
    const lenis = () => (window as Window & { __lenis?: Lenis }).__lenis;
    const jumping = () => (window as Window & { __eeJump?: boolean }).__eeJump === true;

    let g = geometry(stage);

    // Prepare the sheets before the first gesture: their photographs load and decode as the stage approaches.
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        scene.querySelectorAll("img").forEach((img) => {
          img.loading = "eager";
          img.decode?.().catch(() => {});
        });
        near.disconnect();
      },
      { rootMargin: "150% 0px" },
    );
    near.observe(stage);

    // Closed folder, three folded inserts in the pocket. Applied directly so a paused timeline at its start shows it.
    const initial = () => {
      gsap.set(scene, { x: 0, y: g.vh * 0.03, scale: g.closed, rotation: -3 });
      gsap.set(q(".fd__flap"), { rotationX: 0 });
      gsap.set(q(".fd__hinge"), { zIndex: 7 });
      gsap.set(packets, { zIndex: 4, x: 0, rotation: 0, scale: 1, autoAlpha: 1, y: (i: number) => INSIDE[i].y });
      gsap.set(q(".pk__top"), { rotationX: -180, z: 2 });
      gsap.set(q(".pk__bot"), { rotationX: 180, z: 1 });
      gsap.set(q(".pk__shadow"), { scaleY: 1, opacity: 0.5 });
      gsap.set(q(".pk__shade"), { opacity: 0.5 });
      gsap.set(q(".pk__text"), { yPercent: 105, autoAlpha: 0 });
    };

    const build = () => {
      initial();
      const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true });

      const extract = (i: number, at: number, dur: number) =>
        tl
          .to(packets[i], { y: OUT[i].y, x: OUT[i].x, rotation: OUT[i].rotation, duration: dur, ease: "power2.out" }, at)
          .set(packets[i], { zIndex: 10 }, at + dur * 0.9); // clear of the pocket: only now in front of it
      const unfold = (i: number, start: number) => {
        const p = packets[i];
        const top = p.querySelector(".pk__top")!;
        const bot = p.querySelector(".pk__bot")!;
        tl.to(p, { x: () => g.finals[i].x, y: () => g.finals[i].y, scale: () => g.finals[i].scale, rotation: 0, duration: 0.32, ease: "power3.out" }, start)
          .to(top, { rotationX: 0, duration: 0.22, ease: "power2.out" }, start + 0.02)
          .to(top.querySelector(".pk__shade"), { opacity: 0, duration: 0.22 }, start + 0.02)
          .to(bot, { rotationX: 0, duration: 0.22, ease: "power2.out" }, start + 0.14)
          .to(bot.querySelector(".pk__shade"), { opacity: 0, duration: 0.22 }, start + 0.14)
          .to(p.querySelector(".pk__shadow"), { scaleY: 3, opacity: 0.38, duration: 0.3 }, start + 0.02)
          .to(p.querySelectorAll(".pk__text"), { yPercent: 0, autoAlpha: 1, duration: 0.1, stagger: 0.02 }, start + 0.26);
      };
      // On a phone the previous sheet steps aside, so only one is ever in view.
      const stepAside = (i: number, at: number) => {
        if (g.mobile) tl.to(packets[i], { x: () => -g.vw / g.open, autoAlpha: 0, duration: 0.24, ease: "power2.in" }, at);
      };

      tl.addLabel("s0", 0);
      // First gesture: the folder comes closer, the cover opens on its crease, and insert 01 comes out and unfolds.
      tl.to(scene, { y: 0, scale: () => g.near, rotation: -1, duration: 0.18, ease: "power2.out" }, 0)
        .to(q(".fd__flap"), { rotationX: 180, duration: 0.3, ease: "power2.inOut" }, 0.06)
        .to(q(".fd__flap-shadow"), { opacity: 0, duration: 0.1 }, 0.06)
        .set(q(".fd__hinge"), { zIndex: 3 }, 0.21) // past 90°: the cover now lies behind anything leaving the pocket
        .to(scene, { y: () => g.sceneY, scale: () => g.open, rotation: 0, duration: 0.45, ease: "power2.inOut" }, 0.3);
      extract(0, 0.3, 0.25);
      unfold(0, 0.55);
      tl.addLabel("s1", 1);
      // Second gesture: insert 02 joins it.
      extract(1, 1, 0.3);
      stepAside(0, 1);
      unfold(1, 1.28);
      tl.addLabel("s2", 2);
      // Third gesture: insert 03, and all three planned formats are in view.
      extract(2, 2, 0.3);
      stepAside(1, 2);
      unfold(2, 2.28);
      tl.addLabel("s3", 3);
      return tl;
    };

    const mm = gsap.matchMedia();
    mm.add(GESTURES, () => {
      const tl = build();
      let state = 0;
      let held = false;
      let playing: gsap.core.Tween | null = null;
      let lastInput = 0;
      let gestureUsed = false;
      let settleUntil = 0;
      let lastKind = "wheel";
      tl.pause(0);

      const top = () => stage.getBoundingClientRect().top + window.scrollY;
      const hold = (force = false) => {
        if (held || jumping()) return;
        if (!force && Math.abs(window.scrollY - top()) > window.innerHeight * 0.5) return; // jumped past: stay out
        held = true;
        gestureUsed = true; // the burst that arrived here does not count
        lastInput = performance.now();
        settleUntil = lastInput + 420; // a brief look at the resting view before the first gesture
        const y = top() + 1; // rest inside the 2px trigger range, so leaving either way is a clean exit
        lenis()?.stop();
        lenis()?.scrollTo(y, { immediate: true, force: true });
        window.scrollTo(0, y);
        stage.classList.add("is-held");
      };
      const release = (dir: number) => {
        if (!held) return;
        held = false;
        stage.classList.remove("is-held");
        lenis()?.start();
        if (!dir) return;
        const to = top() + dir * window.innerHeight * 0.7;
        const l = lenis();
        // Touch scrolling is native, so a swipe exit uses the browser's own smooth scroll.
        if (l && lastKind !== "touch") l.scrollTo(to, { duration: 0.7 });
        else window.scrollTo({ top: to, behavior: "smooth" });
      };
      const go = (dir: number) => {
        if (playing) return;
        const next = state + dir;
        if (next < 0 || next > 3) {
          release(dir);
          return;
        }
        playing = tl.tweenFromTo(STATES[state], STATES[next], {
          duration: DURATION[dir > 0 ? state : next],
          ease: "none",
          onComplete: () => {
            playing = null;
          },
        });
        state = next;
        setStep(next);
      };
      const gesture = (dir: number, canStart = true) => {
        const now = performance.now();
        const fresh = now - lastInput > QUIET;
        lastInput = now;
        if (fresh) gestureUsed = false;
        if (!held) return;
        if (now < settleUntil || gestureUsed || playing) {
          gestureUsed = true; // same momentum burst, or input during a reveal
          return;
        }
        if (!canStart) return;
        gestureUsed = true;
        go(dir);
      };

      const onWheel = (e: WheelEvent) => {
        if (held && Math.abs(e.deltaY) >= 4) {
          lastKind = "wheel";
          gesture(Math.sign(e.deltaY), Math.abs(e.deltaY) >= TAIL);
        } else if (!held) lastInput = performance.now();
      };
      let touchY: number | null = null;
      const onTouchStart = (e: TouchEvent) => {
        touchY = held ? e.touches[0].clientY : null; // only swipes that begin while held count
      };
      const onTouchMove = (e: TouchEvent) => {
        if (held) e.preventDefault();
      };
      const onTouchEnd = (e: TouchEvent) => {
        if (!held || touchY === null) return;
        const dy = touchY - e.changedTouches[0].clientY;
        touchY = null;
        if (Math.abs(dy) > 30) {
          lastKind = "touch";
          lastInput = 0;
          gesture(Math.sign(dy));
        }
      };
      const KEYS: Record<string, number> = { ArrowDown: 1, PageDown: 1, " ": 1, ArrowUp: -1, PageUp: -1 };
      const onKey = (e: KeyboardEvent) => {
        if (!held) return;
        // Space and Enter on a focused control belong to that control.
        if ((e.key === " " || e.key === "Enter") && (e.target as Element).closest?.("a, button")) return;
        if (e.key === "Home" || e.key === "End") {
          release(0);
          return;
        }
        const dir = e.key === " " && e.shiftKey ? -1 : KEYS[e.key];
        if (!dir) return;
        e.preventDefault();
        if (!e.repeat) {
          lastKind = "key";
          lastInput = 0;
          gesture(dir);
        }
      };
      const onFocus = (e: FocusEvent) => {
        if (held && !stage.contains(e.target as Node)) release(0); // tabbing onwards scrolls freely
      };
      const onJump = () => release(0);

      window.addEventListener("wheel", onWheel, { passive: true });
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
      window.addEventListener("keydown", onKey);
      window.addEventListener("ee:jump", onJump);
      document.addEventListener("focusin", onFocus);

      controls.current = {
        next() {
          if (playing) return;
          if (!held) hold(true);
          if (state === 3) {
            release(0);
            goTo("programme");
            document.getElementById("programme-title")?.focus({ preventScroll: true });
            return;
          }
          go(1);
        },
        skip() {
          playing?.progress(1);
          tl.seek("s3");
          state = 3;
          setStep(3);
          release(0);
          goTo("programme");
          document.getElementById("programme-title")?.focus({ preventScroll: true });
        },
      };

      // Hold when the stage reaches the top of the viewport, from either direction.
      const st = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: "+=2",
        onEnter: () => hold(),
        onEnterBack: () => hold(),
        onUpdate: () => {
          if (held && Math.abs(window.scrollY - top()) > 60) release(0); // moved by something else
        },
      });

      // New geometry: rewind, reapply the closed state, re-record and return to the resting state.
      const refresh = () => {
        playing?.progress(1);
        tl.seek(0);
        g = geometry(stage);
        initial();
        tl.invalidate().seek(STATES[state]);
      };
      ScrollTrigger.addEventListener("refresh", refresh);

      return () => {
        release(0);
        st.kill();
        playing?.kill();
        tl.kill();
        ScrollTrigger.removeEventListener("refresh", refresh);
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("ee:jump", onJump);
        document.removeEventListener("focusin", onFocus);
      };
    });

    let timer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    ro.observe(stage);
    return () => {
      window.clearTimeout(timer);
      ro.disconnect();
      near.disconnect();
      mm.revert();
    };
  }, [gsap, ScrollTrigger]);

  const nextLabel = step === 0 ? "Open the folder" : step === 3 ? "Continue to programme details" : `Open event ${step + 1} of 3`;

  return (
    <section className="ev" id="events" aria-labelledby="ev-title">
      <div className="fd" data-theme="dark">
        <header className="wrap fd__intro">
          <h2 id="ev-title" className="fd__heading">
            Three ways to use economics in one day.
          </h2>
          <p className="fd__note">Planned for 2027. Details may still change.</p>
        </header>

        <div className="fd__stage" ref={stageRef}>
          {/* The scene is visual. All of its text is repeated, with more detail, in the programme below. */}
          <div className="fd__scene" ref={sceneRef} aria-hidden="true">
            <span className="fd__ground" />
            <div className="fd__back" />
            <div className="fd__hinge">
              <div className="fd__flap">
                <div className="fd__flap-face fd__flap-front">
                  <span className="fd__tie" />
                </div>
                <div className="fd__flap-face fd__flap-inner" />
              </div>
            </div>
            {experiences.map((x, i) => (
              <Insert key={x.id} x={x} index={i} />
            ))}
            <div className="fd__pocket">
              <div className="fd__pocket-face">
                <div className="fd__print">
                  <span className="fd__print-name">Econs Expo 2027</span>
                  <span className="fd__print-sub">Competition programme</span>
                </div>
                <Symbol className="fd__print-sym" />
              </div>
            </div>
            <span className="fd__flap-shadow" />
          </div>

          <div className="fd__controls">
            <button type="button" className="b6 b6--light fd__next" onClick={() => controls.current.next()}>
              {nextLabel}
            </button>
            <button type="button" className="fd__skip" onClick={() => controls.current.skip()}>
              Skip to programme details
            </button>
          </div>
          <p className="sr" aria-live="polite">
            {step > 0 ? `${experiences[step - 1].title}, planned for 2027.` : ""}
          </p>
        </div>
      </div>

      <div className="pg s6" id="programme">
        <div className="wrap">
          <header className="s6__head">
            <h2 id="programme-title" className="s6__title" tabIndex={-1}>
              The programme
            </h2>
            <p className="s6__note">All three formats are planned for 2027, and details may still change. Photographs are from Econs Expo 2026.</p>
          </header>
          {experiences.map((x, i) => (
            <article key={x.id} id={`event-${x.id}`} className={`ev__row${i % 2 ? " ev__row--flip" : ""}`} aria-labelledby={`ev-${x.id}`}>
              <figure className="ev__photo">
                <Photo slug={x.photo} alt={x.photoAlt} sizes="(max-width: 860px) 100vw, 55vw" pos={x.photoPos} />
                <figcaption>{x.caption.replace(" · ", ", ")}</figcaption>
              </figure>
              <div className="ev__text">
                <p className="ev__n">Event {x.index}, planned for 2027</p>
                <h3 id={`ev-${x.id}`} className="ev__title">
                  {x.title}
                </h3>
                <p className="ev__body">{x.body}</p>
                <ul className="ev__facts">
                  {facts[x.id].map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
