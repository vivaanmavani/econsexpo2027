"use client";

import { experiences } from "@/content/site";
import { goTo } from "@/lib/goto";

/** Why Econs Expo: a short statement on paper, leading straight into the photo story. */
export function Intro() {
  return (
    <section className="ab" id="about" aria-labelledby="ab-title">
      <div className="graph graph--fade" aria-hidden="true" />
      <div className="wrap ab__grid">
        <h2 id="ab-title" className="ab__title">
          Why Econs Expo
        </h2>
        <div className="ab__copy">
          <p className="ab__body">A student-run economics conference for schools across Singapore. Try three formats that put economic decisions into practice.</p>
          <ul className="ab__links">
            {experiences.map((x) => (
              <li key={x.id}>
                <a
                  href={`#event-${x.id}`}
                  onClick={(e) => {
                    if (goTo(`event-${x.id}`)) e.preventDefault();
                  }}
                >
                  {x.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
