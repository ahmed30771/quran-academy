import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import DashShell from "../components/DashShell";
import { useApp } from "../context/AppContext";
import { api, SITE } from "../api";
import { starLine } from "../helpers";

export default function StudentDash() {
  const { t, showToast, user } = useApp();
  const location = useLocation();
  const [active, setActive] = useState("overview");
  const [data, setData] = useState({ classes: [], homework: [], enrollments: [], stats: {} });
  const [review, setReview] = useState(null);
  const [stars, setStars] = useState(5);
  const [country, setCountry] = useState("");
  const [text, setText] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewErr, setReviewErr] = useState("");

  useEffect(() => {
    const tab = String(location.hash || "").replace(/^#/, "");
    if (tab === "review") setActive("review");
  }, [location.hash]);

  useEffect(() => {
    api("/api/dash/student").then(setData).catch(() => {});
  }, []);

  useEffect(() => {
    if (active !== "review") return;
    api("/api/reviews/mine")
      .then((row) => {
        setReview(row);
        if (row) {
          setStars(Number(row.stars) || 5);
          setCountry(row.country || "");
          setText(row.text || "");
        }
      })
      .catch(() => {});
  }, [active]);

  const next = data.classes[0];
  const course = data.enrollments[0];
  const stats = data.stats || {};
  const firstName = useMemo(() => (user?.name || "").split(" ")[0] || "Student", [user]);
  const lessonsText = `${stats.lessonsDone || 0} / ${stats.totalLessons || 20} lessons`;

  async function saveReview(e) {
    e.preventDefault();
    setReviewErr("");
    setReviewBusy(true);
    try {
      const saved = await api("/api/reviews", {
        method: "POST",
        body: { stars, country, text },
      });
      setReview(saved);
      showToast(review ? t.toastReviewUpdated : t.toastReviewSaved);
    } catch (err) {
      setReviewErr(err.message || t.errReviewSave);
      showToast(err.message || t.errReviewSave);
    } finally {
      setReviewBusy(false);
    }
  }

  const sections = {
    overview: (
      <>
        <div className="grid-2">
          <article className="card dash-hero">
            <p className="kicker">{t.salaam}</p>
            <h2>{`${firstName}, your next class is ${next ? "scheduled" : "waiting"}`}</h2>
            <p>{stats.nextClassText || t.nextClassP}</p>
            {(data.trials || (data.trial ? [data.trial] : [])).length
              ? <p className="trial-note">{t.trialActive}: {(data.trials || [data.trial]).map((row) => row.title).join(" · ")}</p>
              : null}
            <div className="btn-row">
              <button className="btn btn-primary" type="button" onClick={() => showToast(t.toastJoin)}>{t.joinClass}</button>
              <a className="btn btn-ghost" href={SITE.WHATSAPP} target="_blank" rel="noopener">{t.waTeacher}</a>
            </div>
          </article>
          <article className="card cert dash-highlight" id="certificate">
            <p className="kicker" style={{ justifyContent: "center" }}>{t.inProgress}</p>
            <h3>{stats.activeCourse || course?.title || t.certCourse}</h3>
            <p>{stats.certificateText || t.certP}</p>
            <p className="price" style={{ fontSize: "1.2rem" }}>{lessonsText}</p>
          </article>
        </div>
        <div className="rings">
          <article className="card ring-wrap">
            <div className="ring" style={{ "--p": stats.tajweedPercent || 0 }} data-label={`${stats.tajweedPercent || 0}%`} />
            <h3>{t.filterTajweed}</h3>
            <p>{stats.tajweedText || t.ringTajweed}</p>
          </article>
          <article className="card ring-wrap">
            <div className="ring" style={{ "--p": stats.memorizationPercent || 0 }} data-label={`${stats.memorizationPercent || 0}%`} />
            <h3>{t.memorization}</h3>
            <p>{stats.memorizationText || t.ringHifz}</p>
          </article>
          <article className="card ring-wrap">
            <div className="ring" style={{ "--p": stats.attendancePercent || 0 }} data-label={`${stats.attendancePercent || 0}%`} />
            <h3>{t.attendance}</h3>
            <p>{stats.attendanceText || t.last30}</p>
          </article>
        </div>
      </>
    ),
    timetable: (
      <article className="card" id="schedule">
        <h3>{t.upcoming}</h3>
        <table className="table">
          <thead><tr><th>{t.thDay}</th><th>{t.thCourse}</th><th>{t.thTeacher}</th><th>{t.thTime}</th></tr></thead>
          <tbody>
            {data.classes.length ? data.classes.map((c, i) => (
              <tr key={i}><td>{c.day_label}</td><td>{c.course}</td><td>{c.teacher}</td><td>{c.time_label}</td></tr>
            )) : (
              <tr><td colSpan={4}>No classes yet. Enroll in a course to build your timetable.</td></tr>
            )}
          </tbody>
        </table>
      </article>
    ),
    homework: (
      <article className="card" id="homework">
        <h3>{t.assignedHw}</h3>
        <ul style={{ display: "grid", gap: "0.7rem", marginTop: "0.8rem" }}>
          {data.homework.length ? data.homework.map((h) => (
            <li className="mini-row" key={h.id}><span>{h.task}</span><b>{h.due_label}</b></li>
          )) : <li className="mini-row"><span>No homework assigned yet.</span><b>Pending</b></li>}
        </ul>
      </article>
    ),
    certificate: (
      <article className="card cert dash-highlight" id="certificate">
        <p className="kicker" style={{ justifyContent: "center" }}>{t.inProgress}</p>
        <h3>{stats.activeCourse || course?.title || t.certCourse}</h3>
        <p>{stats.certificateText || t.certP}</p>
        <p className="price" style={{ fontSize: "1.2rem" }}>{lessonsText}</p>
      </article>
    ),
    review: (
      <article className="card review-dash" id="review">
        <p className="kicker">{t.myReviewKicker}</p>
        <h3>{t.myReviewTitle}</h3>
        <p>{t.myReviewLede}</p>
        {review ? (
          <p className="review-dash-note">{t.myReviewExists}</p>
        ) : null}
        <form className="review-dash-form" onSubmit={saveReview}>
          <label>
            {t.yourName}
            <input type="text" value={user?.name || ""} readOnly />
          </label>
          <label>
            {t.yourCountry}
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder={t.phCountry}
              required
              maxLength={80}
            />
          </label>
          <fieldset className="star-pick">
            <legend>{t.yourRating}</legend>
            <div className="star-pick-row" role="radiogroup" aria-label={t.yourRating}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={stars === n}
                  className={`star-pick-btn${stars >= n ? " is-on" : ""}`}
                  onClick={() => setStars(n)}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="stars" aria-hidden="true">{starLine(stars)}</p>
          </fieldset>
          <label>
            {t.yourReview}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.phReview}
              required
              minLength={20}
              maxLength={600}
              rows={5}
            />
          </label>
          {reviewErr ? <p className="field-error">{reviewErr}</p> : null}
          <div className="btn-row">
            <button className="btn btn-primary" type="submit" disabled={reviewBusy}>
              {reviewBusy ? t.saving : review ? t.updateReview : t.submitReview}
            </button>
            <Link className="btn btn-ghost" to="/#reviews">{t.seeReviews}</Link>
          </div>
        </form>
      </article>
    ),
  };

  return (
    <DashShell
      role="student"
      searchPlaceholder={t.phSearchLessons}
      activeKey={active}
      onNavChange={setActive}
      navLinks={[
        { key: "overview", label: t.overview },
        { key: "timetable", label: t.timetable },
        { key: "homework", label: t.homework },
        { key: "certificate", label: t.certificate },
        { key: "review", label: t.navReview },
        { to: "/courses", label: t.browseCourses },
      ]}
    >
      {sections[active]}
      <div className="btn-row" style={{ marginTop: "-0.2rem" }}>
        <Link className="btn btn-ghost btn-sm" to="/courses">{t.browseCourses}</Link>
      </div>
    </DashShell>
  );
}
