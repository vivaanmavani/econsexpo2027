import Link from "next/link";

export default function NotFound() {
  return (
    <section className="nf paper-grid" aria-labelledby="nf-title">
      <div className="wrap">
        <p className="eyebrow">404</p>
        <h1 id="nf-title" className="display display--xl">
          Off the <span className="hand nf__hand">curve.</span>
        </h1>
        <svg className="nf__chart ink" viewBox="0 0 320 200" aria-hidden="true">
          <path d="M 20 10 L 20 180 L 310 180" />
          <path d="M 40 30 C 120 40, 200 120, 290 160" />
          <path d="M 250 40 C 262 34, 274 40, 270 52 C 266 62, 252 62, 250 52" />
        </svg>
        <p className="nf__body">This page doesn’t exist. It may have moved, or the link has a typo.</p>
        <div className="close__ctas">
          <Link href="/" className="btn btn--ink">
            Back to the homepage
          </Link>
          <Link prefetch={false} href="/attend/" className="btn btn--line">
            How to attend
          </Link>
        </div>
      </div>
    </section>
  );
}
