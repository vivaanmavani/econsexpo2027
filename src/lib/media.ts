"use client";

/** True when the visitor has asked the browser to save data. */
export const saveData = () => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/**
 * Plays a muted reel only while it is on screen and the page is showing. `load` sets the source the first
 * time it is needed; `allowed` can hold playback back. Call `sync` when `allowed` may have changed.
 */
export function playWhileVisible(v: HTMLVideoElement, opts: { target?: Element; rootMargin?: string; load?: () => void; allowed?: () => boolean } = {}) {
  let visible = false;
  const sync = () => {
    if (visible && !document.hidden && (opts.allowed?.() ?? true)) {
      opts.load?.();
      v.play().catch(() => {});
    } else if (!v.paused) v.pause();
  };
  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      sync();
    },
    { rootMargin: opts.rootMargin },
  );
  io.observe(opts.target ?? v);
  document.addEventListener("visibilitychange", sync);
  return {
    sync,
    stop() {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      v.pause();
    },
  };
}
