import { useState } from "react";
import { useApp } from "../context/AppContext";
import { api, SITE } from "../api";
import PageHero from "../components/PageHero";

export default function Contact() {
  const { t, showToast } = useApp();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    setBusy(true);
    try {
      await api("/api/contact", {
        method: "POST",
        body: {
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          subject: form.get("subject"),
          message: form.get("message"),
        },
      });
      showToast(t.toastContact);
      e.target.reset();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <PageHero kicker={t.contactKicker} title={t.contactTitle} lede={t.contactLede} />
      <section className="section">
        <div className="wrap contact-grid">
          <article className="card">
            <form className="form" onSubmit={onSubmit}>
              <label>
                <span>{t.fldName}</span>
                <input name="name" required placeholder={t.phName} />
              </label>
              <label>
                <span>{t.fldEmail}</span>
                <input type="email" name="email" required placeholder={t.phEmail} />
              </label>
              <label>
                <span>{t.fldPhone}</span>
                <input name="phone" required placeholder={t.phPhone} />
              </label>
              <label>
                <span>{t.fldSubject}</span>
                <input name="subject" required placeholder={t.phSubject} />
              </label>
              <label>
                <span>{t.fldMsg}</span>
                <textarea name="message" required placeholder={t.phMsg} />
              </label>
              <button className="btn btn-primary" type="submit" disabled={busy}>{t.sendMsg}</button>
            </form>
          </article>
          <aside className="side-info">
            <h3>{t.reachUs}</h3>
            <p>{t.hours}</p>
            <div className="row">
              <p><strong>WhatsApp</strong><br /><a href={SITE.WHATSAPP} target="_blank" rel="noopener">{SITE.PHONE}</a></p>
            </div>
            <div className="row">
              <p><strong>Email</strong><br /><a href={`mailto:${SITE.EMAIL}`}>{SITE.EMAIL}</a></p>
            </div>
            <div className="row">
              <p><strong>{t.followUs}</strong></p>
              <div className="socials socials-light">
                <a href={SITE.LINKEDIN} target="_blank" rel="noopener" aria-label="LinkedIn"><img src="/assets/icons/linkedin.svg" alt="" /></a>
                <a href={SITE.INSTAGRAM} target="_blank" rel="noopener" aria-label="Instagram"><img src="/assets/icons/instagram.svg" alt="" /></a>
                <a href={SITE.FACEBOOK} target="_blank" rel="noopener" aria-label="Facebook"><img src="/assets/icons/facebook.svg" alt="" /></a>
              </div>
            </div>
            <div className="row">
              <p><strong>{t.studio}</strong><br /><span>{t.studioP}</span></p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
