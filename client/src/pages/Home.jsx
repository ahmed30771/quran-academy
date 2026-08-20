import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api, formatMoney } from "../api";
import { localized } from "../helpers";
import TeacherCard from "../components/TeacherCard";
import ProgramDeck from "../components/ProgramDeck";
import TutorialProcess from "../components/TutorialProcess";
import ReviewSpotlight from "../components/ReviewSpotlight";

export default function Home() {
  const { t, lang, currency, user, showToast } = useApp();
  const nav = useNavigate();
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
    if (!user) return nav("/login", { state: { from: `/courses/${courseId}` } });
    if (user.role !== "student") {
      showToast(t.onlyStudentTrial);
      return;
    }
    nav(`/courses/${courseId}#choose-teacher`);
  }
  const m = (n) => formatMoney(n, currency);
  const faqs = [
    [t.faq1q, t.faq1a],
    [t.faq2q, t.faq2a],
    [t.faq3q, t.faq3a],
    [t.faq4q, t.faq4a],
  ];
  const faculty = teachers;
  const topReviews = reviews.slice(0, 6).map((row) => localized(row, lang));
  const reviewAvg = topReviews.length
    ? (topReviews.reduce((sum, r) => sum + (Number(r.stars) || 0), 0) / topReviews.length).toFixed(1)
    : "";
  const featured = courses.map((row) => localized(row, lang));
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
              <div className="mission-card-body">
                <p className="kicker">{t.mission}</p>
                <h3>{t.mission}</h3>
                <p>{t.missionP}</p>
              </div>
            </article>
            <article className="card mission-card mission-card--vision">
              <div className="mission-card-body">
                <p className="kicker">{t.homeVisionTitle}</p>
                <h3>{t.homeVisionTitle}</h3>
                <p>{t.homeVisionP}</p>
              </div>
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

      <section className="section section-emerald" id="tutorial">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">{t.tutKicker}</p>
            <h2>{t.tutTitle}</h2>
            <p className="lede">{t.tutLede}</p>
          </div>
          <TutorialProcess t={t} />
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

      <section className="section section-emerald" id="programs">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.progFeatKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.progFeatTitle}</h2>
            <p className="lede">{t.progFeatLede}</p>
          </div>
          <ProgramDeck
            courses={featured}
            t={t}
            m={m}
            lang={lang}
            trialIds={trialIds}
            trialBusy={trialBusy}
            onTrial={bookTrial}
          />
          <div className="btn-row" style={{ justifyContent: "center", marginTop: "1.6rem" }}>
            <Link className="btn btn-gold" to="/courses">{t.viewCourses}</Link>
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

      <section className="section section-sage" id="reviews">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.revKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.revTitle}</h2>
            <p className="lede">{t.revLede}</p>
          </div>
          {topReviews.length ? (
            <ReviewSpotlight
              reviews={topReviews}
              avg={reviewAvg}
              note={t.revScoreNote}
              t={t}
            />
          ) : (
            <p className="lede">{t.noReviewsYet}</p>
          )}
          <div className="btn-row" style={{ justifyContent: "center", marginTop: "1.4rem" }}>
            {user?.role === "student" ? (
              <Link className="btn btn-primary" to="/student/dashboard#review">{t.leaveReview}</Link>
            ) : (
              <Link className="btn btn-ghost" to="/login">{t.leaveReviewLogin}</Link>
            )}
          </div>
          <p className="lede" style={{ textAlign: "center", marginTop: "0.6rem", maxWidth: "36rem", marginInline: "auto" }}>
            {t.leaveReviewHint}
          </p>
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
