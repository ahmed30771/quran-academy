import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api, formatMoney } from "../api";
import { audienceLabel, initials, langLabel, levelLabel } from "../helpers";

export default function CourseDetail() {
  const { id } = useParams();
  const { t, currency, user, showToast } = useApp();
  const nav = useNavigate();
  const [course, setCourse] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/api/courses/${id}`).then(setCourse).catch(() => setCourse(null));
    api(`/api/courses/${id}/teachers`).then(setTeachers).catch(() => setTeachers([]));
  }, [id]);

  async function enroll() {
    if (!user) return nav("/login");
    if (user.role !== "student") {
      showToast("Only student accounts can enroll.");
      return;
    }
    try {
      setBusy(true);
      const res = await api(`/api/courses/${course.id}/enroll`, { method: "POST", body: { plan: "standard" } });
      showToast(res.already ? "You are already enrolled in this course." : `Enrollment request sent for ${course.title}.`);
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

  return (
    <main>
      <section className="page-hero">
        <div className="pattern-corner tl" />
        <div className="wrap">
          <p className="kicker">{t.courseKicker}</p>
          <h1>{course.title}</h1>
          <p className="lede">{course.intro || course.blurb}</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap course-detail">
          <div className="course-cover course-cover-lg">
            {course.image_url ? <img src={course.image_url} alt="" /> : <span>{t.courseImageSoon}</span>}
          </div>
          <div className="meta">
            <span>{audienceLabel(course.audiences, t)}</span>
            <span>·</span>
            <span>{course.category}</span>
            <span>·</span>
            <span>{levelLabel(course.levels, t) || course.level}</span>
          </div>
          {Number(course.price_usd) > 0 ? <p className="price">{formatMoney(course.price_usd, currency)} <span>{t.perMonth}</span></p> : null}
          <p>{course.description || course.full_blurb || course.blurb}</p>
          <div className="grid-2" style={{ marginTop: "1.5rem" }}>
            <article className="card">
              <h3>{t.whoFor}</h3>
              <p>{course.who_for || audienceLabel(course.audiences, t)}</p>
            </article>
            <article className="card">
              <h3>{t.willLearn}</h3>
              <p>{course.learnings || course.blurb}</p>
            </article>
            <article className="card">
              <h3>{t.courseDuration}</h3>
              <p>{[course.duration, course.length].filter(Boolean).join(" · ") || "—"}</p>
            </article>
            <article className="card">
              <h3>{t.classFrequency}</h3>
              <p>{course.frequency || "—"}</p>
            </article>
          </div>
          <article className="card" style={{ marginTop: "1.25rem" }}>
            <h3>{t.courseReqs}</h3>
            <p>{course.requirements || "—"}</p>
          </article>
          <div className="btn-row">
            <button className="btn btn-gold" type="button" disabled={busy} onClick={enroll}>{busy ? "..." : t.enroll}</button>
            <Link className="btn btn-ghost" to="/courses">{t.courses}</Link>
          </div>
          <div className="section-head" style={{ marginTop: "2.4rem" }}>
            <p className="kicker">{t.teachKicker}</p>
            <h2>{t.teachersForCourse}</h2>
          </div>
          <div className="grid-3">
            {teachers.length ? teachers.map((p) => (
              <Link className="card teacher-card" to={`/teachers/${p.id}`} key={p.id}>
                <div className="avatar">{p.avatar ? <img src={p.avatar} alt="" /> : initials(p.name)}</div>
                <h3>{p.name}</h3>
                <p>{langLabel(p.teaching_languages, t)}</p>
              </Link>
            )) : <p className="lede">{t.courseTeachersEmpty}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
