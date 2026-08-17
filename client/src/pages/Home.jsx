import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api, formatMoney, SITE } from "../api";
import { initials } from "../helpers";

export default function Home() {
  const { t, currency } = useApp();
  const [tut, setTut] = useState(0);
  const [faq, setFaq] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    api("/api/reviews").then(setReviews).catch(() => setReviews([]));
    api("/api/teachers").then(setTeachers).catch(() => setTeachers([]));
  }, []);
  const m = (n) => formatMoney(n, currency);
  const panels = [
    [t.tutH1, t.tutP1],
    [t.tutH2, t.tutP2],
    [t.tutH3, t.tutP3],
    [t.tutH4, t.tutP4],
  ];
  const faqs = [
    [t.faq1q, t.faq1a],
    [t.faq2q, t.faq2a],
    [t.faq3q, t.faq3a],
    [t.faq4q, t.faq4a],
  ];

  return (
    <main>
      <section className="hero hero-cover">
        <div className="hero-overlay" />
        <div className="wrap">
          <div className="hero-copy">
            <p className="kicker">{t.heroKicker}</p>
            <h1>{t.heroTitle}</h1>
            <p className="intro">{t.heroIntro}</p>
            <div className="btn-row">
              <Link className="btn btn-gold" to="/contact">{t.startTrial}</Link>
              <Link className="btn btn-ghost" to="/courses">{t.viewCourses}</Link>
            </div>
            <div className="trust-row">
              <span>{t.trust1}</span><span>{t.trust2}</span><span>{t.trust3}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.howKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.howTitle}</h2>
            <p className="lede">{t.howLede}</p>
          </div>
          <div className="steps">
            {[[t.step1, t.step1p], [t.step2, t.step2p], [t.step3, t.step3p], [t.step4, t.step4p]].map(([h, p], i) => (
              <article className="card step" key={h}>
                <div className="step-num">{i + 1}</div>
                <h3>{h}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-sage" id="tutorial">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">{t.tutKicker}</p>
            <h2>{t.tutTitle}</h2>
            <p className="lede">{t.tutLede}</p>
          </div>
          <div className="tutorial">
            <div className="tut-nav">
              {[t.tutNav1, t.tutNav2, t.tutNav3, t.tutNav4].map((label, i) => (
                <button key={label} type="button" className={tut === i ? "is-on" : ""} onClick={() => setTut(i)}>{label}</button>
              ))}
            </div>
            <div>
              <div className="tut-panel">
                <h3>{panels[tut][0]}</h3>
                <p>{panels[tut][1]}</p>
              </div>
              <div className="tut-actions">
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setTut((n) => Math.max(0, n - 1))}>{t.back}</button>
                <button className="btn btn-primary btn-sm" type="button" onClick={() => setTut((n) => Math.min(3, n + 1))}>{t.next}</button>
                <Link className="btn btn-gold btn-sm" to="/login">{t.createAccount}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.snapKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.snapTitle}</h2>
            <p className="lede">{t.snapLede}</p>
          </div>
          <div className="grid-3">
            {[
              ["ت", t.cKids, t.beginner, t.min30, 39, t.cKidsBlurb],
              ["ق", t.cNazra, t.adults, t.min40, 49, t.cNazraBlurb],
              ["ح", t.cHifz, t.allLevels, t.min4560, 89, t.cHifzBlurb],
            ].map(([orb, title, a, b, price, blurb]) => (
              <article className="card" key={title}>
                <div className="icon-orb">{orb}</div>
                <h3>{title}</h3>
                <div className="meta"><span>{a}</span><span>·</span><span>{b}</span></div>
                <p className="price">{m(price)} <span>{t.perMonth}</span></p>
                <p>{blurb}</p>
                <div className="btn-row"><Link className="btn btn-primary btn-sm" to="/courses">{t.seeDetails}</Link></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-sage">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.teachKicker}</p>
            <h2>{t.teachTitle}</h2>
            <p className="lede">{t.teachLede}</p>
          </div>
          <div className="grid-4">
            {(teachers.length
              ? teachers.map((p) => [initials(p.name), p.name, p.bio])
              : [["AM", "Ustadha Amina", t.specKids], ["QY", "Qari Yusuf", t.specHifz], ["UB", "Ustadh Bilal", t.specNazra], ["UN", "Ustadha Noor", t.specArabic]]
            ).map(([i, n, s]) => (
              <article className="card teacher-card" key={n}>
                <div className="avatar">{i}</div>
                <h3>{n}</h3>
                <p>{s}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.revKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.revTitle}</h2>
            <p className="lede">{t.revLede}</p>
          </div>
          <div className="grid-3">
            {(reviews.length
              ? reviews.map((r) => [r.text, r.name, r.country, r.stars])
              : [
                  [t.rev1, "Fatima K.", t.uk, 5],
                  [t.rev2, "Omar S.", t.canada, 5],
                  [t.rev3, "Ayesha R.", t.pakistan, 5],
                  [t.rev4, "Yusuf M.", t.usa, 4],
                  [t.rev5, "Layla H.", t.uae, 5],
                  [t.rev6, "Ibrahim N.", t.germany, 5],
                ]
            ).map(([text, name, country, stars]) => (
              <article className="card review" key={name}>
                <div className="stars">{"★".repeat(stars)}{"☆".repeat(5 - stars)}</div>
                <p>{text}</p>
                <footer>{name}<span>{country}</span></footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-sage">
        <div className="wrap">
          <div className="verse">
            <p className="kicker" style={{ justifyContent: "center" }}>{t.verseKicker}</p>
            <p className="arabic">إِنَّ مَعَ الْعُسْرِ يُسْرًا</p>
            <p className="trans">{t.verseTrans}</p>
            <p className="ref">{t.verseRef}</p>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.faqKicker}</p>
            <h2>{t.faqTitle}</h2>
          </div>
          <div className="faq">
            {faqs.map(([q, a], i) => (
              <div className={`faq-item${faq === i ? " open" : ""}`} key={q}>
                <button type="button" onClick={() => setFaq(faq === i ? -1 : i)}>
                  <span>{q}</span><span>{faq === i ? "−" : "+"}</span>
                </button>
                <div className="answer">{a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-emerald">
        <div className="wrap center">
          <p className="kicker">{t.ctaKicker}</p>
          <h2>{t.ctaTitle}</h2>
          <p className="lede" style={{ color: "rgba(255,255,255,0.75)" }}>{t.ctaLede}</p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <a className="btn btn-gold" href={SITE.WHATSAPP} target="_blank" rel="noopener">WhatsApp</a>
            <Link className="btn btn-light" to="/contact">{t.talkToUs}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
