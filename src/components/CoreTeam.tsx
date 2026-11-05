"use client";

import Link from "next/link";
import { Photo } from "@/components/Photo";
import { Portrait, ProfileProvider } from "@/components/People";
import { coreTeam, members } from "@/content/team";

/** Meet the Executives: the group portrait beside six profiles, then the way to all fifteen. */
export function CoreTeam() {
  return (
    <ProfileProvider>
      <section className="ex" id="team" aria-labelledby="ex-title">
        <div className="wrap ex__grid">
          <div className="ex__side">
            <h2 id="ex-title" className="s6__title">
              Meet the Executives
            </h2>
            <p className="ex__body">The students planning the competitions, bringing schools together and running the day.</p>
            <figure className="ex__group">
              <Photo slug="core-2027" alt="The six members of the Econs Expo 2027 core team standing together in a courtyard" sizes="(max-width: 1000px) 100vw, 38vw" pos="50% 40%" />
            </figure>
            <Link prefetch={false} href="/team/" className="b6 b6--ink" data-cursor="Team">
              Meet all {members.length}
            </Link>
          </div>
          <ul className="ex__list">
            {coreTeam.map((m) => (
              <li key={m.slug}>
                <Portrait member={m} size="md" preview />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </ProfileProvider>
  );
}
