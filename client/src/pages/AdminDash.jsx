import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashShell from "../components/DashShell";
import { useApp } from "../context/AppContext";
import { api } from "../api";

export default function AdminDash() {
  const { t, showToast } = useApp();
  const [data, setData] = useState({
    kpi: { students: 0, teachers: 0, classes: 0 },
    enrollments: [],
    inbox: [],
    pendingTeachers: [],
    posts: [],
  });

  function load() {
    api("/api/dash/admin").then(setData).catch(() => {});
  }

  useEffect(load, []);

  async function decide(id, approve) {
    try {
      await api(`/api/dash/admin/teachers/${id}/approve`, { method: "POST", body: { approve } });
      showToast(approve ? t.approve : t.decline);
      load();
    } catch (err) {
      showToast(err.message);
    }
  }

  return (
    <DashShell
      role="admin"
      searchPlaceholder={t.phSearchAcademy}
      navLinks={[
        { to: "/admin", label: t.overview },
        { to: "#enroll", label: t.enrollments },
        { to: "#inbox", label: t.inbox },
        { to: "#teachers", label: t.kpiTeachers },
        { to: "#blog", label: t.blog },
      ]}
    >
      <div className="kpi">
        <article className="card"><h4>{t.kpiStudents}</h4><p className="num">{data.kpi.students}</p></article>
        <article className="card"><h4>{t.kpiTeachers}</h4><p className="num">{data.kpi.teachers}</p></article>
        <article className="card"><h4>{t.kpiClasses}</h4><p className="num">{data.kpi.classes}</p></article>
        <article className="card"><h4>{t.kpiInquiries}</h4><p className="num">{data.inbox.length}</p></article>
      </div>
      <article className="card" id="enroll">
        <h3>{t.recentEnroll}</h3>
        <table className="table">
          <thead><tr><th>{t.thName}</th><th>{t.thCourse}</th><th>{t.thPlan}</th><th>{t.thStatus}</th></tr></thead>
          <tbody>
            {data.enrollments.map((e) => (
              <tr key={e.id}>
                <td>{e.student}</td>
                <td>{e.course}</td>
                <td>{e.plan}</td>
                <td>{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
      <div className="grid-2">
        <article className="card" id="inbox">
          <h3>{t.contactMsgs}</h3>
          <ul style={{ display: "grid", gap: "0.7rem", marginTop: "0.8rem" }}>
            {data.inbox.map((m) => (
              <li className="mini-row" key={m.id}>
                <span>{m.name} — {m.message.slice(0, 48)}{m.message.length > 48 ? "…" : ""}</span>
                <b>{new Date(m.created_at).toLocaleDateString()}</b>
              </li>
            ))}
          </ul>
        </article>
        <article className="card" id="blog">
          <h3>{t.blogPosts}</h3>
          <ul style={{ display: "grid", gap: "0.5rem", marginTop: "0.8rem" }}>
            {data.posts.map((p) => (
              <li key={p.id}><Link to={`/blog/${p.id}`}>{p.title}</Link></li>
            ))}
            <li><Link to="/blog">{t.seeAll}</Link></li>
          </ul>
        </article>
      </div>
      <article className="card" id="teachers">
        <h3>{t.pendingTeachers}</h3>
        <table className="table">
          <thead><tr><th>{t.thName}</th><th>{t.fldEmail}</th><th /></tr></thead>
          <tbody>
            {data.pendingTeachers.length ? data.pendingTeachers.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <button className="btn btn-primary btn-sm" type="button" onClick={() => decide(u.id, true)}>{t.approve}</button>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => decide(u.id, false)}>{t.decline}</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={3}>No pending teachers.</td></tr>
            )}
          </tbody>
        </table>
      </article>
    </DashShell>
  );
}
