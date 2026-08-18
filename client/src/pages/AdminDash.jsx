import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashShell from "../components/DashShell";
import { useApp } from "../context/AppContext";
import { api } from "../api";

function emptyCourse() {
  return {
    title: "",
    category: "recitation",
    audiences: ["kids"],
    levels: ["beginner"],
    blurb: "",
    intro: "",
    description: "",
    who_for: "",
    learnings: "",
    duration: "",
    frequency: "",
    requirements: "",
    icon: "ق",
    price_usd: 0,
    sort_order: 0,
    status: "active",
    image_url: "",
  };
}

export default function AdminDash() {
  const { t, showToast } = useApp();
  const [active, setActive] = useState("overview");
  const [data, setData] = useState({
    kpi: { students: 0, teachers: 0, classes: 0 },
    enrollments: [],
    inbox: [],
    pendingTeachers: [],
    teacherCourseRequests: [],
    posts: [],
    stats: {},
  });
  const [catalog, setCatalog] = useState([]);
  const [form, setForm] = useState(emptyCourse);
  const [editing, setEditing] = useState("");

  function load() {
    api("/api/dash/admin").then(setData).catch(() => {});
    api("/api/courses?all=1").then(setCatalog).catch(() => setCatalog([]));
  }

  useEffect(load, []);

  async function saveCourse(e) {
    e.preventDefault();
    try {
      if (editing) await api(`/api/courses/${editing}`, { method: "PUT", body: form });
      else await api("/api/courses", { method: "POST", body: form });
      showToast(t.saveCourse);
      setForm(emptyCourse());
      setEditing("");
      load();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function toggleCourse(c) {
    try {
      await api(`/api/courses/${c.id}/status`, { method: "PATCH", body: { status: c.status === "active" ? "inactive" : "active" } });
      load();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function decideCourse(id, status) {
    try {
      await api(`/api/dash/admin/teacher-courses/${id}`, { method: "POST", body: { status } });
      load();
    } catch (err) {
      showToast(err.message);
    }
  }

  function editCourse(c) {
    setEditing(c.id);
    setForm({
      title: c.title || "",
      category: c.category || "recitation",
      audiences: c.audiences?.length ? c.audiences : ["kids"],
      levels: c.levels?.length ? c.levels : ["beginner"],
      blurb: c.blurb || "",
      intro: c.intro || "",
      description: c.description || "",
      who_for: c.who_for || "",
      learnings: c.learnings || "",
      duration: c.duration || "",
      frequency: c.frequency || "",
      requirements: c.requirements || "",
      icon: c.icon || "ق",
      price_usd: c.price_usd || 0,
      sort_order: c.sort_order || 0,
      status: c.status || "active",
      image_url: c.image_url || "",
    });
    setActive("courses");
  }

  function toggleList(key, value) {
    setForm((f) => {
      const list = f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value];
      return { ...f, [key]: list.length ? list : [value] };
    });
  }

  function onImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1500000) {
      showToast("Image must be under 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image_url: String(reader.result || "") }));
    reader.readAsDataURL(file);
  }
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
      activeKey={active}
      onNavChange={setActive}
      navLinks={[
        { key: "overview", label: t.overview },
        { key: "enrollments", label: t.enrollments },
        { key: "inbox", label: t.inbox },
        { key: "teachers", label: t.kpiTeachers },
        { key: "courses", label: t.adminCourses },
        { key: "blog", label: t.blog },
      ]}
    >
      {active === "overview" ? (
        <>
          <div className="kpi">
            <article className="card"><h4>{t.kpiStudents}</h4><p className="num">{data.kpi.students}</p></article>
            <article className="card"><h4>{t.kpiTeachers}</h4><p className="num">{data.kpi.teachers}</p></article>
            <article className="card"><h4>{t.kpiClasses}</h4><p className="num">{data.kpi.classes}</p></article>
            <article className="card dash-highlight"><h4>{t.kpiInquiries}</h4><p className="num">{data.stats.inboxCount ?? data.inbox.length}</p></article>
          </div>
          <article className="card dash-hero">
            <p className="kicker">{t.overview}</p>
            <h3>
              {data.stats.latestEnrollment
                ? `${data.stats.latestEnrollment.student} requested ${data.stats.latestEnrollment.course}`
                : "Your academy summary will appear here."}
            </h3>
            <p>{`${data.stats.pendingTeacherCount ?? data.pendingTeachers.length} teacher approvals and ${data.stats.inboxCount ?? data.inbox.length} inbox messages are waiting.`}</p>
          </article>
        </>
      ) : null}
      {active === "enrollments" ? (
        <article className="card" id="enroll">
          <h3>{t.recentEnroll}</h3>
          <table className="table">
            <thead><tr><th>{t.thName}</th><th>{t.thCourse}</th><th>{t.thPlan}</th><th>{t.thStatus}</th></tr></thead>
            <tbody>
              {data.enrollments.length ? data.enrollments.map((e) => (
                <tr key={e.id}>
                  <td>{e.student}</td>
                  <td>{e.course}</td>
                  <td>{e.plan}</td>
                  <td>{e.status}</td>
                </tr>
              )) : <tr><td colSpan={4}>No enrollments yet.</td></tr>}
            </tbody>
          </table>
        </article>
      ) : null}
      {active === "inbox" ? (
        <article className="card" id="inbox">
          <h3>{t.contactMsgs}</h3>
          <ul style={{ display: "grid", gap: "0.7rem", marginTop: "0.8rem" }}>
            {data.inbox.length ? data.inbox.map((m) => (
              <li className="mini-row" key={m.id}>
                <span>{m.name} — {m.message.slice(0, 72)}{m.message.length > 72 ? "…" : ""}</span>
                <b>{new Date(m.created_at).toLocaleDateString()}</b>
              </li>
            )) : <li className="mini-row"><span>No inbox messages.</span><b>Clear</b></li>}
          </ul>
        </article>
      ) : null}
      {active === "teachers" ? (
        <>
          <article className="card" id="teachers">
            <h3>{t.pendingTeachers}</h3>
            <table className="table">
              <thead><tr><th>{t.thName}</th><th>{t.fldEmail}</th><th>{t.gender}</th><th>{t.teachingLang}</th><th /></tr></thead>
              <tbody>
                {data.pendingTeachers.length ? data.pendingTeachers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.gender === "female" ? t.genderFemale : u.gender === "male" ? t.genderMale : "—"}</td>
                    <td>{u.teaching_languages || "—"}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" type="button" onClick={() => decide(u.id, true)}>{t.approve}</button>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => decide(u.id, false)}>{t.decline}</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5}>No pending teachers.</td></tr>
                )}
              </tbody>
            </table>
          </article>
          <article className="card" style={{ marginTop: "1.2rem" }}>
            <h3>{t.requestedCourses}</h3>
            <table className="table">
              <thead><tr><th>{t.thName}</th><th>{t.thCourse}</th><th>{t.thStatus}</th><th /></tr></thead>
              <tbody>
                {(data.teacherCourseRequests || []).length ? data.teacherCourseRequests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.teacher}</td>
                    <td>{r.course}</td>
                    <td>{r.status}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" type="button" onClick={() => decideCourse(r.id, "approved")}>{t.approve}</button>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => decideCourse(r.id, "rejected")}>{t.decline}</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan={4}>{t.noCourseRequests}</td></tr>}
              </tbody>
            </table>
          </article>
        </>
      ) : null}
      {active === "courses" ? (
        <>
          <article className="card">
            <h3>{editing ? t.editCourse : t.newCourse}</h3>
            <form className="form" onSubmit={saveCourse}>
              <label><span>{t.courseName}</span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
              <label>
                <span>{t.filterCategory}</span>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="tajweed">{t.filterTajweed}</option>
                  <option value="hifz">{t.filterHifz}</option>
                  <option value="recitation">{t.filterRec}</option>
                  <option value="arabic">{t.filterArabic}</option>
                </select>
              </label>
              <fieldset className="check-set">
                <legend>{t.filterAudience}</legend>
                {["kids", "adults"].map((a) => (
                  <label className="check-row" key={a}>
                    <input type="checkbox" checked={form.audiences.includes(a)} onChange={() => toggleList("audiences", a)} />
                    {a === "kids" ? t.filterKids : t.filterAdults}
                  </label>
                ))}
              </fieldset>
              <fieldset className="check-set">
                <legend>{t.filterLevel}</legend>
                {["beginner", "intermediate", "advanced"].map((lv) => (
                  <label className="check-row" key={lv}>
                    <input type="checkbox" checked={form.levels.includes(lv)} onChange={() => toggleList("levels", lv)} />
                    {lv === "beginner" ? t.beginner : lv === "intermediate" ? t.intermediate : t.advanced}
                  </label>
                ))}
              </fieldset>
              <label><span>{t.shortDesc}</span><textarea value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })} /></label>
              <label><span>{t.courseIntro}</span><textarea value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} /></label>
              <label><span>{t.courseDesc}</span><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              <label><span>{t.whoFor}</span><textarea value={form.who_for} onChange={(e) => setForm({ ...form, who_for: e.target.value })} /></label>
              <label><span>{t.willLearn}</span><textarea value={form.learnings} onChange={(e) => setForm({ ...form, learnings: e.target.value })} /></label>
              <label><span>{t.courseDuration}</span><input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></label>
              <label><span>{t.classFrequency}</span><input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} /></label>
              <label><span>{t.courseReqs}</span><textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></label>
              <label><span>{t.courseIcon}</span><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></label>
              <label>
                <span>{t.courseImage}</span>
                <input type="file" accept="image/*" onChange={onImage} />
              </label>
              {form.image_url ? <div className="course-cover"><img src={form.image_url} alt="" /></div> : <div className="course-cover"><span>{t.courseImageSoon}</span></div>}
              <div className="btn-row">
                <button className="btn btn-gold" type="submit">{t.saveCourse}</button>
                {editing ? <button className="btn btn-ghost" type="button" onClick={() => { setEditing(""); setForm(emptyCourse()); }}>{t.close}</button> : null}
              </div>
            </form>
          </article>
          <article className="card" style={{ marginTop: "1.2rem" }}>
            <h3>{t.adminCourses}</h3>
            <table className="table">
              <thead><tr><th>{t.courseName}</th><th>{t.filterCategory}</th><th>{t.thStatus}</th><th /></tr></thead>
              <tbody>
                {catalog.map((c) => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td>{c.category}</td>
                    <td>{c.status === "active" ? t.courseActive : t.courseInactive}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" type="button" onClick={() => editCourse(c)}>{t.editCourse}</button>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => toggleCourse(c)}>{c.status === "active" ? t.deactivate : t.activate}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </>
      ) : null}
      {active === "blog" ? (
        <article className="card" id="blog">
          <h3>{t.blogPosts}</h3>
          <ul style={{ display: "grid", gap: "0.5rem", marginTop: "0.8rem" }}>
            {data.posts.map((p) => (
              <li key={p.id}><Link to={`/blog/${p.id}`}>{p.title}</Link></li>
            ))}
            <li><Link to="/blog">{t.seeAll}</Link></li>
          </ul>
        </article>
      ) : null}
    </DashShell>
  );
}
