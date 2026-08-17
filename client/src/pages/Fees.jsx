import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../api";

export default function Fees() {
  const { t, currency } = useApp();
  const [faq, setFaq] = useState(0);
  const faqs = [
    [t.ff1q, t.ff1a],
    [t.ff2q, t.ff2a],
    [t.ff3q, t.ff3a],
  ];

  return (
    <main>
      <section className="page-hero">
        <div className="pattern-corner tl" />
        <div className="wrap">
          <p className="kicker">{t.feesKicker}</p>
          <h1>{t.feesTitle}</h1>
          <p className="lede">{t.feesLede}</p>
          <p className="lede" style={{ marginTop: "0.6rem" }}>{t.rateNote}</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap grid-3">
          <article className="card plan">
            <h3>{t.starter}</h3>
            <p>{t.starterSub}</p>
            <p className="price">{formatMoney(39, currency)} <span>{t.perMonth}</span></p>
            <ul>
              <li>{t.st1}</li>
              <li>{t.st2}</li>
              <li>{t.st3}</li>
              <li>{t.st4}</li>
            </ul>
            <Link className="btn btn-ghost" to="/contact">{t.startTrial}</Link>
          </article>
          <article className="card plan featured" data-rec={t.recommended}>
            <h3>{t.standard}</h3>
            <p>{t.standardSub}</p>
            <p className="price">{formatMoney(69, currency)} <span>{t.perMonth}</span></p>
            <ul>
              <li>{t.sd1}</li>
              <li>{t.sd2}</li>
              <li>{t.sd3}</li>
              <li>{t.sd4}</li>
            </ul>
            <Link className="btn btn-primary" to="/contact">{t.startTrial}</Link>
          </article>
          <article className="card plan">
            <h3>{t.cHifz}</h3>
            <p>{t.hifzSub}</p>
            <p className="price">{formatMoney(89, currency)} <span>{t.perMonth}</span></p>
            <ul>
              <li>{t.hf1}</li>
              <li>{t.hf2}</li>
              <li>{t.hf3}</li>
              <li>{t.hf4}</li>
            </ul>
            <Link className="btn btn-ghost" to="/contact">{t.startTrial}</Link>
          </article>
        </div>
      </section>
      <section className="section section-sage">
        <div className="wrap grid-2">
          <article className="card">
            <h3>{t.familyPack}</h3>
            <p>{t.familyPackP}</p>
          </article>
          <article className="card">
            <h3>{t.freeTrial}</h3>
            <p>{t.freeTrialP}</p>
          </article>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.faqKicker}</p>
            <h2>{t.feesFaqTitle}</h2>
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
    </main>
  );
}
