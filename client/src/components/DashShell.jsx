import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../api";
import { ago, dashPath, firstLastName, initials, validatePassword } from "../helpers";
import AvatarCrop from "./AvatarCrop";

export default function DashShell({ role, searchPlaceholder, navLinks, activeKey, onNavChange, children }) {
  const { t, lang, setLang, currency, setCurrency, user, setUser, ready, showToast } = useApp();
  const nav = useNavigate();
  const [side, setSide] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [modal, setModal] = useState(null);
  const [cropSrc, setCropSrc] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    phoneNumber: "",
    dateOfBirth: "",
    preferredLanguage: "en",
    timezone: "UTC",
    qualifications: "",
    experience: "",
    subjects: "",
    availableTimes: "",
    introduction: "",
    gender: "",
    teachingLanguages: "",
    teachKids: false,
    teachAdults: false,
    avatar: "",
  });
  const [settings, setSettings] = useState({
    privacy: "staff",
    showEmail: true,
    emailNotif: true,
    waNotif: true,
    password: "",
  });

  useEffect(() => {
    document.body.classList.add("is-dash");
    return () => document.body.classList.remove("is-dash");
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
      phoneNumber: user.phoneNumber || "",
      dateOfBirth: user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : "",
      preferredLanguage: user.preferredLanguage || "en",
      timezone: user.timezone || "UTC",
      qualifications: user.qualifications || "",
      experience: user.experience || "",
      subjects: user.subjects || "",
      availableTimes: user.availableTimes || "",
      introduction: user.introduction || "",
      gender: user.gender || "",
      teachingLanguages: user.teachingLanguages || "",
      teachKids: !!user.teachKids,
      teachAdults: !!user.teachAdults,
      avatar: user.avatar || "",
    });
    setSettings((s) => ({
      ...s,
      privacy: user.privacy || "staff",
      showEmail: !!user.showEmail,
      emailNotif: !!user.emailNotif,
      waNotif: !!user.waNotif,
    }));
    api("/api/dash/me").then(setNotes).catch(() => setNotes([]));
  }, [user]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSide(false);
        setNotesOpen(false);
        setAcctOpen(false);
        if (cropSrc) setCropSrc("");
        else setModal(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cropSrc]);

  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={dashPath(user)} replace />;

  const menuLinks = useMemo(
    () =>
      navLinks.map((item, i) => ({
        ...item,
        kind: item.to?.startsWith("/") ? "route" : item.key ? "section" : "link",
        active:
          item.key
            ? activeKey === item.key
            : i === 0 && !activeKey,
      })),
    [activeKey, navLinks]
  );

  const unread = notes.some((n) => !n.is_read);
  const closeDrops = () => {
    setNotesOpen(false);
    setAcctOpen(false);
  };

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    nav("/login");
  }

  async function markRead() {
    await api("/api/dash/read", { method: "POST" }).catch(() => {});
    setNotes((rows) => rows.map((n) => ({ ...n, is_read: 1 })));
  }

  async function onAvatar(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!String(file.type || "").startsWith("image/")) {
      showToast(t.errCourseImage);
      return;
    }
    const url = URL.createObjectURL(file);
    if (cropSrc.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropSrc(url);
  }

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const data = await api("/api/profile", { method: "PUT", body: profile });
      setUser(data.user);
      setModal(null);
      showToast(t.toastProfile);
    } catch (err) {
      showToast(err.message);
    }
  }

  async function saveSettings(e) {
    e.preventDefault();
    if (settings.password) {
      const passErr = validatePassword(settings.password, t);
      if (passErr) {
        showToast(passErr);
        return;
      }
    }
    try {
      const data = await api("/api/profile/settings", { method: "PUT", body: settings });
      setUser(data.user);
      setModal(null);
      showToast(t.toastSettings);
    } catch (err) {
      showToast(err.message);
    }
  }

  return (
    <div className="dash">
      <div className={`side-backdrop${side ? " open" : ""}`} onClick={() => setSide(false)} />
      <aside className={`side${side ? " open" : ""}`} id="side">
        <div className="side-top">
          <Link className="brand" to="/">
            <img src="/assets/icons/logo.svg" alt="" />
            <span>
              <span className="brand-name">Quran Academy</span>
              <span className="brand-sub">{t[role]}</span>
            </span>
          </Link>
          <button className="menu-close" type="button" onClick={() => setSide(false)} aria-label="Close">×</button>
        </div>
        <nav>
          {menuLinks.map((item) => {
            if (item.kind === "route") {
              return (
                <Link key={item.label + item.to} className={item.active ? "is-active" : ""} to={item.to} onClick={() => setSide(false)}>
                  {item.label}
                </Link>
              );
            }
            if (item.kind === "section") {
              return (
                <button
                  key={item.key}
                  type="button"
                  className={item.active ? "is-active" : ""}
                  onClick={() => {
                    onNavChange?.(item.key);
                    setSide(false);
                  }}
                >
                  {item.label}
                </button>
              );
            }
            return (
              <a key={item.label + item.to} className={item.active ? "is-active" : ""} href={item.to} onClick={() => setSide(false)}>
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="side-tools">
          <div className="lang-toggle" role="group" aria-label="Language">
            <button type="button" className={lang === "en" ? "is-on" : ""} onClick={() => setLang("en")}>EN</button>
            <button type="button" className={lang === "ur" ? "is-on" : ""} onClick={() => setLang("ur")}>UR</button>
          </div>
          <div className="lang-toggle" role="group" aria-label="Currency">
            <button type="button" className={currency === "pkr" ? "is-on" : ""} onClick={() => setCurrency("pkr")}>PKR</button>
            <button type="button" className={currency === "usd" ? "is-on" : ""} onClick={() => setCurrency("usd")}>USD</button>
          </div>
        </div>
        <Link className="out" to="/">{t.backSite}</Link>
      </aside>
      <div className="main-dash">
        <header className="topbar">
          <button className="dash-menu btn btn-ghost btn-sm" type="button" onClick={() => setSide(true)}>{t.menu}</button>
          <label className="search"><input type="search" placeholder={searchPlaceholder} /></label>
          <div className="top-right">
            <div className={`drop${notesOpen ? " open" : ""}`}>
              <button
                className={`bell${unread ? "" : " is-read"}`}
                type="button"
                aria-label="Notifications"
                onClick={(e) => {
                  e.stopPropagation();
                  setAcctOpen(false);
                  setNotesOpen((v) => !v);
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
                  <path d="M10 20a2 2 0 0 0 4 0" />
                </svg>
                {unread ? <i /> : null}
              </button>
              <div className="drop-panel">
                <div className="drop-head">
                  <strong>{t.notifications}</strong>
                  <button type="button" className="linkish" onClick={markRead}>{t.markRead}</button>
                </div>
                <ul className="note-list">
                  {notes.length ? notes.map((n) => (
                    <li key={n.id}><span>{n.text}</span><b>{ago(n.created_at)}</b></li>
                  )) : <li><span>No notifications yet.</span></li>}
                </ul>
              </div>
            </div>
            <div className={`drop${acctOpen ? " open" : ""}`}>
              <button
                className="who"
                type="button"
                aria-haspopup="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setNotesOpen(false);
                  setAcctOpen((v) => !v);
                }}
              >
                <span className="avatar dash-avatar">
                  {user.avatar ? <img src={user.avatar} alt="" /> : initials(user.name)}
                </span>
                <span className="who-name">{firstLastName(user.name)}</span>
              </button>
              <div className="drop-panel drop-menu">
                <button type="button" onClick={() => { closeDrops(); setModal("profile"); }}>{t.profile}</button>
                <button type="button" onClick={() => { closeDrops(); setModal("settings"); }}>{t.settings}</button>
                <button type="button" onClick={logout}>{t.logout}</button>
              </div>
            </div>
          </div>
        </header>
        <div className="dash-body" onClick={closeDrops}>
          {user.status === "pending" ? (
            <article className="card">
              <p className="kicker">{t.pendingTeachers}</p>
              <p>Your teacher account is waiting for admin approval. You can still review this dashboard.</p>
            </article>
          ) : null}
          <div className="dash-glow dash-glow-a" />
          <div className="dash-glow dash-glow-b" />
          {children}
        </div>
      </div>

      {modal === "profile" ? (
        <div className="modal-bg open" onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          if (cropSrc) {
            if (cropSrc.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
            setCropSrc("");
            return;
          }
          setModal(null);
        }}>
          <div className="modal modal-scroll">
            <button className="menu-close modal-x" type="button" onClick={() => {
              if (cropSrc) {
                if (cropSrc.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
                setCropSrc("");
                return;
              }
              setModal(null);
            }}>×</button>
            <h3>{cropSrc ? t.cropPhoto : t.profileTitle}</h3>
            {cropSrc ? (
              <AvatarCrop
                src={cropSrc}
                t={t}
                onCancel={() => {
                  if (cropSrc.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
                  setCropSrc("");
                }}
                onApply={(avatar) => {
                  if (cropSrc.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
                  setCropSrc("");
                  if (avatar) setProfile((p) => ({ ...p, avatar }));
                  else showToast(t.errCourseImage);
                }}
              />
            ) : (
            <form className="form modal-form" onSubmit={saveProfile}>
              <div className="modal-form-body">
              <label className="photo-pick" aria-label={t.profilePhoto}>
                <span className="avatar">
                  {profile.avatar ? <img src={profile.avatar} alt="" /> : initials(profile.name)}
                </span>
                <span className="photo-plus" aria-hidden="true">+</span>
                <input type="file" accept="image/*" onChange={onAvatar} />
              </label>
              <label><span>{t.fullName}</span><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required /></label>
              <label><span>{t.fldEmail}</span><input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
              <label><span>Phone number</span><input value={profile.phoneNumber} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} /></label>
              <label><span>Date of birth</span><input type="date" value={profile.dateOfBirth} onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })} /></label>
              <label><span>Preferred language</span><input value={profile.preferredLanguage} onChange={(e) => setProfile({ ...profile, preferredLanguage: e.target.value })} /></label>
              <label><span>Timezone</span><input value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })} /></label>
              <label>
                <span>{t.gender}</span>
                <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                  <option value="">{t.gender}</option>
                  <option value="male">{t.genderMale}</option>
                  <option value="female">{t.genderFemale}</option>
                </select>
              </label>
              <label><span>{t.profileBio}</span><textarea value={profile.bio} placeholder={t.phBio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></label>
              {role !== "student" ? (
                <>
                  <label><span>Introduction</span><textarea value={profile.introduction} onChange={(e) => setProfile({ ...profile, introduction: e.target.value })} /></label>
                  <label><span>Qualifications</span><textarea value={profile.qualifications} onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })} /></label>
                  <label><span>Experience</span><textarea value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })} /></label>
                  <label><span>Subjects / skills</span><textarea value={profile.subjects} onChange={(e) => setProfile({ ...profile, subjects: e.target.value })} /></label>
                  <label>
                    <span>{t.teachingLang}</span>
                    <select value={profile.teachingLanguages} onChange={(e) => setProfile({ ...profile, teachingLanguages: e.target.value })}>
                      <option value="">{t.skipCourses}</option>
                      <option value="urdu">{t.langUrdu}</option>
                      <option value="english">{t.langEnglish}</option>
                      <option value="both">{t.langBoth}</option>
                    </select>
                  </label>
                  <fieldset className="check-set">
                    <legend>{t.teachAudience}</legend>
                    <label className="check-row"><input type="checkbox" checked={profile.teachKids} onChange={(e) => setProfile({ ...profile, teachKids: e.target.checked })} /> {t.filterKids}</label>
                    <label className="check-row"><input type="checkbox" checked={profile.teachAdults} onChange={(e) => setProfile({ ...profile, teachAdults: e.target.checked })} /> {t.filterAdults}</label>
                  </fieldset>
                </>
              ) : null}
              </div>
              <div className="modal-form-foot">
                <button className="btn btn-primary" type="submit">{t.saveProfile}</button>
              </div>
            </form>
            )}
          </div>
        </div>
      ) : null}

      {modal === "settings" ? (
        <div className="modal-bg open" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <button className="menu-close modal-x" type="button" onClick={() => setModal(null)}>×</button>
            <h3>{t.settingsTitle}</h3>
            <form className="form" onSubmit={saveSettings}>
              <p className="kicker">{t.privacy}</p>
              <label>
                <span>{t.privacyWho}</span>
                <select value={settings.privacy} onChange={(e) => setSettings({ ...settings, privacy: e.target.value })}>
                  <option value="staff">{t.privacyPublic}</option>
                  <option value="teachers">{t.privacyTeachers}</option>
                  <option value="me">{t.privacyPrivate}</option>
                </select>
              </label>
              <div className="setting-row">
                <span>{t.showEmail}</span>
                <button className={`toggle${settings.showEmail ? " on" : ""}`} type="button" onClick={() => setSettings({ ...settings, showEmail: !settings.showEmail })} />
              </div>
              <p className="kicker" style={{ marginTop: "1rem" }}>{t.notifPrefs}</p>
              <div className="setting-row">
                <span>{t.emailNotif}</span>
                <button className={`toggle${settings.emailNotif ? " on" : ""}`} type="button" onClick={() => setSettings({ ...settings, emailNotif: !settings.emailNotif })} />
              </div>
              <div className="setting-row">
                <span>{t.waNotif}</span>
                <button className={`toggle${settings.waNotif ? " on" : ""}`} type="button" onClick={() => setSettings({ ...settings, waNotif: !settings.waNotif })} />
              </div>
              <p className="kicker" style={{ marginTop: "1rem" }}>{t.accountSec}</p>
              <label>
                <span>{t.password}</span>
                <input type="password" placeholder={t.phNewPass} value={settings.password} onChange={(e) => setSettings({ ...settings, password: e.target.value })} />
              </label>
              <button className="btn btn-primary" type="submit">{t.saveSettings}</button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
