import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const SPINE_PATH = "M 50 0 L 50 920";

export default function TutorialProcess({ t }) {
  const steps = [
    { n: "1", title: t.tutH1, body: t.tutP1 },
    { n: "2", title: t.tutH2, body: t.tutP2 },
    { n: "3", title: t.tutH3, body: t.tutP3 },
    { n: "4", title: t.tutH4, body: t.tutP4 },
  ];
  const root = useRef(null);
  const fillRef = useRef(null);
  const pathLen = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = root.current;
    const fill = fillRef.current;
    if (!el || !fill) return;

    function measure() {
      try {
        pathLen.current = fill.getTotalLength();
      } catch {
        pathLen.current = 1400;
      }
      fill.style.strokeDasharray = `${pathLen.current}`;
      fill.style.strokeDashoffset = `${pathLen.current}`;
    }

    measure();

    function update() {
      const len = pathLen.current || 1;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const head = vh * 0.5;
      const span = Math.max(rect.bottom - rect.top, 1);
      const p = Math.min(1, Math.max(0, (head - rect.top) / span));
      fill.style.strokeDashoffset = `${len * (1 - p)}`;
      setProgress(p);
    }

    update();
    const onScroll = () => update();
    const onResize = () => {
      measure();
      update();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="tut-process" ref={root}>
      <div className="tut-spine" aria-hidden="true">
        <svg className="tut-spine-svg" viewBox="0 0 100 920" preserveAspectRatio="none">
          <path className="tut-spine-track" d={SPINE_PATH} fill="none" />
          <path ref={fillRef} className="tut-spine-fill" d={SPINE_PATH} fill="none" />
        </svg>
      </div>

      {steps.map((s, i) => {
        const side = i % 2 === 0 ? "left" : "right";
        const lit = progress >= (i + 0.35) / steps.length;
        return (
          <div className="tut-step-slot" key={s.n}>
            <article
              data-tut-step={i}
              className={`tut-step is-${side}${lit ? " is-on" : ""}`}
              style={{
                top: `calc(var(--header-h) + ${0.7 + i * 0.55}rem)`,
                zIndex: i + 1,
              }}
            >
              <div className={`tut-node${lit ? " is-lit" : ""}`} aria-hidden="true">
                <span>{s.n}</span>
              </div>
              <div className="tut-step-copy">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                {i === steps.length - 1 ? (
                  <Link className="btn btn-gold btn-shimmer" to="/login">{t.createAccount}</Link>
                ) : null}
              </div>
            </article>
          </div>
        );
      })}
    </div>
  );
}
