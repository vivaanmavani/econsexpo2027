"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { deriveStatus, splitRemaining } from "@/lib/status";

/** The live status. Renders the configured state on the server, then follows the clock only if a target exists. */
export function useEventStatus() {
  const [now, setNow] = useState<number | null>(null);
  const status = deriveStatus(site, now ?? 0);
  const ticking = status.countdown !== null;

  useEffect(() => {
    setNow(Date.now());
    if (!ticking) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [ticking]);

  return { status, hydrated: now !== null };
}

type RegisterProps = { className?: string; onClick?: (e: React.MouseEvent) => void };

/** Every Register action on the site. Text and destination both come from the shared status. */
export function RegisterLink({ className, onClick }: RegisterProps) {
  const { status } = useEventStatus();
  if (status.registerExternal) {
    return (
      <a href={status.registerHref} className={className} onClick={onClick} target="_blank" rel="noopener noreferrer">
        {status.registerLabel}
        <span className="sr"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link prefetch={false} href={status.registerHref} className={className} onClick={onClick}>
      {status.registerLabel}
    </Link>
  );
}

const UNITS = ["days", "hours", "minutes", "seconds"] as const;

/** Date, its status, the countdown when a confirmed target exists, and where registration stands. */
export function EventStatus({ tone = "paper", className = "" }: { tone?: "paper" | "dark"; className?: string }) {
  const { status, hydrated } = useEventStatus();
  const c = status.countdown;
  const left = c ? splitRemaining(c.remainingMs) : null;
  return (
    <div className={`es es--${tone} ${className}`}>
      <p className="es__date">
        {status.dateLabel}
        {status.dateNote && <span className="es__tag">{status.dateNote}</span>}
      </p>
      {c && left && (
        <div className="es__clock">
          <p className="es__label">{c.label}</p>
          {/* The ticking digits stay out of the accessibility tree; the target below is the readable version. */}
          <div className="es__digits" aria-hidden="true">
            {UNITS.map((u) => (
              <span key={u} className="es__unit">
                <span className="es__num">{hydrated ? String(left[u]).padStart(2, "0") : "--"}</span>
                <span className="es__name">{u}</span>
              </span>
            ))}
          </div>
          <p className="es__target">
            <time dateTime={c.iso}>{c.targetLabel}</time>
          </p>
        </div>
      )}
      <p className="es__reg">
        {status.registrationNote}{" "}
        {status.registration === "pending" && (
          <a href={site.instagram} target="_blank" rel="noopener noreferrer">
            Follow {site.instagramHandle} for the announcement
            <span className="sr"> (opens in a new tab)</span>
          </a>
        )}
      </p>
    </div>
  );
}
