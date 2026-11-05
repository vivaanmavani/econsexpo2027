"use client";

import { useEffect, useRef, useState } from "react";
import { SjiiLogo } from "@/components/SjiiLogo";
import { Photo } from "@/components/Photo";
import { useEventStatus } from "@/components/EventStatus";
import { site } from "@/content/site";
import { asset } from "@/lib/asset";
import { contourArtwork, CONTOUR_SIZE } from "@/lib/contours";
import { saveData } from "@/lib/media";
import { useGsap, prefersReducedMotion } from "@/lib/motion";
import { navTone } from "@/lib/navTone";
import { onReady } from "@/lib/ready";

const PAPER = "#f7f2e6";
const TRAIL_LIFE = 1100; // ms a pointer trail stays open
const MASK_SCALE = 0.5; // the reveal mask is soft, so it renders at half resolution
const SLIDES = [1, 2, 3, 4];

/**
 * Adam Smith, in a period etching on contour-lined paper, with the core team hidden behind the page: moving
 * across it opens a soft trail through to them. Scrolling fades the paper to the team, then the hero opens over them.
 */
export function Opening() {
  const root = useRef<HTMLElement>(null);
  const [team, setTeam] = useState(false);
  const teamOn = useRef(false);
  const { status } = useEventStatus();
  const { gsap, ScrollTrigger } = useGsap();

  useEffect(() => {
    teamOn.current = team;
  }, [team]);

  useEffect(() => {
    const el = root.current!;
    const stage = el.querySelector<HTMLElement>(".o6__first")!;
    const fg = el.querySelector<HTMLCanvasElement>(".o6__fg")!;
    const ctx = fg.getContext("2d");
    const mask = document.createElement("canvas");
    const maskCtx = mask.getContext("2d");
    const brush = document.createElement("canvas");
    if (!ctx || !maskCtx) return;

    const reduce = prefersReducedMotion();
    const portrait = new Image();
    portrait.src = asset("/media/brand/adam-smith.webp");
    const contours = new Image();
    contours.src = contourArtwork();

    const geo = { w: 1, h: 1, dpr: 1, radius: 90, size: 1, cx: 0, cy: 0 };
    const pointer = { nx: 0, ny: 0, px: 0, py: 0, last: null as { x: number; y: number } | null };
    const entry = { scale: reduce ? 1 : 1.035, show: reduce ? 1 : 0 };
    const trail: { x: number; y: number; t: number }[] = [];
    let progress = 0;
    let visible = true;
    let painted = false;

    const draw = () => {
      const { w, h, dpr, size, cx, cy } = geo;
      const t = performance.now() / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, w, h);
      if (contours.complete && contours.naturalWidth) {
        const s = Math.max(w / CONTOUR_SIZE.width, h / CONTOUR_SIZE.height) * 1.1;
        const dx = reduce ? 0 : Math.sin((t * Math.PI * 2) / 32) * 18 - pointer.px * 0.6;
        const dy = reduce ? 0 : Math.cos((t * Math.PI * 2) / 38) * 12 - pointer.py * 0.6;
        ctx.drawImage(contours, (w - CONTOUR_SIZE.width * s) / 2 + dx, (h - CONTOUR_SIZE.height * s) / 2 + dy, CONTOUR_SIZE.width * s, CONTOUR_SIZE.height * s);
      }

      if (portrait.complete && portrait.naturalWidth) {
        const iw = size * entry.scale;
        const ih = iw * (portrait.naturalHeight / portrait.naturalWidth);
        ctx.globalAlpha = entry.show;
        ctx.drawImage(portrait, cx - iw / 2 + pointer.px, cy + pointer.py + (size - iw) * 0.2, iw, ih);
      }
      ctx.globalAlpha = 1;
      // The foot of the page settles back to paper, so the name and date always read.
      const foot = ctx.createLinearGradient(0, h * 0.68, 0, h);
      foot.addColorStop(0, "rgba(247, 242, 230, 0)");
      foot.addColorStop(0.6, "rgba(247, 242, 230, .86)");
      foot.addColorStop(1, PAPER);
      ctx.fillStyle = foot;
      ctx.fillRect(0, h * 0.68, w, h * 0.32);
      if (!painted) {
        painted = true;
        stage.classList.add("is-ready"); // the paper now covers the photograph
      }

      if (!trail.length) return;
      const now = performance.now();
      const r = geo.radius * MASK_SCALE;
      while (trail.length && now - trail[0].t > TRAIL_LIFE) trail.shift();
      maskCtx.clearRect(0, 0, mask.width, mask.height);
      for (const p of trail) {
        const life = 1 - (now - p.t) / TRAIL_LIFE;
        maskCtx.globalAlpha = life * life * (3 - 2 * life);
        maskCtx.drawImage(brush, p.x * MASK_SCALE - r, p.y * MASK_SCALE - r);
      }
      maskCtx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(mask, 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    };

    let laidOut = "";
    const layout = () => {
      const size = `${stage.clientWidth}x${stage.clientHeight}`;
      if (size === laidOut) return;
      laidOut = size;
      const w = Math.max(1, stage.clientWidth);
      const h = Math.max(1, stage.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const narrow = w < 700;
      Object.assign(geo, {
        w,
        h,
        dpr,
        radius: Math.min(120, Math.max(70, w * 0.07)),
        // `size` is the portrait's width, and cy its top edge.
        size: Math.min(w * (narrow ? 1.12 : 0.62), h * (narrow ? 0.72 : 0.82)),
        cx: w / 2 - (narrow ? 8 : 16),
        cy: narrow ? h * 0.09 : Math.max(58, h * 0.075),
      });
      fg.width = Math.round(w * dpr);
      fg.height = Math.round(h * dpr);
      mask.width = Math.round(w * MASK_SCALE);
      mask.height = Math.round(h * MASK_SCALE);
      const r = geo.radius * MASK_SCALE;
      brush.width = brush.height = Math.ceil(r * 2);
      const b = brush.getContext("2d")!;
      const g = b.createRadialGradient(r, r, 0, r, r, r);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.5, "rgba(255,255,255,.7)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      b.clearRect(0, 0, brush.width, brush.height);
      b.fillStyle = g;
      b.fillRect(0, 0, brush.width, brush.height);
      trail.length = 0;
      draw(); // a resized canvas is blank, so repaint in the same frame
    };

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible || document.hidden || teamOn.current || progress > 0.3) return;
      pointer.px += (pointer.nx * 12 - pointer.px) * 0.08;
      pointer.py += (pointer.ny * 8 - pointer.py) * 0.08;
      draw();
    };

    const addPoint = (x: number, y: number) => {
      trail.push({ x, y, t: performance.now() });
      if (trail.length > 600) trail.shift();
    };
    const move = (e: PointerEvent) => {
      const box = stage.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      pointer.nx = (x / box.width) * 2 - 1;
      pointer.ny = (y / box.height) * 2 - 1;
      if (e.pointerType === "touch" || progress > 0.1) return;
      const last = pointer.last;
      const step = geo.radius * 0.3;
      if (last) {
        const dist = Math.hypot(x - last.x, y - last.y);
        const count = Math.min(40, Math.floor(dist / step));
        for (let i = 1; i <= count; i++) addPoint(last.x + ((x - last.x) * i) / (count + 1), last.y + ((y - last.y) * i) / (count + 1));
      }
      addPoint(x, y);
      pointer.last = { x, y };
    };
    const leave = () => {
      pointer.last = null;
      pointer.nx = pointer.ny = 0;
    };

    const ro = new ResizeObserver(layout);
    ro.observe(stage);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(stage);
    layout();

    // Reduced motion: paint once, in normal document flow, with the first photograph as the hero.
    if (reduce) {
      portrait.onload = contours.onload = draw;
      return () => {
        ro.disconnect();
        io.disconnect();
      };
    }

    stage.addEventListener("pointermove", move, { passive: true });
    stage.addEventListener("pointerleave", leave);
    frame = requestAnimationFrame(tick);
    portrait.onload = draw;

    // Hero photographs: each fades in over the last, which stays solid beneath it, so light never dips.
    const slides = gsap.utils.toArray<HTMLElement>(".o6__slide", el);
    let at = 0;
    let turn: gsap.core.Tween | undefined;
    let running = false;
    const next = () => {
      const a = slides[at];
      const b = slides[(at + 1) % slides.length];
      gsap.set(a, { zIndex: 1 });
      gsap.set(b, { zIndex: 2, opacity: 0 });
      turn = gsap.to(b, {
        opacity: 1,
        duration: 2,
        ease: "sine.inOut",
        onComplete() {
          gsap.set(a, { opacity: 0 });
          at = (at + 1) % slides.length;
          turn = gsap.delayedCall(4, next);
        },
      });
    };
    const slideshow = (on: boolean) => {
      if (on === running || saveData()) return;
      running = on;
      if (on && turn) turn.resume();
      else if (on) turn = gsap.delayedCall(3, next);
      else turn?.pause();
    };
    const onVisibility = () => {
      if (turn) turn.paused(document.hidden || !running);
    };
    document.addEventListener("visibilitychange", onVisibility);

    const c = gsap.context(() => {
      // The portrait settles onto the page within about a second of it being ready.
      gsap.set(".o6__ui > *", { autoAlpha: 0, y: 12 });
      const off = onReady(() => {
        gsap.to(entry, { show: 1, duration: 0.6, ease: "power1.out" });
        gsap.to(entry, { scale: 1, duration: 1.1, ease: "power3.out" });
        gsap.to(".o6__ui > *", { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power2.out", delay: 0.35 });
      });

      gsap.set(".o6__sig", { clipPath: "inset(-10% 100% -10% 0%)" });
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            onUpdate(self) {
              progress = self.progress;
              if (self.progress > 0.05 && teamOn.current) setTeam(false);
              slideshow(self.progress > 0.42 && self.progress < 0.995);
            },
          },
        })
        .to(".o6__ui", { autoAlpha: 0, y: -10, duration: 0.06 }, 0.01)
        .to(fg, { autoAlpha: 0, duration: 0.16 }, 0.06)
        .fromTo(".o6__team img", { scale: 1.06 }, { scale: 1, duration: 0.3 }, 0.06)
        .fromTo(".o6__frame", { clipPath: "inset(50% 50% 50% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut", duration: 0.3 }, 0.3)
        .fromTo(".o6__media", { scale: 1.14 }, { scale: 1, duration: 0.45 }, 0.3)
        .to(".o6__sig", { clipPath: "inset(-10% 0% -10% 0%)", ease: "power1.inOut", duration: 0.14 }, 0.52)
        .fromTo(".o6__line", { yPercent: 110 }, { yPercent: 0, stagger: 0.025, duration: 0.13, ease: "power3.out" }, 0.56)
        .fromTo(".o6__meta > *", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.015, duration: 0.12, ease: "power2.out" }, 0.62)
        .to({}, { duration: 0.2 });

      // The header follows what is actually under it: paper, the team, footage, then paper again.
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        onUpdate(self) {
          const travelled = self.progress * el.offsetHeight;
          navTone("opening", travelled > (el.offsetHeight - window.innerHeight) * 0.46 && travelled < el.offsetHeight - 40);
        },
        onLeave: () => navTone("opening", false),
      });
      return () => off();
    }, el);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", onVisibility);
      turn?.kill();
      navTone("opening", false);
      c.revert();
    };
  }, [gsap, ScrollTrigger]);

  return (
    <section className={`o6${team ? " is-team" : ""}`} ref={root} aria-labelledby="o6-title">
      <div className="o6__sticky">
        <div className="o6__first">
          <div className="o6__team">
            <Photo slug="core-2027" alt="The six members of the Econs Expo 2027 core team standing together in a courtyard" sizes="100vw" pos="50% 42%" />
          </div>
          <canvas className="o6__fg" role="img" aria-label="Etched portrait of Adam Smith in profile" />
          <div className="o6__ui">
            <div className="o6__id">
              <p className="o6__id-main">Econs Expo 2027</p>
              <p className="o6__id-sub">Made by students, for students. Scroll to explore</p>
            </div>
            <button type="button" className="o6__reveal" aria-pressed={team} onClick={() => setTeam((t) => !t)}>
              <span className="o6__reveal-icon" aria-hidden="true">
                {team ? "−" : "+"}
              </span>
              {team ? "Show Adam Smith" : "Reveal the team"}
            </button>
            <div className="o6__right">
              <p className="o6__when">
                {status.dateLabel}
                {status.dateNote && <span>{status.dateNote}</span>}
              </p>
              <p className="o6__credit">Adam Smith, after James Tassie, 1787</p>
            </div>
          </div>
        </div>

        <div className="o6__hero">
          <div className="o6__frame" aria-hidden="true">
            <div className="o6__media">
              {SLIDES.map((n, i) => (
                <img
                  key={n}
                  className="o6__slide"
                  src={asset(`/media/hero/slide-${n}-960.webp`)}
                  srcSet={`${asset(`/media/hero/slide-${n}-960.webp`)} 960w, ${asset(`/media/hero/slide-${n}-1920.webp`)} 1920w`}
                  sizes="100vw"
                  alt=""
                  width={1920}
                  height={1280}
                  decoding="async"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                />
              ))}
            </div>
            <div className="o6__veil" />
          </div>

          <div className="wrap o6__copy">
            <p className="o6__sig" aria-hidden="true">
              <span>Econs Expo</span>
              <span className="o6__sig-year">2027</span>
            </p>
            <h1 id="o6-title" className="o6__title">
              <span className="sr">Econs Expo {site.edition}. </span>
              <span className="o6__mask">
                <span className="o6__line">Economics,</span>
              </span>
              <span className="o6__mask">
                <span className="o6__line">out loud.</span>
              </span>
            </h1>
            <div className="o6__meta">
              <p className="o6__lede">
                A one-day economics conference for students from schools across Singapore. Buzz in, pitch a portfolio and respond to a crisis.
              </p>
              <dl className="o6__facts">
                <div>
                  <dt>Date</dt>
                  <dd>
                    {status.dateLabel} {status.dateNote && <span className="o6__tbc">{status.dateNote}</span>}
                  </dd>
                </div>
                <div>
                  <dt>Venue</dt>
                  <dd>{site.venue.short}, Singapore</dd>
                </div>
                <div>
                  <dt>Expected attendance</dt>
                  <dd>{site.participants.label}</dd>
                </div>
              </dl>
              <div className="o6__host">
                <span>Hosted by</span>
                <SjiiLogo />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
