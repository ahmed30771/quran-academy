import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api, formatMoney } from "../api";
import { audienceLabel, categoryLabel, coursePath, initials, langLabel, levelLabel, localized, startCourseTrial, starLine } from "../helpers";
import PageHero from "../components/PageHero";

export default function CourseDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { t, lang, currency, user, showToast } = useApp();
  const nav = useNavigate();
  const [course, setCourse] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [busy, setBusy] = useState(false);
  const [trialBusy, setTrialBusy] = useState(false);
  const [trialUsed, setTrialUsed] = useState(false);

  useEffect(() => {
    api(`/api/courses/${id}`).then(setCourse).catch(() => setCourse(null));
    api(`/api/courses/${id}/teachers`)
      .then((rows) => {
        setTeachers(rows || []);
        if (rows?.length === 1) setSelectedTeacher(rows[0].id);
      })
      .catch(() => setTeachers([]));
  }, [id]);

  useEffect(() => {
    if (!user || user.role !== "student" || !id) {
      setTrialUsed(false);
      return;
    }
    api("/api/courses/trial/me")
      .then((d) => setTrialUsed((d.courseIds || []).includes(course?.id || id)))
      .catch(() => setTrialUsed(false));
  }, [user, id, course?.id]);

  useEffect(() => {
    if (location.hash === "#choose-teacher") {
      document.getElementById("choose-teacher")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash, teachers.length]);

  function needTeacher() {
    if (!teachers.length) return false;
    if (!selectedTeacher) {
      showToast(t.pickTeacherFirst);
      document.getElementById("choose-teacher")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    }
    return false;
  }

  async function bookTrial() {
    if (needTeacher()) return;
    setTrialBusy(true);
    const res = await startCourseTrial({
      nav,
      user,
      showToast,
      t,
      courseId: course.id,
      teacherId: selectedTeacher,
    });
    if (res?.ok) setTrialUsed(true);
    setTrialBusy(false);
  }

  async function enroll() {
    if (!user) return nav("/login", { state: { from: coursePath(course) } });
    if (user.role !== "student") {
      showToast("Only student accounts can enroll.");
      return;
    }
    if (needTeacher()) return;
    try {
      setBusy(true);
      const res = await api(`/api/courses/${course.id}/enroll`, {
        method: "POST",
        body: { plan: "standard", teacherId: selectedTeacher || undefined },
      });
      if (res.already && res.updatedTeacher) {
        showToast(t.toastTeacherUpdated);
      } else if (res.already) {
        showToast(t.alreadyEnrolled);
      } else {
        const name = res.teacher?.name ? ` · ${res.teacher.name}` : "";
        showToast(`${t.enrollSent}${name}`);
      }
    } catch (e) {
      showToast(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!course) {
    return (
      <main>
        <section className="section">
          <div className="wrap"><p className="lede">{t.courseKicker}</p></div>
        </section>
      </main>
    );
  }

  const view = localized(course, lang);

  return (
    <main>
      <PageHero kicker={t.courseKicker} title={view.title} lede={view.intro || view.blurb} />
      <section className="section">
        <div className="wrap course-detail">
          <div className="course-cover course-cover-lg">
            {view.image_url ? <img src={view.image_url} alt="" /> : <span>{t.courseImageSoon}</span>}
          </div>
          <div className="meta">
            <span>{audienceLabel(view.audiences, t)}</span>
            <span>·</span>
            <span>{categoryLabel(view.category, t)}</span>
            <span>·</span>
            <span>{levelLabel(view.levels, t) || view.level}</span>
          </div>
          {Number(view.price_usd) > 0 ? <p className="price">{formatMoney(view.price_usd, currency)} <span>{t.perMonth}</span></p> : null}
          <p>{view.description || view.full_blurb || view.blurb}</p>
          <div className="grid-2" style={{ marginTop: "1.5rem" }}>
            <article className="card">
              <h3>{t.whoFor}</h3>
              <p>{view.who_for || audienceLabel(view.audiences, t)}</p>
            </article>
            <article className="card">
              <h3>{t.willLearn}</h3>
              <p>{view.learnings || view.blurb}</p>
            </article>
            <article className="card">
              <h3>{t.courseDuration}</h3>
              <p>{[...new Set([view.duration, view.length].filter(Boolean))].join(" · ") || "—"}</p>
            </article>
            <article className="card">
              <h3>{t.classFrequency}</h3>
              <p>{view.frequency || "—"}</p>
            </article>
          </div>
          <article className="card" style={{ marginTop: "1.25rem" }}>
            <h3>{t.courseReqs}</h3>
            <p>{view.requirements || "—"}</p>
          </article>

          <div className="section-head" id="choose-teacher" style={{ marginTop: "2.4rem" }}>
            <p className="kicker">{t.teachKicker}</p>
            <h2>{t.chooseTeacherTitle}</h2>
            <p className="lede">{t.chooseTeacherLede}</p>
          </div>
          <div className="grid-3 teacher-pick-grid">
            {teachers.length ? teachers.map((p) => {
              const tv = localized(p, lang);
              const on = selectedTeacher === p.id;
              return (
                <article
                  key={p.id}
                  className={`card teacher-card teacher-pick${on ? " is-selected" : ""}`}
                >
                  <button
                    type="button"
                    className="teacher-pick-select"
                    onClick={() => setSelectedTeacher(p.id)}
                    aria-pressed={on}
                  >
                    <div className="avatar">{p.avatar ? <img src={p.avatar} alt="" /> : initials(p.name)}</div>
                    <h3>{tv.name}</h3>
                    <p className="stars" aria-label={`${p.rating || 5} stars`}>{starLine(p.rating || 5)}</p>
                    <p>{langLabel(p.teaching_languages, t)}</p>
                    <span className="teacher-pick-mark">{on ? t.teacherSelected : t.selectTeacher}</span>
                  </button>
                  <Link className="teacher-pick-profile" to={`/teachers/${p.id}`}>
                    {t.viewProfile}
                  </Link>
                </article>
              );
            }) : <p className="lede">{t.courseTeachersEmpty}</p>}
          </div>

          <p className="trial-note" style={{ marginTop: "1.4rem" }}>{t.firstDayTrial}</p>
          <div className="btn-row">
            <button className="btn btn-gold" type="button" disabled={trialUsed || trialBusy} onClick={bookTrial}>
              {trialUsed ? t.trialUsed : trialBusy ? "..." : t.bookTrial}
            </button>
            <button className="btn btn-primary" type="button" disabled={busy} onClick={enroll}>{busy ? "..." : t.enroll}</button>
            <Link className="btn btn-ghost" to="/courses">{t.courses}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
