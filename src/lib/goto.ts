import type Lenis from "lenis";

type Jumping = Window & { __lenis?: Lenis; __eeJump?: boolean };

/** Glides to a section on the homepage. Returns false if the section isn't on this page. */
export function goTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  const w = window as Jumping;
  // A deliberate jump passes straight through the gesture stage instead of being caught by it.
  w.__eeJump = true;
  window.dispatchEvent(new Event("ee:jump"));
  const done = () => {
    w.__eeJump = false;
  };
  // Lenis honours the scroll-padding set for the fixed nav.
  if (w.__lenis) w.__lenis.scrollTo(el, { duration: 1.4, force: true, onComplete: done });
  else {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    window.setTimeout(done, smooth ? 1200 : 0);
  }
  history.replaceState(null, "", `#${id}`);
  return true;
}
