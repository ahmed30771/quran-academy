import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api, formatMoney } from "../api";
import { audienceLabel, coursePath, levelLabel, localized, starLine, startCourseTrial } from "../helpers";
import TeacherCard from "../components/TeacherCard";

export default function Home() {
  const { t, lang, currency, user, showToast } = useApp();
  const nav = useNavigate();
  const [tut, setTut] = useState(0);
  const [faq, setFaq] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trialIds, setTrialIds] = useState([]);
  const [trialBusy, setTrialBusy] = useState("");

  useEffect(() => {
    api("/api/reviews").then(setReviews).catch(() => setReviews([]));
    api("/api/teachers").then(setTeachers).catch(() => setTeachers([]));
    api("/api/courses").then(setCourses).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!user || user.role !== "student") {
      setTrialIds([]);
      return;
    }
    api("/api/courses/trial/me").then((d) => setTrialIds(d.courseIds || [])).catch(() => setTrialIds([]));
  }, [user]);

  async function bookTrial(courseId) {
    setTrialBusy(courseId);
    const res = await startCourseTrial({ nav, user, showToast, t, courseId });
    if (res?.ok) setTrialIds((ids) => (ids.includes(courseId) ? ids : [...ids, courseId]));
    setTrialBusy("");
  }
  const m = (n) => formatMoney(n, currency);
  const panels = [
    [t.tutH1, t.tutP1],
    [t.tutH2, t.tutP2],
    [t.tutH3, t.tutP3],
    [t.tutH4, t.tutP4],
  ];
  const faqs = [
    [t.faq1q, t.faq1a],
    [t.faq2q, t.faq2a],
    [t.faq3q, t.faq3a],
    [t.faq4q, t.faq4a],
  ];
  const faculty = teachers;
  const topReviews = reviews.slice(0, 4).map((row) => localized(row, lang));
  const featuredReview = topReviews[0];
  const otherReviews = topReviews.slice(1);
  const reviewAvg = topReviews.length
    ? (topReviews.reduce((sum, r) => sum + (Number(r.stars) || 0), 0) / topReviews.length).toFixed(1)
    : "";
  const featured = courses.map((row) => localized(row, lang));
  const leadCourse = featured[0];
  const stackCourses = featured.slice(1, 3);
  const stripCourses = featured.slice(3, 8);
  const loopTeachers = faculty.length > 2 ? [...faculty, ...faculty] : faculty;

  return (
    <main>
      <section className="hero hero-cover">
        <div className="hero-overlay" />
        <div className="wrap">
          <div className="hero-copy">
            <p className="kicker">{t.heroKicker}</p>
            <h1>{t.heroTitle}</h1>
            <p className="intro">{t.heroIntro}</p>
            <p className="hero-note">{t.heroNote}</p>
            <div className="btn-row">
              <Link className="btn btn-gold btn-shimmer" to="/courses">{t.startTrial}</Link>
              <Link className="btn btn-ghost" to="/courses">{t.viewCourses}</Link>
            </div>
            <div className="trust-row">
              <span>{t.trust1}</span><span>{t.trust2}</span><span>{t.trust3}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="mission">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.homeMissionKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.homeMissionTitle}</h2>
          </div>
          <div className="grid-2 mission-grid">
            <article className="card mission-card">
              <p className="kicker">{t.mission}</p>
              <h3>{t.mission}</h3>
              <p>{t.missionP}</p>
            </article>
            <article className="card mission-card">
              <p className="kicker">{t.homeVisionTitle}</p>
              <h3>{t.homeVisionTitle}</h3>
              <p>{t.homeVisionP}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-sage" id="how">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.howKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.howTitle}</h2>
            <p className="lede">{t.howLede}</p>
          </div>
          <div className="steps">
            {[[t.step1, t.step1p], [t.step2, t.step2p], [t.step3, t.step3p], [t.step4, t.step4p]].map(([h, p], i) => (
              <article className="card step" key={h}>
                <div className="step-num">{i + 1}</div>
                <h3>{h}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="tutorial">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">{t.tutKicker}</p>
            <h2>{t.tutTitle}</h2>
            <p className="lede">{t.tutLede}</p>
          </div>
          <div className="tutorial">
            <div className="tut-nav">
              {[t.tutNav1, t.tutNav2, t.tutNav3, t.tutNav4].map((label, i) => (
                <button key={label} type="button" className={tut === i ? "is-on" : ""} onClick={() => setTut(i)}>{label}</button>
              ))}
            </div>
            <div>
              <div className="tut-panel">
                <h3>{panels[tut][0]}</h3>
                <p>{panels[tut][1]}</p>
              </div>
              <div className="tut-actions">
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setTut((n) => Math.max(0, n - 1))}>{t.back}</button>
                <button className="btn btn-primary btn-sm" type="button" onClick={() => setTut((n) => Math.min(3, n + 1))}>{t.next}</button>
                <Link className="btn btn-gold btn-sm btn-shimmer" to="/login">{t.createAccount}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-sage" id="why">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.whyKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.whyTitle}</h2>
            <p className="lede">{t.whyLede}</p>
          </div>
          <div className="grid-4 why-grid">
            {[
              ["ت", t.why1, t.why1p],
              ["ق", t.why2, t.why2p],
              ["ح", t.why3, t.why3p],
              ["ع", t.why4, t.why4p],
            ].map(([orb, title, blurb]) => (
              <article className="card why-card" key={title}>
                <div className="icon-orb">{orb}</div>
                <h3>{title}</h3>
                <p>{blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="programs">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.progFeatKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.progFeatTitle}</h2>
            <p className="lede">{t.progFeatLede}</p>
          </div>
          <div className="prog-feat">
            {leadCourse ? (
              <article className="card prog-lead">
                <span className="badge">{t.startHere}</span>
                {leadCourse.image_url ? (
                  <div className="course-cover"><img src={leadCourse.image_url} alt="" /></div>
                ) : (
                  <div className="icon-orb">{leadCourse.icon || "ق"}</div>
                )}
                <h3>{leadCourse.title}</h3>
                <div className="meta">
                  <span>{audienceLabel(leadCourse.audiences, t) || t.filterAll}</span>
                  <span>·</span>
                  <span>{levelLabel(leadCourse.levels, t) || leadCourse.level}</span>
                  {leadCourse.length ? <><span>·</span><span>{leadCourse.length}</span></> : null}
                </div>
                {Number(leadCourse.price_usd) > 0 ? <p className="price">{m(leadCourse.price_usd)} <span>{t.perMonth}</span></p> : null}
                <p>{leadCourse.blurb || leadCourse.full_blurb}</p>
                <p className="trial-note">{t.firstDayTrial}</p>
                <div className="btn-row">
                  <Link className="btn btn-gold btn-sm" to={coursePath(leadCourse)}>{t.seeDetails}</Link>
                  <button className="btn btn-primary btn-sm" type="button" disabled={trialIds.includes(leadCourse.id) || trialBusy === leadCourse.id} onClick={() => bookTrial(leadCourse.id)}>
                    {trialIds.includes(leadCourse.id) ? t.trialUsed : trialBusy === leadCourse.id ? "..." : t.bookTrial}
                  </button>
                </div>
              </article>
            ) : (
              <p className="lede">{t.noFeaturedCourses}</p>
            )}
            {stackCourses.length ? (
              <div className="prog-stack">
                {stackCourses.map((c) => (
                  <article className="card prog-side" key={c.id}>
                    <div className="icon-orb">{c.icon || "ق"}</div>
                    <div>
                      <h3>{c.title}</h3>
                      <div className="meta">
                        <span>{audienceLabel(c.audiences, t) || t.filterAll}</span>
                        {c.length ? <><span>·</span><span>{c.length}</span></> : null}
                      </div>
                      {Number(c.price_usd) > 0 ? <p className="price">{m(c.price_usd)} <span>{t.perMonth}</span></p> : null}
                      <p>{c.blurb || c.full_blurb}</p>
                      <p className="trial-note">{t.firstDayTrial}</p>
                      <div className="btn-row">
                        <Link className="btn btn-primary btn-sm" to={coursePath(c)}>{t.seeDetails}</Link>
                        <button className="btn btn-gold btn-sm" type="button" disabled={trialIds.includes(c.id) || trialBusy === c.id} onClick={() => bookTrial(c.id)}>
                          {trialIds.includes(c.id) ? t.trialUsed : trialBusy === c.id ? "..." : t.bookTrial}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
          {stripCourses.length ? (
            <div className="prog-strip">
              {stripCourses.map((c) => (
                <article className="card" key={c.id}>
                  <div className="icon-orb">{c.icon || "ق"}</div>
                  <h3>{c.title}</h3>
                  {Number(c.price_usd) > 0 ? <p className="price">{m(c.price_usd)} <span>{t.perMonth}</span></p> : null}
                  <p>{c.blurb || c.full_blurb}</p>
                  <p className="trial-note">{t.firstDayTrial}</p>
                  <div className="btn-row">
                    <Link className="btn btn-ghost btn-sm" to={coursePath(c)}>{t.seeDetails}</Link>
                    <button className="btn btn-gold btn-sm" type="button" disabled={trialIds.includes(c.id) || trialBusy === c.id} onClick={() => bookTrial(c.id)}>
                      {trialIds.includes(c.id) ? t.trialUsed : trialBusy === c.id ? "..." : t.bookTrial}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          <div className="btn-row" style={{ justifyContent: "center", marginTop: "1.6rem" }}>
            <Link className="btn btn-primary" to="/courses">{t.viewCourses}</Link>
          </div>
        </div>
      </section>

      <section className="section mid-cta">
        <div className="wrap center">
          <p className="kicker">{t.ctaKicker}</p>
          <h2>{t.midCtaTitle}</h2>
          <p className="lede">{t.midCtaLede}</p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link className="btn btn-gold" to="/courses">{t.startTrial}</Link>
            <Link className="btn btn-ghost" to="/courses">{t.viewCourses}</Link>
          </div>
        </div>
      </section>

      <section className="section section-sage" id="teachers">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.teachKicker}</p>
            <h2>{t.teachTitle}</h2>
            <p className="lede">{t.teachLede}</p>
          </div>
          <div className="teacher-loop">
            {faculty.length ? (
              <div className={`teacher-loop-track${faculty.length > 2 ? " is-looping" : ""}`}>
                {loopTeachers.map((p, i) => (
                  <TeacherCard key={`${p.id}-${i}`} teacher={p} t={t} compact />
                ))}
              </div>
            ) : (
              <p className="lede">{t.noTeachersList}</p>
            )}
          </div>
          <div className="btn-row" style={{ justifyContent: "center", marginTop: "1.6rem" }}>
            <Link className="btn btn-primary" to="/teachers">{t.viewMore}</Link>
          </div>
        </div>
      </section>

      <section className="section" id="preview">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.previewKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.previewTitle}</h2>
            <p className="lede">{t.previewLede}</p>
          </div>
          <div className="grid-3 preview-grid">
            {[
              [t.preview1, t.preview1p, "preview-next"],
              [t.preview2, t.preview2p, "preview-hw"],
              [t.preview3, t.preview3p, "preview-att"],
            ].map(([title, blurb, kind]) => (
              <article className="card preview-card" key={title}>
                <div className={`preview-visual ${kind}`} aria-hidden="true">
                  {kind === "preview-att" ? <span className="preview-ring" /> : null}
                </div>
                <h3>{title}</h3>
                <p>{blurb}</p>
              </article>
            ))}
          </div>
          <div className="btn-row" style={{ justifyContent: "center", marginTop: "1.6rem" }}>
            <Link className="btn btn-primary" to="/login">{t.openDash}</Link>
            <Link className="btn btn-ghost" to="/login">{t.createAccount}</Link>
          </div>
        </div>
      </section>

      <section className="section" id="reviews">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.revKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.revTitle}</h2>
            <p className="lede">{t.revLede}</p>
          </div>
          {topReviews.length ? (
            <>
              <div className="rev-score">
                <strong>{reviewAvg}</strong>
                <div>
                  <div className="stars">{starLine(Number(reviewAvg))}</div>
                  <p>{t.revScoreNote}</p>
                </div>
              </div>
              {featuredReview ? (
                <article className="card review review-feat">
                  <div className="stars">{starLine(featuredReview.stars)}</div>
                  <p>{featuredReview.text}</p>
                  <footer>{featuredReview.name}<span>{featuredReview.country}</span></footer>
                </article>
              ) : null}
              {otherReviews.length ? (
                <div className="grid-3">
                  {otherReviews.map((r) => (
                    <article className="card review" key={r.id || `${r.name}-${r.text}`}>
                      <div className="stars">{starLine(r.stars)}</div>
                      <p>{r.text}</p>
                      <footer>{r.name}<span>{r.country}</span></footer>
                    </article>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p className="lede">{t.noReviewsYet}</p>
          )}
        </div>
      </section>

      <section className="section section-sage" id="events">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.eventsKicker}</p>
            <h2>{t.eventsTitle}</h2>
            <p className="lede">{t.eventsLede}</p>
          </div>
          <div className="grid-2">
            {[
              [t.event1t, t.event1d, t.event1p],
              [t.event2t, t.event2d, t.event2p],
            ].map(([title, date, blurb]) => (
              <article className="card event-card" key={title}>
                <span className="badge">{t.eventSoon}</span>
                <h3>{title}</h3>
                <p className="event-date">{date}</p>
                <p>{blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="verse">
            <p className="kicker" style={{ justifyContent: "center" }}>{t.verseKicker}</p>
            <p className="arabic">إِنَّ مَعَ الْعُسْرِ يُسْرًا</p>
            <p className="trans">{t.verseTrans}</p>
            <p className="ref">{t.verseRef}</p>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.faqKicker}</p>
            <h2>{t.faqTitle}</h2>
          </div>
          <div className="faq">
            {faqs.map(([q, a], i) => (
              <div className={`faq-item${faq === i ? " open" : ""}`} key={q}>
                <button type="button" onClick={() => setFaq(faq === i ? -1 : i)}>
                  <span>{q}</span><span>{faq === i ? "−" : "+"}</span>
                </button>
                <div className="answer">{a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-emerald">
        <div className="wrap center">
          <p className="kicker">{t.ctaKicker}</p>
          <h2>{t.ctaTitle}</h2>
          <p className="lede" style={{ color: "rgba(255,255,255,0.75)" }}>{t.ctaLede}</p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link className="btn btn-gold" to="/courses">{t.startTrial}</Link>
            <Link className="btn btn-light" to="/contact">{t.contactUs}</Link>
            <Link className="btn btn-light" to="/courses">{t.viewCourses}</Link>
            <Link className="btn btn-light" to="/login">{t.teachWithUs}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
