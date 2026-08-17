import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { SITE } from "../api";

export default function Footer({ onChat }) {
  const { t } = useApp();
  return (
    <>
      <footer className="site-footer">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <Link className="brand" to="/">
                <img src="/assets/icons/logo.svg" alt="" />
                <span className="brand-name" style={{ color: "#fff" }}>Quran Academy</span>
              </Link>
              <p style={{ marginTop: "0.8rem", maxWidth: "18rem" }}>{t.copyNote}</p>
            </div>
            <div>
              <h4>{t.footCompany}</h4>
              <ul>
                <li><Link to="/about">{t.about}</Link></li>
                <li><Link to="/#how">{t.howKicker}</Link></li>
                <li><Link to="/about#teachers">{t.teachKicker}</Link></li>
                <li><Link to="/login">{t.login}</Link></li>
              </ul>
            </div>
            <div>
              <h4>{t.footPrograms}</h4>
              <ul>
                <li><Link to="/courses#tajweed-kids">{t.cKids}</Link></li>
                <li><Link to="/courses#nazra">{t.cNazra}</Link></li>
                <li><Link to="/courses#tajweed-adv">{t.cAdv}</Link></li>
                <li><Link to="/courses#hifz">{t.cHifz}</Link></li>
                <li><Link to="/courses#arabic">{t.cArabic}</Link></li>
                <li><Link to="/fees">{t.fees}</Link></li>
              </ul>
            </div>
            <div>
              <h4>{t.explore}</h4>
              <ul>
                <li><Link to="/">{t.home}</Link></li>
                <li><Link to="/courses">{t.courses}</Link></li>
                <li><Link to="/blog">{t.blog}</Link></li>
                <li><Link to="/#tutorial">{t.tutKicker}</Link></li>
                <li><Link to="/contact">{t.trial}</Link></li>
              </ul>
            </div>
            <div>
              <h4>{t.contact}</h4>
              <ul>
                <li><a href={SITE.WHATSAPP} target="_blank" rel="noopener">WhatsApp</a></li>
                <li><a href={`mailto:${SITE.EMAIL}`}>{SITE.EMAIL}</a></li>
                <li><Link to="/contact">{t.footForm}</Link></li>
              </ul>
              <div className="socials">
                <a href={SITE.LINKEDIN} target="_blank" rel="noopener" aria-label="LinkedIn"><img src="/assets/icons/linkedin.svg" alt="" /></a>
                <a href={SITE.INSTAGRAM} target="_blank" rel="noopener" aria-label="Instagram"><img src="/assets/icons/instagram.svg" alt="" /></a>
                <a href={SITE.FACEBOOK} target="_blank" rel="noopener" aria-label="Facebook"><img src="/assets/icons/facebook.svg" alt="" /></a>
              </div>
            </div>
            <div>
              <h4>{t.footSupport}</h4>
              <ul>
                <li><Link to="/#faq">{t.faqKicker}</Link></li>
                <li><button type="button" className="linkish" onClick={onChat} style={{ background: "none", border: 0, color: "inherit", cursor: "pointer", padding: 0, font: "inherit" }}>{t.chatNur}</button></li>
                <li><Link to="/login">{t.studentLogin}</Link></li>
                <li><Link to="/login">{t.teachWithUs}</Link></li>
              </ul>
            </div>
          </div>
          <div className="copy">
            <span>{t.copyLeft}</span>
            <span>{t.copyRight}</span>
          </div>
        </div>
      </footer>
      <a className="wa-float" href={SITE.WHATSAPP} target="_blank" rel="noopener" data-tip={t.waTip} aria-label="WhatsApp">
        <img src="/assets/icons/whatsapp.svg" alt="" />
      </a>
    </>
  );
}
