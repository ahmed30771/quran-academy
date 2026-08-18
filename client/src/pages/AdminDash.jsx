import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashShell from "../components/DashShell";
import { useApp } from "../context/AppContext";
import { api, formatMoney } from "../api";

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
    duration: "Flexible",
    length: "40 min",
    frequency: "",
    requirements: "",
    icon: "ق",
    price_usd: "",
    sort_order: 0,
    status: "active",
    image_url: "",
  };
}

function Field({ label, error, children }) {
  return (
    <label>
      <span>{label}</span>
      {children}
      {error ? <em className="field-error">{error}</em> : null}
    </label>
  );
}

function validateCourse(form, t) {
  const title = String(form.title || "").trim();
  const feeRaw = String(form.price_usd ?? "").trim();
  const fee = Number(feeRaw);
  const next = {
    title: title ? (title.length < 2 ? t.errCourseNameShort : "") : t.errCourseName,
    audiences: Array.isArray(form.audiences) && form.audiences.length ? "" : t.errCourseAudience,
    levels: Array.isArray(form.levels) && form.levels.length ? "" : t.errCourseLevel,
    blurb: String(form.blurb || "").trim() ? "" : t.errCourseBlurb,
    duration: String(form.duration || "").trim() ? "" : t.errCourseDuration,
    price_usd: !feeRaw ? t.errCourseFee : Number.isFinite(fee) && fee >= 0 ? "" : t.errCourseFeeNumber,
    icon: String(form.icon || "").length > 8 ? t.errCourseIcon : "",
  };
  return next;
}

function mapCourseError(message, t) {
  const s = String(message || "").toLowerCase();
  if (s.includes("already exists") || s.includes("already uses this name")) return { title: t.errCourseNameExists };
  if (s.includes("course name")) return { title: t.errCourseName };
  if (s.includes("image")) return { image_url: t.errCourseImage };
  return { form: message || t.errCourseName };
}

