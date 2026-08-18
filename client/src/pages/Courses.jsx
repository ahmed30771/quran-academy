import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api, formatMoney } from "../api";
import { audienceLabel, categoryLabel, coursePath, levelLabel, localized } from "../helpers";

export default function Courses() {
  const { t, lang, currency, user, showToast } = useApp();
  const nav = useNavigate();
  const [courses, setCourses] = useState([]);
  const [audience, setAudience] = useState("all");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    api("/api/courses").then(setCourses).catch(() => setCourses([]));
  }, []);

  async function enroll(id) {
    if (!user) return nav("/login");
    if (user.role !== "student") {
      showToast("Only student accounts can enroll.");
      return;
    }
    try {
      setBusyId(id);
      const res = await api(`/api/courses/${id}/enroll`, { method: "POST", body: { plan: "standard" } });
      showToast(res.already ? "You are already enrolled in this course." : `Enrollment request sent for ${res.course?.title || "this course"}.`);
    } catch (e) {
      showToast(e.message);
    } finally {
      setBusyId("");
    }
  }

  const shown = courses.filter((c) => {
    const audiences = c.audiences || [];
    const levels = c.levels || [];
    if (audience !== "all" && !audiences.includes(audience)) return false;
    if (category !== "all" && c.category !== category) return false;
    if (level !== "all" && !levels.includes(level)) return false;
    return true;
  });

  return (
    <main>
      <section className="page-hero">
        <div className="pattern-corner tl" />
        <div className="wrap">
          <p className="kicker">{t.coursesKicker}</p>
          <h1>{t.coursesTitle}</h1>
          <p className="lede">{t.coursesLede}</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="filter-groups">
            <div>
              <p className="filter-label">{t.filterAudience}</p>
              <div className="chips">
                {[["all", t.filterAll], ["kids", t.filterKids], ["adults", t.filterAdults]].map(([f, label]) => (
                  <button key={f} className={`chip${audience === f ? " is-on" : ""}`} type="button" onClick={() => setAudience(f)}>{label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="filter-label">{t.filterCategory}</p>
              <div className="chips">
                {[["all", t.filterAll], ["tajweed", t.filterTajweed], ["hifz", t.filterHifz], ["recitation", t.filterRec], ["arabic", t.filterArabic]].map(([f, label]) => (
                  <button key={f} className={`chip${category === f ? " is-on" : ""}`} type="button" onClick={() => setCategory(f)}>{label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="filter-label">{t.filterLevel}</p>
              <div className="chips">
                {[["all", t.filterAll], ["beginner", t.beginner], ["intermediate", t.intermediate], ["advanced", t.advanced]].map(([f, label]) => (
                  <button key={f} className={`chip${level === f ? " is-on" : ""}`} type="button" onClick={() => setLevel(f)}>{label}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid-3">
            {shown.map((row) => {
              const c = localized(row, lang);
              return (
              <article className="card course" id={c.slug || c.id} key={c.id}>
                <div className="course-cover">
                  {c.image_url ? <img src={c.image_url} alt="" /> : <span>{t.courseImageSoon}</span>}
                </div>
                <div className="icon-orb">{c.icon || "ق"}</div>
                <h3>{c.title}</h3>
                <div className="meta">
                  <span>{audienceLabel(c.audiences, t) || t.filterAll}</span>
                  <span>·</span>
                  <span>{categoryLabel(c.category, t)}</span>
                  <span>·</span>
                  <span>{levelLabel(c.levels, t) || c.level}</span>
                </div>
                {Number(c.price_usd) > 0 ? <p className="price">{formatMoney(c.price_usd, currency)} <span>{t.perMonth}</span></p> : null}
                <p>{c.blurb || c.full_blurb}</p>
                <div className="btn-row">
                  <Link className="btn btn-ghost btn-sm" to={coursePath(c)}>{t.viewCourse}</Link>
                  <button className="btn btn-primary btn-sm" type="button" disabled={busyId === c.id} onClick={() => enroll(c.id)}>{busyId === c.id ? "..." : t.enroll}</button>
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
