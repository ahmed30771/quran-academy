import { useEffect, useState } from "react";
import DashShell from "../components/DashShell";
import { useApp } from "../context/AppContext";
import { api, formatMoney } from "../api";

export default function TeacherDash() {
  const { t, currency, showToast } = useApp();
  const [data, setData] = useState({ classes: [], students: [], homework: [] });
  const [present, setPresent] = useState({});
  const [task, setTask] = useState("");
  const [studentId, setStudentId] = useState("");

  function load() {
    api("/api/dash/teacher").then((d) => {
      setData(d);
      setStudentId((prev) => prev || String(d.students[0]?.id || ""));
    }).catch(() => {});
  }

  useEffect(load, []);

  async function assignHw(e) {
    e.preventDefault();
    try {
      await api("/api/dash/homework", { method: "POST", body: { studentId, task, dueLabel: "Due soon" } });
      setTask("");
      showToast(t.toastHw);
      load();
    } catch (err) {
      showToast(err.message);
    }
  }

  return (
    <DashShell
      role="teacher"
      searchPlaceholder={t.phSearchStudents}
      navLinks={[
        { to: "/teacher", label: t.today },
        { to: "#students", label: t.students },
        { to: "#homework", label: t.homework },
        { to: "#earnings", label: t.summary },
      ]}
    >
      <div className="kpi" id="earnings">
        <article className="card"><h4>{t.classesToday}</h4><p className="num">{data.classes.length}</p></article>
        <article className="card"><h4>{t.activeStudents}</h4><p className="num">{data.students.length}</p></article>
        <article className="card"><h4>{t.hoursWeek}</h4><p className="num">{Math.max(1, data.classes.length * 2)}</p></article>
        <article className="card"><h4>{t.earnings}</h4><p className="num">{formatMoney(420, currency)}</p></article>
      </div>
      <article className="card">
        <h3>{t.todaysClasses}</h3>
        <table className="table">
          <thead><tr><th>{t.thTime}</th><th>{t.thCourse}</th><th>{t.thStudent}</th><th>{t.thStatus}</th></tr></thead>
          <tbody>
            {data.classes.map((c) => (
              <tr key={c.id}>
                <td>{c.time_label}</td>
                <td>{c.course}</td>
                <td>{c.student || "—"}</td>
                <td><span className="badge">{t.upcomingBadge}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
      <article className="card" id="students">
        <h3>{t.studentList}</h3>
        <table className="table">
          <thead><tr><th>{t.thStudent}</th><th>{t.thLevel}</th><th>{t.thPresent}</th></tr></thead>
          <tbody>
            {data.students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.course}</td>
                <td>
                  <button
                    className={`toggle${present[s.id] !== false ? " on" : ""}`}
                    type="button"
                    onClick={() => setPresent((p) => ({ ...p, [s.id]: p[s.id] === false }))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
      <article className="card" id="homework">
        <h3>{t.assignHw}</h3>
        <form className="form" onSubmit={assignHw}>
          <label>
            <span>{t.fldStudent}</span>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              {data.students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label>
            <span>{t.fldTask}</span>
            <textarea required placeholder={t.phTask} value={task} onChange={(e) => setTask(e.target.value)} />
          </label>
          <button className="btn btn-primary" type="submit">{t.assign}</button>
        </form>
        <ul style={{ display: "grid", gap: "0.7rem", marginTop: "1rem" }}>
          {data.homework.map((h) => (
            <li className="mini-row" key={h.id}><span>{h.student}: {h.task}</span><b>{h.due_label}</b></li>
          ))}
        </ul>
      </article>
    </DashShell>
  );
}
