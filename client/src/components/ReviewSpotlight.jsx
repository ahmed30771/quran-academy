import { useEffect, useRef, useState } from "react";
import { initials, starLine } from "../helpers";

const AUTO_MS = 5200;

function toneFor(name) {
  const tones = ["a", "b", "c", "d"];
  let h = 0;
  for (const ch of String(name || "")) h += ch.charCodeAt(0);
  return tones[h % tones.length];
}

function Avatar({ name, avatar, tone, large }) {
  const cls = `rev-avatar rev-avatar--${tone}${large ? " is-lg" : ""}`;
  if (avatar) {
    return (
      <div className={`${cls} has-photo`} aria-hidden="true">
        <img src={avatar} alt="" />
      </div>
    );
  }
  return (
    <div className={cls} aria-hidden="true">
      {initials(name)}
    </div>
  );
}

export default function ReviewSpotlight({ reviews, avg, note, t }) {
  const list = reviews || [];
  const n = list.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const drag = useRef({ on: false, x: 0, dx: 0 });

  useEffect(() => {
    if (n < 2 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % n);
      setTick((k) => k + 1);
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [n, paused, active]);

  if (!n) return <p className="lede">{t.noReviewsYet}</p>;

  const current = list[active];
  const tone = toneFor(current.name);

  function go(step) {
    setActive((i) => (i + step + n) % n);
    setTick((k) => k + 1);
  }

  function pick(i) {
    setActive(i);
    setTick((k) => k + 1);
  }

  function onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest("button, a")) return;
    drag.current = { on: true, x: e.clientX, dx: 0 };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (!drag.current.on) return;
    drag.current.dx = e.clientX - drag.current.x;
  }

  function onPointerUp() {
    if (!drag.current.on) return;
    const dx = drag.current.dx;
    drag.current.on = false;
    if (Math.abs(dx) > 56) go(dx < 0 ? 1 : -1);
  }

  return (
    <div
      className="rev-spot"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="rev-spot-top">
        <div className="rev-score-chip">
          <strong className="rev-score-num">{avg}</strong>
          <div>
            <div className="stars">{starLine(Number(avg))}</div>
            <p>{note}</p>
          </div>
        </div>
        {n > 1 ? (
          <div className="rev-spot-nav">
            <button type="button" className="rev-spot-arrow" aria-label={t.back} onClick={() => go(-1)}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path fill="currentColor" d="M14.7 5.3 8 12l6.7 6.7 1.4-1.4L10.8 12l5.3-5.3z" />
              </svg>
            </button>
            <button type="button" className="rev-spot-arrow" aria-label={t.next} onClick={() => go(1)}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path fill="currentColor" d="M9.3 5.3 7.9 6.7 13.2 12l-5.3 5.3 1.4 1.4L16 12z" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>

      <div
        className="rev-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <article key={`${active}-${tick}`} className="rev-stage-card">
          <span className="rev-quote" aria-hidden="true">“</span>
          <div className="stars" aria-label={`${current.stars} stars`}>{starLine(current.stars)}</div>
          <p className="rev-stage-text">{current.text}</p>
          <div className="rev-stage-person">
            <Avatar name={current.name} avatar={current.avatar} tone={tone} large />
            <div className="rev-meta">
              <strong>{current.name}</strong>
              <span>{current.country}</span>
            </div>
          </div>
          {n > 1 && !paused ? <span key={tick} className="rev-progress" style={{ animationDuration: `${AUTO_MS}ms` }} /> : null}
        </article>
      </div>

      {n > 1 ? (
        <div className="rev-cast" role="tablist" aria-label={t.revKicker}>
          {list.map((r, i) => {
            const on = i === active;
            return (
              <button
                key={r.id || `${r.name}-${i}`}
                type="button"
                role="tab"
                aria-selected={on}
                className={`rev-cast-btn${on ? " is-on" : ""}`}
                onClick={() => pick(i)}
              >
                <span className={`rev-cast-avatar-wrap${on ? " is-on" : ""}`}>
                  <Avatar name={r.name} avatar={r.avatar} tone={toneFor(r.name)} />
                </span>
                <span className="rev-cast-label">
                  <strong>{r.name}</strong>
                  <em>{r.country}</em>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
