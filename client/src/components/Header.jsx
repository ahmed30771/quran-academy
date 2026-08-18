import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Header() {
  const { t, lang, setLang, currency, setCurrency, user } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hot, setHot] = useState(false);
  const [mx, setMx] = useState("50%");
  const [my, setMy] = useState("50%");
  const [scroll, setScroll] = useState("0%");
  const loc = useLocation();

  useEffect(() => setOpen(false), [loc.pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 16);
      setScroll((max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dash = user
    ? user.role === "admin"
      ? "/admin/dashboard"
      : user.role === "teacher"
        ? "/teacher/dashboard"
        : "/student/dashboard"
    : "/login";

  const cls = ["site-header", scrolled && "is-scrolled", hot && "is-hot"].filter(Boolean).join(" ");

  return (
    <header
      className={cls}
      style={{ "--mx": mx, "--my": my, "--scroll": scroll }}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onMouseMove={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        setMx(e.clientX - box.left + "px");
        setMy(e.clientY - box.top + "px");
      }}
    >
      <div className="wrap">
        <Link className="brand" to="/">
          <img src="/assets/icons/logo.svg" alt="" />
          <span>
            <span className="brand-name">Quran Academy</span>
            <span className="brand-sub">{t.tagline}</span>
          </span>
        </Link>
        <nav className={`nav${open ? " open" : ""}`} id="nav">
          <button type="button" className="menu-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "is-active" : "")}>{t.home}</NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "is-active" : "")}>{t.about}</NavLink>
          <NavLink to="/courses" className={({ isActive }) => (isActive ? "is-active" : "")}>{t.courses}</NavLink>
          <NavLink to="/fees" className={({ isActive }) => (isActive ? "is-active" : "")}>{t.fees}</NavLink>
          <NavLink to="/blog" className={({ isActive }) => (isActive ? "is-active" : "")}>{t.blog}</NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? "is-active" : "")}>{t.contact}</NavLink>
          <NavLink to={dash} className={({ isActive }) => (isActive ? "is-active" : "")}>{user ? t.overview : t.login}</NavLink>
          <div className="nav-tools">
            <div className="lang-toggle">
              <button type="button" className={lang === "en" ? "is-on" : ""} onClick={() => setLang("en")}>EN</button>
              <button type="button" className={lang === "ur" ? "is-on" : ""} onClick={() => setLang("ur")}>UR</button>
            </div>
            <div className="lang-toggle">
              <button type="button" className={currency === "pkr" ? "is-on" : ""} onClick={() => setCurrency("pkr")}>PKR</button>
              <button type="button" className={currency === "usd" ? "is-on" : ""} onClick={() => setCurrency("usd")}>USD</button>
            </div>
            <Link className="btn btn-gold btn-sm" to="/contact">{t.trial}</Link>
          </div>
        </nav>
        <button className="menu-btn" type="button" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
