import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api, formatMoney } from "../api";

export default function Courses() {
  const { t, currency, user, showToast } = useApp();
  const nav = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    api("/api/courses").then(setCourses).catch(() => setCourses([]));
  }, []);

  const keys = { "tajweed-kids": "cKids", nazra: "cNazra", "tajweed-adv": "cAdv", hifz: "cHifz", arabic: "cArabic", family: "cFamily" };
  const full = { "tajweed-kids": "cKidsFull", nazra: "cNazraFull", "tajweed-adv": "cAdvFull", hifz: "cHifzFull", arabic: "cArabicFull", family: "cFamilyFull" };

  async function enroll(id) {
    if (!user) return nav("/login");
    if (user.role !== "student") {
      showToast("Only student accounts can enroll.");
      return;
    }
    try {
      const res = await api(`/api/courses/${id}/enroll`, { method: "POST", body: { plan: "standard" } });
      showToast(res.already ? "You are already enrolled in this course." : "Enrollment request sent.");
      setModal(null);
    } catch (e) {
      showToast(e.message);
    }
  }

  const shown = courses.filter((c) => filter === "all" || (c.track || "").includes(filter));

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
          <div className="chips">
            {[
              ["all", t.filterAll],
              ["kids", t.filterKids],
              ["adults", t.filterAdults],
              ["tajweed", t.filterTajweed],
              ["hifz", t.filterHifz],
              ["recitation", t.filterRec],
              ["arabic", t.filterArabic],
            ].map(([f, label]) => (
              <button key={f} className={`chip${filter === f ? " is-on" : ""}`} type="button" onClick={() => setFilter(f)}>
                {label}
              </button>
            ))}
          </div>
          <div className="grid-3">
            {shown.map((c) => (
              <article className="card course" id={c.id} key={c.id}>
                <div className="icon-orb">{c.icon || "ق"}</div>
                <h3>{t[keys[c.id]] || c.title}</h3>
                <div className="meta"><span>{c.level}</span><span>·</span><span>{c.duration}</span><span>·</span><span>{c.length}</span></div>
                <p className="price">{formatMoney(c.price_usd, currency)} <span>{t.perMonth}</span></p>
                <p>{t[full[c.id]] || c.full_blurb}</p>
                <div className="btn-row">
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setModal(c)}>{t.details}</button>
                  <button className="btn btn-primary btn-sm" type="button" onClick={() => enroll(c.id)}>{t.enroll}</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      {modal ? (
        <div className="modal-bg open" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <button className="menu-close modal-x" type="button" onClick={() => setModal(null)}>×</button>
            <p className="kicker">{t.courseKicker}</p>
            <h3>{t[keys[modal.id]] || modal.title}</h3>
            <p>{(t[full[modal.id]] || modal.full_blurb) + " " + (t.modalFee || "").replace("{n}", formatMoney(modal.price_usd, currency))}</p>
            <div className="btn-row">
              <button className="btn btn-primary" type="button" onClick={() => enroll(modal.id)}>{t.enroll}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setModal(null)}>{t.close}</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
