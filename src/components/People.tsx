"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { groups, initials, type Member } from "@/content/team";

export const OpenProfile = createContext<(m: Member, from: HTMLElement) => void>(() => {});

/** Holds the one profile dialog for a page. Portraits inside it open profiles on click or Enter. */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [member, setMember] = useState<Member | null>(null);

  const open = useCallback((m: Member, from: HTMLElement) => {
    opener.current = from;
    setMember(m);
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (member && d && !d.open) d.showModal();
  }, [member]);

  const close = () => {
    const d = dialog.current;
    if (!d) return;
    d.classList.add("is-closing");
    window.setTimeout(() => {
      d.classList.remove("is-closing");
      d.close();
    }, 220);
  };

  return (
    <OpenProfile.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        className="profile"
        aria-labelledby="profile-name"
        onClose={() => {
          setMember(null);
          opener.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
      >
        {member && (
          <div className="profile__card">
            <div className="profile__photo">
              {member.photo ? (
                <img src={asset(`/media/team/${member.photo}.jpg`)} alt="" width={480} height={480} />
              ) : (
                <span className="monogram" aria-hidden="true">
                  {initials(member.name)}
                </span>
              )}
            </div>
            <div className="profile__body">
              <p className="eyebrow">{groups.find((g) => g.id === member.group)?.name}</p>
              <h2 id="profile-name" className="profile__name">
                {member.name}
              </h2>
              <p className="profile__role hand">{member.role}</p>
              {member.intro ? (
                <p className="profile__intro">{member.intro}</p>
              ) : (
                <p className="profile__intro profile__intro--none">A short introduction is on its way.</p>
              )}
              {member.links && member.links.length > 0 && (
                <ul className="profile__links">
                  {member.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.kind === "linkedin" ? "LinkedIn" : l.kind === "instagram" ? "Instagram" : "Website"}
                        <span className="sr"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button className="profile__close" onClick={close} autoFocus>
              <span className="sr">Close profile</span>
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}
      </dialog>
    </OpenProfile.Provider>
  );
}

type PortraitProps = { member: Member; size?: "lg" | "md" | "sm"; className?: string; style?: React.CSSProperties; preview?: boolean };

/** A headshot that circles itself in ink on hover or focus, and opens the profile on click. */
export function Portrait({ member, size = "md", className = "", style, preview }: PortraitProps) {
  const open = useContext(OpenProfile);
  const blurb = member.intro ?? groups.find((g) => g.id === member.group)?.blurb;
  return (
    <button
      type="button"
      className={`portrait portrait--${size} ${className}`}
      style={style}
      onClick={(e) => open(member, e.currentTarget)}
      aria-haspopup="dialog"
    >
      <span className="portrait__img">
        {member.photo ? (
          <img src={asset(`/media/team/${member.photo}.jpg`)} alt="" width={480} height={480} loading="lazy" />
        ) : (
          <span className="monogram" aria-hidden="true">
            {initials(member.name)}
          </span>
        )}
        {preview && blurb && (
          <span className="portrait__preview" aria-hidden="true">
            {blurb}
          </span>
        )}
        <svg className="portrait__ring ink" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength={1} d="M 52 3 C 82 2, 98 24, 97 50 C 96 79, 74 97, 48 97 C 20 97, 3 76, 3 49 C 3 24, 22 5, 46 4 C 58 3, 66 6, 72 10" />
        </svg>
      </span>
      <span className="portrait__name">{member.name}</span>
      <span className="portrait__role hand">{member.role}</span>
    </button>
  );
}
