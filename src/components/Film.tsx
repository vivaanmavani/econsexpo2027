"use client";

import { useRef } from "react";
import { asset } from "@/lib/asset";

/** A button that opens the 2026 film, with sound, in a modal player. The file is only fetched once opened. */
export function Film({ className, children }: { className?: string; children: React.ReactNode }) {
  const film = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const open = () => {
    film.current?.showModal();
    film.current?.querySelector("video")?.play().catch(() => {});
  };
  const close = () => film.current?.close();
  return (
    <>
      <button ref={opener} className={className} onClick={open} data-cursor="Play" aria-haspopup="dialog">
        {children}
      </button>
      <dialog
        ref={film}
        className="film"
        aria-label="Econs Expo 2026 film"
        onClick={(e) => e.target === e.currentTarget && close()}
        onClose={() => {
          film.current?.querySelector("video")?.pause();
          opener.current?.focus();
        }}
      >
        <video controls playsInline preload="none" poster={asset("/media/video/film-2026-poster.jpg")}>
          <source src={asset("/media/video/film-2026.mp4")} type="video/mp4" />
        </video>
        <button className="film__close" onClick={close}>
          <span className="sr">Close film</span>
          <span aria-hidden="true">×</span>
        </button>
      </dialog>
    </>
  );
}
