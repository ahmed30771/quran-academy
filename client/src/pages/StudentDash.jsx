import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashShell from "../components/DashShell";
import { useApp } from "../context/AppContext";
import { api, SITE } from "../api";

export default function StudentDash() {
  const { t, showToast } = useApp();
  const [data, setData] = useState({ classes: [], homework: [], enrollments: [] });

  useEffect(() => {
    api("/api/dash/student").then(setData).catch(() => {});
  }, []);

  const next = data.classes[0];
  const course = data.enrollments[0];

  return (
    <DashShell
      role="student"
      searchPlaceholder={t.phSearchLessons}
      navLinks={[
        { to: "/student", label: t.overview },
        { to: "#schedule", label: t.timetable },
        { to: "#homework", label: t.homework },
        { to: "#certificate", label: t.certificate },
        { to: "/courses", label: t.browseCourses },
      ]}
    >
      <div className="grid-2">
        <article className="card">
          <p className="kicker">{t.salaam}</p>
          <h2>{t.nextClass}</h2>
          <p>{next ? `${next.course} with ${next.teacher} · ${next.day_label} ${next.time_label}` : t.nextClassP}</p>
          <div className="btn-row">
            <button className="btn btn-primary" type="button" onClick={() => showToast(t.toastJoin)}>{t.joinClass}</button>
            <a className="btn btn-ghost" href={SITE.WHATSAPP} target="_blank" rel="noopener">{t.waTeacher}</a>
          </div>
        </article>
        <article className="card cert" id="certificate">
          <p className="kicker" style={{ justifyContent: "center" }}>{t.inProgress}</p>
          <h3>{course?.title || t.certCourse}</h3>
          <p>{t.certP}</p>
          <p className="price" style={{ fontSize: "1.2rem" }}>{t.lessonsN}</p>
        </article>
      </div>
      <div className="rings">
        <article className="card ring-wrap">
          <div className="ring" style={{ "--p": 72 }} data-label="72%" />
          <h3>{t.filterTajweed}</h3>
          <p>{t.ringTajweed}</p>
        </article>
        <article className="card ring-wrap">
          <div className="ring" style={{ "--p": 45 }} data-label="45%" />
          <h3>{t.memorization}</h3>
          <p>{t.ringHifz}</p>
        </article>
        <article className="card ring-wrap">
          <div className="ring" style={{ "--p": 90 }} data-label="90%" />
          <h3>{t.attendance}</h3>
          <p>{t.last30}</p>
        </article>
      </div>
      <article className="card" id="schedule">
        <h3>{t.upcoming}</h3>
        <table className="table">
          <thead><tr><th>{t.thDay}</th><th>{t.thCourse}</th><th>{t.thTeacher}</th><th>{t.thTime}</th></tr></thead>
          <tbody>
            {data.classes.length ? data.classes.map((c, i) => (
              <tr key={i}><td>{c.day_label}</td><td>{c.course}</td><td>{c.teacher}</td><td>{c.time_label}</td></tr>
            )) : (
              <tr><td colSpan={4}>{t.browseCourses}</td></tr>
            )}
          </tbody>
        </table>
      </article>
      <article className="card" id="homework">
        <h3>{t.assignedHw}</h3>
        <ul style={{ display: "grid", gap: "0.7rem", marginTop: "0.8rem" }}>
          {data.homework.map((h) => (
            <li className="mini-row" key={h.id}><span>{h.task}</span><b>{h.due_label}</b></li>
          ))}
        </ul>
        <div className="btn-row" style={{ marginTop: "1rem" }}>
          <Link className="btn btn-ghost btn-sm" to="/courses">{t.browseCourses}</Link>
        </div>
      </article>
    </DashShell>
  );
}
