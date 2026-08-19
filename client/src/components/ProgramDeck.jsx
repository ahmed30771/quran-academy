import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { audienceLabel, coursePath, levelLabel } from "../helpers";

const THEMES = ["gold", "deep", "ivory", "sage"];
const AUTO_MS = 4800;

function Chevron({ dir }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      {dir === "prev" ? (
        <path fill="currentColor" d="M14.7 5.3 8 12l6.7 6.7 1.4-1.4L10.8 12l5.3-5.3z" />
      ) : (
        <path fill="currentColor" d="M9.3 5.3 7.9 6.7 13.2 12l-5.3 5.3 1.4 1.4L16 12z" />
      )}
    </svg>
  );
}

export default function ProgramDeck({
  courses,
  t,
  m,
  lang,
  trialIds,
  trialBusy,
  onTrial,
}) {
  const [active, setActive] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const drag = useRef({ on: false, x: 0, dx: 0, swiped: false });
  const n = courses.length;
  const dir = lang === "ur" ? -1 : 1;

  function wrap(i) {
    if (!n) return 0;
    return (i + n) % n;
  }

  function offsetOf(i) {
    let d = i - active;
    if (n > 2) {
      const half = Math.floor(n / 2);
      if (d > half) d -= n;
      if (d < -half) d += n;
    }
    return d;
  }

  function go(step) {
    setActive((i) => wrap(i + step));
  }

  useEffect(() => {
    if (n < 2 || paused || dragging) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % n), AUTO_MS);
    return () => clearInterval(id);
  }, [n, paused, dragging, active]);

  function onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest("a, button")) return;
    drag.current = { on: true, x: e.clientX, dx: 0, swiped: false };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!drag.current.on) return;
    drag.current.dx = e.clientX - drag.current.x;
    setDragX(drag.current.dx);
  }

  function onPointerUp() {
    if (!drag.current.on) return;
    const dx = drag.current.dx;
    drag.current.on = false;
    setDragging(false);
    setDragX(0);
    if (Math.abs(dx) > 64) {
      drag.current.swiped = true;
      if (dx * dir < 0) go(1);
      else go(-1);
    }
  }

  if (!n) return <p className="lede">{t.noFeaturedCourses}</p>;

  return (
    <div
      className="prog-deck"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`prog-stage${dragging ? " is-dragging" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {courses.map((c, i) => {
          const d = offsetOf(i);
          const abs = Math.abs(d);
          const hidden = n > 3 && abs > 2;
          const scale = d === 0 ? 1 : abs === 1 ? 0.84 : 0.72;
          const x = d * 52 * dir + dragX / 8;
          const theme = THEMES[i % THEMES.length];
          const used = trialIds.includes(c.id);
          const busy = trialBusy === c.id;

          return (
            <article
              key={c.id}
              data-card-index={i}
              className={`prog-card prog-card--${theme}${d === 0 ? " is-active" : ""}`}
              style={{
                transform: `translate(-50%, -50%) translateX(${x}%) scale(${scale}) translateZ(0)`,
                zIndex: hidden ? 0 : 30 - abs * 10,
                opacity: hidden ? 0 : 1,
                pointerEvents: hidden ? "none" : "auto",
                cursor: d === 0 ? "grab" : "pointer",
              }}
              onClick={(e) => {
                if (drag.current.swiped) return;
                if (e.target.closest("a, button")) return;
                if (i !== active) setActive(i);
              }}
            >
              {c.image_url ? (
                <div className="prog-card-cover"><img src={c.image_url} alt="" /></div>
              ) : (
                <div className="icon-orb">{c.icon || "ق"}</div>
              )}
              <h3>{c.title}</h3>
              <div className="meta">
                <span>{audienceLabel(c.audiences, t) || t.filterAll}</span>
                <span>·</span>
                <span>{levelLabel(c.levels, t) || c.level}</span>
                {c.length ? <><span>·</span><span>{c.length}</span></> : null}
              </div>
              {Number(c.price_usd) > 0 ? <p className="price">{m(c.price_usd)} <span>{t.perMonth}</span></p> : null}
              <p className="prog-card-blurb">{c.blurb || c.full_blurb}</p>
              <p className="trial-note">{t.firstDayTrial}</p>
              <div className="btn-row prog-card-actions">
                <Link
                  className={`btn btn-sm ${theme === "deep" ? "btn-gold" : "btn-primary"}`}
                  to={coursePath(c)}
                >
                  {t.seeDetails}
                </Link>
                <button
                  className={`btn btn-sm ${theme === "deep" ? "btn-light" : theme === "gold" ? "btn-ghost" : "btn-gold"}`}
                  type="button"
                  disabled={used || busy}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrial(c.id);
                  }}
                >
                  {used ? t.trialUsed : busy ? "..." : t.bookTrial}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {n > 1 ? (
        <div className="prog-deck-nav">
          <button className="prog-deck-arrow" type="button" aria-label={t.back} onClick={() => go(-1)}>
            <Chevron dir="prev" />
          </button>
          <div className="prog-dots">
            {courses.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={i === active ? "is-on" : ""}
                aria-label={c.title}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
          <button className="prog-deck-arrow" type="button" aria-label={t.next} onClick={() => go(1)}>
            <Chevron dir="next" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