export default function AdminDash() {
  const { t, showToast, currency } = useApp();
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
  const [errors, setErrors] = useState({});

  function load() {
    api("/api/dash/admin").then(setData).catch(() => {});
    api("/api/courses?all=1").then(setCatalog).catch(() => setCatalog([]));
  }

  useEffect(load, []);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] || e.form ? { ...e, [key]: "", form: "" } : e));
  }

  async function saveCourse(e) {
    e.preventDefault();
    const next = validateCourse(form, t);
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    const body = {
      title: form.title,
      category: form.category,
      audiences: form.audiences,
      levels: form.levels,
      blurb: form.blurb,
      intro: form.intro,
      description: form.description,
      who_for: form.who_for,
      learnings: form.learnings,
      duration: form.duration || "Flexible",
      length: form.length || "40 min",
      frequency: form.frequency,
      requirements: form.requirements,
      icon: form.icon || "ق",
      price_usd: Number(form.price_usd) || 0,
      sort_order: Number(form.sort_order) || 0,
      status: form.status || "active",
      image_url: form.image_url || null,
    };
    try {
      if (editing) await api(`/api/courses/${encodeURIComponent(editing)}/save`, { method: "POST", body });
      else await api("/api/courses", { method: "POST", body });
      showToast(t.saveCourse);
      setForm(emptyCourse());
      setEditing("");
      setErrors({});
      load();
    } catch (err) {
      setErrors(mapCourseError(err.message, t));
    }
  }

  async function toggleCourse(c) {
    try {
      await api(`/api/courses/${encodeURIComponent(c.id || c.slug)}/status`, { method: "PATCH", body: { status: c.status === "active" ? "inactive" : "active" } });
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
    setEditing(c.id || c.slug);
    setErrors({});
    setForm({
      title: c.title || "",
      category: c.category || "recitation",
      audiences: Array.isArray(c.audiences) && c.audiences.length ? c.audiences : ["kids"],
      levels: Array.isArray(c.levels) && c.levels.length ? c.levels : ["beginner"],
      blurb: c.blurb || "",
      intro: c.intro || "",
      description: c.description || "",
      who_for: c.who_for || "",
      learnings: c.learnings || "",
      duration: c.duration || "Flexible",
      length: c.length || "40 min",
      frequency: c.frequency || "",
      requirements: c.requirements || "",
      icon: c.icon || "ق",
      price_usd: c.price_usd === 0 || c.price_usd ? c.price_usd : "",
      sort_order: c.sort_order || 0,
      status: c.status || "active",
      image_url: c.image_url || "",
    });
    setActive("courses");
  }

  function toggleList(key, value) {
    setForm((f) => {
      const current = Array.isArray(f[key]) ? f[key] : [];
      const list = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...f, [key]: list };
    });
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  }

  function onImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1000000) {
      setErrors((e) => ({ ...e, image_url: t.errCourseImage }));
      return;
    }
    setErrors((e) => ({ ...e, image_url: "" }));
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
            <form className="form" onSubmit={saveCourse} noValidate>
              {errors.form ? <em className="field-error">{errors.form}</em> : null}
              <Field label={t.courseName} error={errors.title}>
                <input value={form.title} onChange={(e) => setField("title", e.target.value)} className={errors.title ? "is-invalid" : ""} />
              </Field>
              <Field label={t.filterCategory} error={errors.category}>
                <select value={form.category} onChange={(e) => setField("category", e.target.value)} className={errors.category ? "is-invalid" : ""}>
                  <option value="tajweed">{t.filterTajweed}</option>
                  <option value="hifz">{t.filterHifz}</option>
                  <option value="recitation">{t.filterRec}</option>
                  <option value="arabic">{t.filterArabic}</option>
                </select>
              </Field>
              <fieldset className={`check-set${errors.audiences ? " is-invalid" : ""}`}>
                <legend>{t.filterAudience}</legend>
                {["kids", "adults"].map((a) => (
                  <label className="check-row" key={a}>
                    <input type="checkbox" checked={form.audiences.includes(a)} onChange={() => toggleList("audiences", a)} />
                    {a === "kids" ? t.filterKids : t.filterAdults}
                  </label>
                ))}
                {errors.audiences ? <em className="field-error">{errors.audiences}</em> : null}
              </fieldset>
              <fieldset className={`check-set${errors.levels ? " is-invalid" : ""}`}>
                <legend>{t.filterLevel}</legend>
                {["beginner", "intermediate", "advanced"].map((lv) => (
                  <label className="check-row" key={lv}>
                    <input type="checkbox" checked={form.levels.includes(lv)} onChange={() => toggleList("levels", lv)} />
                    {lv === "beginner" ? t.beginner : lv === "intermediate" ? t.intermediate : t.advanced}
                  </label>
                ))}
                {errors.levels ? <em className="field-error">{errors.levels}</em> : null}
              </fieldset>
              <Field label={t.shortDesc} error={errors.blurb}>
                <textarea value={form.blurb} onChange={(e) => setField("blurb", e.target.value)} className={errors.blurb ? "is-invalid" : ""} />
              </Field>
              <Field label={t.courseIntro} error={errors.intro}>
                <textarea value={form.intro} onChange={(e) => setField("intro", e.target.value)} className={errors.intro ? "is-invalid" : ""} />
              </Field>
              <Field label={t.courseDesc} error={errors.description}>
                <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} className={errors.description ? "is-invalid" : ""} />
              </Field>
              <Field label={t.whoFor} error={errors.who_for}>
                <textarea value={form.who_for} onChange={(e) => setField("who_for", e.target.value)} className={errors.who_for ? "is-invalid" : ""} />
              </Field>
              <Field label={t.willLearn} error={errors.learnings}>
                <textarea value={form.learnings} onChange={(e) => setField("learnings", e.target.value)} className={errors.learnings ? "is-invalid" : ""} />
              </Field>
              <Field label={t.courseDuration} error={errors.duration}>
                <input value={form.duration} onChange={(e) => setField("duration", e.target.value)} className={errors.duration ? "is-invalid" : ""} />
              </Field>
              <Field label={t.classFrequency} error={errors.frequency}>
                <input value={form.frequency} onChange={(e) => setField("frequency", e.target.value)} className={errors.frequency ? "is-invalid" : ""} />
              </Field>
              <Field label={t.courseFee} error={errors.price_usd}>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price_usd}
                  onChange={(e) => setField("price_usd", e.target.value)}
                  className={errors.price_usd ? "is-invalid" : ""}
                />
              </Field>
              <Field label={t.courseReqs} error={errors.requirements}>
                <textarea value={form.requirements} onChange={(e) => setField("requirements", e.target.value)} className={errors.requirements ? "is-invalid" : ""} />
              </Field>
              <Field label={t.courseIcon} error={errors.icon}>
                <input value={form.icon} onChange={(e) => setField("icon", e.target.value)} className={errors.icon ? "is-invalid" : ""} />
              </Field>
              <Field label={t.courseImage} error={errors.image_url}>
                <input type="file" accept="image/*" onChange={onImage} className={errors.image_url ? "is-invalid" : ""} />
              </Field>
              {form.image_url ? <div className="course-cover"><img src={form.image_url} alt="" /></div> : <div className="course-cover"><span>{t.courseImageSoon}</span></div>}
              <div className="btn-row">
                <button className="btn btn-gold" type="submit">{t.saveCourse}</button>
                {editing ? <button className="btn btn-ghost" type="button" onClick={() => { setEditing(""); setForm(emptyCourse()); setErrors({}); }}>{t.close}</button> : null}
              </div>
            </form>
          </article>
          <article className="card" style={{ marginTop: "1.2rem" }}>
            <h3>{t.adminCourses}</h3>
            <table className="table">
              <thead><tr><th>{t.courseName}</th><th>{t.filterCategory}</th><th>{t.courseFee}</th><th>{t.thStatus}</th><th /></tr></thead>
              <tbody>
                {catalog.map((c) => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td>{c.category}</td>
                    <td>{Number(c.price_usd) > 0 ? formatMoney(c.price_usd, currency) : "—"}</td>
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
