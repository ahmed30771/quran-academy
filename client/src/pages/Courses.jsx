import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api, formatMoney } from "../api";
import { audienceLabel, categoryLabel, coursePath, levelLabel, localized } from "../helpers";
import PageHero from "../components/PageHero";

export default function Courses() {
  const { t, lang, currency, user, showToast } = useApp();
  const nav = useNavigate();
  const [courses, setCourses] = useState([]);
  const [audience, setAudience] = useState("all");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [trialIds, setTrialIds] = useState([]);

  useEffect(() => {
    api("/api/courses").then(setCourses).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!user || user.role !== "student") {
      setTrialIds([]);
      return;
    }
    api("/api/courses/trial/me").then((d) => setTrialIds(d.courseIds || [])).catch(() => setTrialIds([]));
  }, [user]);

  async function bookTrial(course) {
    if (!user) return nav("/login");
    if (user.role !== "student") {
      showToast("Only student accounts can start a free trial.");
      return;
    }
    nav(`${coursePath(course)}#choose-teacher`);
  }

  async function enroll(course) {
    if (!user) return nav("/login");
    if (user.role !== "student") {
      showToast("Only student accounts can enroll.");
      return;
    }
    nav(`${coursePath(course)}#choose-teacher`);
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
      <PageHero kicker={t.coursesKicker} title={t.coursesTitle} lede={t.coursesLede} />
      <section className="section">
        <div className="wrap">
          <div className="filter-groups">
            <label>
              <span className="filter-label">{t.filterAudience}</span>
              <select value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option value="all">{t.filterAll}</option>
                <option value="kids">{t.filterKids}</option>
                <option value="adults">{t.filterAdults}</option>
              </select>
            </label>
            <label>
              <span className="filter-label">{t.filterCategory}</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">{t.filterAll}</option>
                <option value="tajweed">{t.filterTajweed}</option>
                <option value="hifz">{t.filterHifz}</option>
                <option value="recitation">{t.filterRec}</option>
                <option value="arabic">{t.filterArabic}</option>
              </select>
            </label>
            <label>
              <span className="filter-label">{t.filterLevel}</span>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="all">{t.filterAll}</option>
                <option value="beginner">{t.beginner}</option>
                <option value="intermediate">{t.intermediate}</option>
                <option value="advanced">{t.advanced}</option>
              </select>
            </label>
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
                <p className="trial-note">{t.firstDayTrial}</p>
                <div className="btn-row">
                  <Link className="btn btn-ghost btn-sm" to={coursePath(c)}>{t.viewCourse}</Link>
                  <button className="btn btn-primary btn-sm" type="button" onClick={() => enroll(c)}>{t.enroll}</button>
                  <button
                    className="btn btn-gold btn-sm"
                    type="button"
                    disabled={trialIds.includes(c.id)}
                    onClick={() => bookTrial(c)}
                  >
                    {trialIds.includes(c.id) ? t.trialUsed : t.bookTrial}
                  </button>
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
