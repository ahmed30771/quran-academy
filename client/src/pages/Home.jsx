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
  const faculty = teachers.length
    ? teachers.map((p) => ({ initials: initials(p.name), name: p.name, spec: p.bio, id: p.id }))
    : [
        { initials: "AM", name: "Ustadha Amina", spec: t.specKids, id: null },
        { initials: "QY", name: "Qari Yusuf", spec: t.specHifz, id: null },
        { initials: "UB", name: "Ustadh Bilal", spec: t.specNazra, id: null },
        { initials: "UN", name: "Ustadha Noor", spec: t.specArabic, id: null },
      ];
  const notes = reviews.length
    ? reviews.map((r) => [r.text, r.name, r.country, Number(r.stars) || 5])
    : [
        [t.rev1, "Fatima K.", t.uk, 5],
        [t.rev2, "Omar S.", t.canada, 5],
        [t.rev3, "Ayesha R.", t.pakistan, 5],
        [t.rev4, "Yusuf M.", t.usa, 4],
        [t.rev5, "Layla H.", t.uae, 5],
        [t.rev6, "Ibrahim N.", t.germany, 5],
      ];
  const lead = faculty[0];
  const rest = faculty.slice(1);
  const featuredReview = notes[0];
  const otherReviews = notes.slice(1);

  return (
    <main>
      <section className="hero hero-cover">
        <div className="hero-overlay" />
        <div className="wrap">
          <div className="hero-copy">
            <p className="kicker">{t.heroKicker}</p>
            <h1>{t.heroTitle}</h1>
            <p className="intro">{t.heroIntro}</p>
            <p className="hero-note">{t.heroNote}</p>
            <div className="btn-row">
              <Link className="btn btn-gold" to="/contact">{t.startTrial}</Link>
              <Link className="btn btn-ghost" to="/courses">{t.viewCourses}</Link>
              <a className="btn btn-ghost" href={SITE.WHATSAPP} target="_blank" rel="noopener">{t.waTrial}</a>
            </div>
            <div className="trust-row">
              <span>{t.trust1}</span><span>{t.trust2}</span><span>{t.trust3}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="mission">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.homeMissionKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.homeMissionTitle}</h2>
          </div>
          <div className="grid-2 mission-grid">
            <article className="card mission-card">
              <p className="kicker">{t.mission}</p>
              <h3>{t.mission}</h3>
              <p>{t.missionP}</p>
            </article>
            <article className="card mission-card">
              <p className="kicker">{t.homeVisionTitle}</p>
              <h3>{t.homeVisionTitle}</h3>
              <p>{t.homeVisionP}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-sage" id="how">
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

      <section className="section" id="tutorial">
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

      <section className="section section-sage" id="why">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.whyKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.whyTitle}</h2>
            <p className="lede">{t.whyLede}</p>
          </div>
          <div className="grid-4 why-grid">
            {[
              ["ت", t.why1, t.why1p],
              ["ق", t.why2, t.why2p],
              ["ح", t.why3, t.why3p],
              ["ع", t.why4, t.why4p],
            ].map(([orb, title, blurb]) => (
              <article className="card why-card" key={title}>
                <div className="icon-orb">{orb}</div>
                <h3>{title}</h3>
                <p>{blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="programs">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.progFeatKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.progFeatTitle}</h2>
            <p className="lede">{t.progFeatLede}</p>
          </div>
          <div className="prog-feat">
            <article className="card prog-lead">
              <span className="badge">{t.startHere}</span>
              <div className="icon-orb">ت</div>
              <h3>{t.cKids}</h3>
              <div className="meta"><span>{t.beginner}</span><span>·</span><span>{t.min30}</span></div>
              <p className="price">{m(39)} <span>{t.perMonth}</span></p>
              <p>{t.cKidsBlurb}</p>
              <div className="btn-row">
                <Link className="btn btn-gold btn-sm" to="/courses/tajweed-ul-quran">{t.seeDetails}</Link>
                <Link className="btn btn-ghost btn-sm" to="/contact">{t.startTrial}</Link>
              </div>
            </article>
            <div className="prog-stack">
              {[
                ["ق", t.cNazra, t.adults, t.min40, 49, t.cNazraBlurb, "/courses/nazra"],
                ["ح", t.cHifz, t.allLevels, t.min4560, 89, t.cHifzBlurb, "/courses/hifz"],
              ].map(([orb, title, a, b, price, blurb, href]) => (
                <article className="card prog-side" key={title}>
                  <div className="icon-orb">{orb}</div>
                  <div>
                    <h3>{title}</h3>
                    <div className="meta"><span>{a}</span><span>·</span><span>{b}</span></div>
                    <p className="price">{m(price)} <span>{t.perMonth}</span></p>
                    <p>{blurb}</p>
                    <Link className="btn btn-primary btn-sm" to={href}>{t.seeDetails}</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="prog-strip">
            {[
              ["ج", t.cAdv, t.cAdvBlurb, 59, "/courses/quran-recitation"],
              ["ع", t.cArabic, t.cArabicBlurb, 45, "/courses/arabic"],
            ].map(([orb, title, blurb, price, href]) => (
              <article className="card" key={title}>
                <div className="icon-orb">{orb}</div>
                <h3>{title}</h3>
                <p className="price">{m(price)} <span>{t.perMonth}</span></p>
                <p>{blurb}</p>
                <Link className="btn btn-ghost btn-sm" to={href}>{t.seeDetails}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section mid-cta">
        <div className="wrap center">
          <p className="kicker">{t.ctaKicker}</p>
          <h2>{t.midCtaTitle}</h2>
          <p className="lede">{t.midCtaLede}</p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link className="btn btn-gold" to="/contact">{t.startTrial}</Link>
            <a className="btn btn-primary" href={SITE.WHATSAPP} target="_blank" rel="noopener">{t.waTrial}</a>
          </div>
        </div>
      </section>

      <section className="section section-sage" id="teachers">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.teachKicker}</p>
            <h2>{t.teachTitle}</h2>
            <p className="lede">{t.teachLede}</p>
          </div>
          <div className="teach-spot">
            {lead ? (
              <article className="card teacher-lead">
                <div className="avatar avatar-lg">{lead.initials}</div>
                <div>
                  <p className="kicker">{t.meetLead}</p>
                  <h3>{lead.id ? <Link to={`/teachers/${lead.id}`}>{lead.name}</Link> : lead.name}</h3>
                  <p>{lead.spec}</p>
                  <div className="btn-row">
                    <Link className="btn btn-gold btn-sm" to="/contact">{t.startTrial}</Link>
                    <Link className="btn btn-ghost btn-sm" to="/login">{t.teachWithUs}</Link>
                  </div>
                </div>
              </article>
            ) : null}
            <div className="teach-rest">
              {rest.map((p) => (
                <article className="card teacher-card" key={p.name}>
                  <div className="avatar">{p.initials}</div>
                  <h3>{p.id ? <Link to={`/teachers/${p.id}`}>{p.name}</Link> : p.name}</h3>
                  <p>{p.spec}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="preview">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.previewKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.previewTitle}</h2>
            <p className="lede">{t.previewLede}</p>
          </div>
          <div className="grid-3 preview-grid">
            {[
              [t.preview1, t.preview1p, "preview-next"],
              [t.preview2, t.preview2p, "preview-hw"],
              [t.preview3, t.preview3p, "preview-att"],
            ].map(([title, blurb, kind]) => (
              <article className="card preview-card" key={title}>
                <div className={`preview-visual ${kind}`} aria-hidden="true">
                  {kind === "preview-att" ? <span className="preview-ring" /> : null}
                </div>
                <h3>{title}</h3>
                <p>{blurb}</p>
              </article>
            ))}
          </div>
          <div className="btn-row" style={{ justifyContent: "center", marginTop: "1.6rem" }}>
            <Link className="btn btn-primary" to="/login">{t.openDash}</Link>
            <Link className="btn btn-ghost" to="/login">{t.createAccount}</Link>
          </div>
        </div>
      </section>

      <section className="section" id="reviews">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.revKicker}</p>
            <div className="star-div"><img src="/assets/icons/star.svg" alt="" /></div>
            <h2>{t.revTitle}</h2>
            <p className="lede">{t.revLede}</p>
          </div>
          <div className="rev-score">
            <strong>{t.revScoreN}</strong>
            <div>
              <div className="stars">★★★★★</div>
              <p>{t.revScoreNote}</p>
            </div>
          </div>
          {featuredReview ? (
            <article className="card review review-feat">
              <div className="stars">{"★".repeat(featuredReview[3])}{"☆".repeat(5 - featuredReview[3])}</div>
              <p>{featuredReview[0]}</p>
              <footer>{featuredReview[1]}<span>{featuredReview[2]}</span></footer>
            </article>
          ) : null}
          <div className="grid-3">
            {otherReviews.map(([text, name, country, stars]) => (
              <article className="card review" key={name}>
                <div className="stars">{"★".repeat(stars)}{"☆".repeat(5 - stars)}</div>
                <p>{text}</p>
                <footer>{name}<span>{country}</span></footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-sage" id="events">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.eventsKicker}</p>
            <h2>{t.eventsTitle}</h2>
            <p className="lede">{t.eventsLede}</p>
          </div>
          <div className="grid-2">
            {[
              [t.event1t, t.event1d, t.event1p],
              [t.event2t, t.event2d, t.event2p],
            ].map(([title, date, blurb]) => (
              <article className="card event-card" key={title}>
                <span className="badge">{t.eventSoon}</span>
                <h3>{title}</h3>
                <p className="event-date">{date}</p>
                <p>{blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
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
            <a className="btn btn-gold" href={SITE.WHATSAPP} target="_blank" rel="noopener">{t.waTrial}</a>
            <Link className="btn btn-light" to="/contact">{t.enrollNow}</Link>
            <Link className="btn btn-light" to="/courses">{t.viewCourses}</Link>
            <Link className="btn btn-light" to="/login">{t.teachWithUs}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
