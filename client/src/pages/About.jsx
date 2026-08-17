import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function About() {
  const { t } = useApp();
  return (
    <main>
      <section className="page-hero">
        <div className="pattern-corner tl" />
        <div className="wrap">
          <p className="kicker">{t.aboutKicker}</p>
          <h1>{t.aboutTitle}</h1>
          <p className="lede">{t.aboutLede}</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap grid-2">
          <article className="card"><h2>{t.mission}</h2><p>{t.missionP}</p></article>
          <article className="card"><h2>{t.howTeach}</h2><p>{t.howTeachP}</p></article>
        </div>
      </section>
      <section className="section section-sage" id="teachers">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.teachKicker}</p>
            <h2>{t.standardsTitle}</h2>
            <p className="lede">{t.standardsLede}</p>
          </div>
          <div className="grid-3">
            <article className="card"><div className="icon-orb">إ</div><h3>{t.ijazah}</h3><p>{t.ijazahP}</p></article>
            <article className="card"><div className="icon-orb">ط</div><h3>{t.tajweedFirst}</h3><p>{t.tajweedFirstP}</p></article>
            <article className="card"><div className="icon-orb">أ</div><h3>{t.adab}</h3><p>{t.adabP}</p></article>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.pathKicker}</p>
            <h2>{t.pathTitle}</h2>
          </div>
          <div className="timeline">
            <div className="tl"><h3>{t.tl1}</h3><p>{t.tl1p}</p></div>
            <div className="tl"><h3>{t.tl2}</h3><p>{t.tl2p}</p></div>
            <div className="tl"><h3>{t.tl3}</h3><p>{t.tl3p}</p></div>
          </div>
        </div>
      </section>
      <section className="section section-emerald">
        <div className="wrap center">
          <h2>{t.teachCta}</h2>
          <p className="lede" style={{ color: "rgba(255,255,255,0.75)" }}>{t.teachCtaP}</p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link className="btn btn-gold" to="/login">{t.teacherLogin}</Link>
            <Link className="btn btn-light" to="/contact">{t.contact}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
