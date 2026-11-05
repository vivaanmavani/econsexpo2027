"use client";

import { useEffect, useRef } from "react";
import { useGsap, prefersReducedMotion } from "@/lib/motion";

/**
 * A follower ring for mouse users. It grows over links and buttons, and shows a word over
 * anything with data-cursor. Buttons lean towards the pointer. The system cursor stays visible.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const { gsap } = useGsap();

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
    const el = ring.current!;
    el.style.display = "grid";
    const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      el.classList.add("is-live");
      x(e.clientX);
      y(e.clientY);
      const t = e.target as HTMLElement;
      const tagged = t.closest<HTMLElement>("[data-cursor]");
      const hot = t.closest("a, button, summary, input, label");
      el.classList.toggle("is-label", !!tagged);
      el.classList.toggle("is-hot", !tagged && !!hot);
      el.classList.toggle("is-dark", !!t.closest("[data-theme='dark']"));
      if (tagged) label.current!.textContent = tagged.dataset.cursor ?? "";
    };

    const magnets = new Map<HTMLElement, [(e: PointerEvent) => void, () => void]>();
    const attach = () => {
      document.querySelectorAll<HTMLElement>(".btn").forEach((b) => {
        if (magnets.has(b)) return;
        const mm = (e: PointerEvent) => {
          const r = b.getBoundingClientRect();
          gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4, ease: "power3.out" });
        };
        const ml = () => gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.45)" });
        b.addEventListener("pointermove", mm);
        b.addEventListener("pointerleave", ml);
        magnets.set(b, [mm, ml]);
      });
    };
    attach();
    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("pointermove", move, { passive: true });
    const root = document.documentElement;
    const leave = () => gsap.to(el, { autoAlpha: 0, duration: 0.2 });
    const enter = () => gsap.to(el, { autoAlpha: 1, duration: 0.2 });
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointerenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("pointerenter", enter);
      mo.disconnect();
      magnets.forEach(([mm, ml], b) => {
        b.removeEventListener("pointermove", mm);
        b.removeEventListener("pointerleave", ml);
      });
    };
  }, [gsap]);

  return (
    <div className="cursor" ref={ring} aria-hidden="true">
      <span ref={label} className="cursor__label" />
    </div>
  );
}
