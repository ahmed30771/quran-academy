import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../api";
import { dashPath, localized, validatePersonName, validateEmail, validateEmailOptional, validatePassword, validatePhone } from "../helpers";

export default function Login() {
  const { t, lang, user, setUser, showToast, ready } = useApp();
  const loc = useLocation();
  const nav = useNavigate();
  const afterAuth = loc.state?.from || "";
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("student");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [resetEmail, setResetEmail] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [teachingLanguages, setTeachingLanguages] = useState("");
  const [teachKids, setTeachKids] = useState(false);
  const [teachAdults, setTeachAdults] = useState(false);
  const [qualifications, setQualifications] = useState("");
  const [courseIds, setCourseIds] = useState([]);
  const [courseMenuOpen, setCourseMenuOpen] = useState(false);
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    api("/api/courses").then(setCatalog).catch(() => setCatalog([]));
  }, []);

  if (ready && user) return <Navigate to={afterAuth || dashPath(user)} replace />;

  function switchMode(next) {
    setMode(next);
    setErrors({});
  }

  async function onLogin(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const login = String(form.get("login") || "");
    const password = String(form.get("password") || "");
    const loginErr = login.includes("@") ? validateEmail(login, t) : validatePhone(login, t);
    const next = { login: loginErr, password: password ? "" : t.errPassRequired };
    setErrors(next);
    if (next.login || next.password) return;
    setBusy(true);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: { login, password },
      });
      setUser(data.user);
      nav(afterAuth || dashPath(data.user));
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onRegister(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const next = {
      name: validatePersonName(name, t),
      email: validateEmailOptional(email, t),
      phone: validatePhone(phone, t),
      password: validatePassword(password, t),
      gender: gender === "male" || gender === "female" ? "" : t.errGender,
      qualifications: role === "teacher" && !qualifications.trim() ? t.errQualRequired : "",
    };
    setErrors(next);
    if (next.name || next.email || next.phone || next.password || next.gender || next.qualifications) return;
    setBusy(true);
    try {
      const data = await api("/api/auth/register", {
        method: "POST",
        body: {
          name,
          email,
          password,
          role,
          gender,
          phone,
          teachingLanguages: role === "teacher" ? teachingLanguages : "",
          teachKids: role === "teacher" && teachKids,
          teachAdults: role === "teacher" && teachAdults,
          courseIds: role === "teacher" ? courseIds : [],
          qualifications: role === "teacher" ? qualifications : "",
        },
      });
      setUser(data.user);
      if (data.user.status === "pending") showToast(t.teacherPending);
      nav(afterAuth || dashPath(data.user));
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onForgot(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = String(form.get("email") || "");
    const emailErr = validateEmail(email, t);
    setErrors({ email: emailErr });
    if (emailErr) return;
    setBusy(true);
    try {
      await api("/api/auth/forgot-password", { method: "POST", body: { email } });
      setResetEmail(email.trim().toLowerCase());
      switchMode("reset");
      showToast(t.forgotSent);
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onReset(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = resetEmail || String(form.get("email") || "");
    const code = String(form.get("code") || "").trim();
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    const next = {
      email: validateEmail(email, t),
      code: /^\d{6}$/.test(code) ? "" : t.errResetCode,
      password: validatePassword(password, t),
      confirm: password === confirm ? "" : t.errPassMatch,
    };
    setErrors(next);
    if (next.email || next.code || next.password || next.confirm) return;
    setBusy(true);
    try {
      await api("/api/auth/reset-password", { method: "POST", body: { email, code, password } });
      showToast(t.resetDone);
      switchMode("login");
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  const heading =
    mode === "register" ? t.createAccount : mode === "forgot" || mode === "reset" ? t.forgotTitle : t.signIn;
  const lede =
    mode === "forgot" ? t.forgotLede : mode === "reset" ? t.resetLede : t.loginLede;

  return (
    <main className="auth-page">
      <div className={`auth-card${mode === "register" && role === "teacher" ? " is-wide" : ""}`}>
        <p className="kicker">{t.welcome}</p>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>{heading}</h1>
        <p className="lede" style={{ marginBottom: "1.2rem" }}>{lede}</p>

        {mode === "login" || mode === "register" ? (
          <>
            <div className="tabs">
              <button type="button" className={mode === "login" ? "is-on" : ""} onClick={() => switchMode("login")}>{t.login}</button>
              <button type="button" className={mode === "register" ? "is-on" : ""} onClick={() => switchMode("register")}>{t.register}</button>
            </div>
            <div className="role-tabs">
              {["student", "teacher"].map((r) => (
                <button key={r} type="button" className={role === r ? "is-on" : ""} onClick={() => setRole(r)}>
                  {t[r]}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {mode === "login" ? (
          <form className="form" onSubmit={onLogin} noValidate>
            <label>
              <span>{t.fldEmailOrPhone}</span>
              <input name="login" autoComplete="username" placeholder={t.phEmailOrPhone} className={errors.login ? "is-invalid" : ""} />
              {errors.login ? <em className="field-error">{errors.login}</em> : null}
            </label>
            <label>
              <span>{t.password}</span>
              <input type="password" name="password" autoComplete="current-password" placeholder={t.phPass} className={errors.password ? "is-invalid" : ""} />
              {errors.password ? <em className="field-error">{errors.password}</em> : null}
            </label>
            <button className="linkish auth-forgot" type="button" onClick={() => switchMode("forgot")}>{t.forgotLink}</button>
            <button className="btn btn-primary" type="submit" disabled={busy}>{t.enterDash}</button>
          </form>
        ) : null}

        {mode === "register" ? (
          <form className="form" onSubmit={onRegister} noValidate>
            <label>
              <span>{t.fullName}</span>
              <input name="name" autoComplete="name" placeholder={t.phName} className={errors.name ? "is-invalid" : ""} />
              {errors.name ? <em className="field-error">{errors.name}</em> : null}
            </label>
            <label>
              <span>{t.fldEmailOptional}</span>
              <input type="email" name="email" autoComplete="email" placeholder={t.phEmail} className={errors.email ? "is-invalid" : ""} />
              {errors.email ? <em className="field-error">{errors.email}</em> : null}
            </label>
            <label>
              <span>{t.fldPhone}</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder={t.phPhone} className={errors.phone ? "is-invalid" : ""} />
              {errors.phone ? <em className="field-error">{errors.phone}</em> : null}
            </label>
            <label>
              <span>{t.password}</span>
              <input type="password" name="password" autoComplete="new-password" placeholder={t.phPassNew} className={errors.password ? "is-invalid" : ""} />
              {errors.password ? <em className="field-error">{errors.password}</em> : null}
            </label>
            <label>
              <span>{t.gender}</span>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={errors.gender ? "is-invalid" : ""}>
                <option value="">{t.gender}</option>
                <option value="male">{t.genderMale}</option>
                <option value="female">{t.genderFemale}</option>
              </select>
              {errors.gender ? <em className="field-error">{errors.gender}</em> : null}
            </label>
            {role === "teacher" ? (
              <>
                <label>
                  <span>{t.fldQualification}</span>
                  <textarea value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder={t.phQualification} className={errors.qualifications ? "is-invalid" : ""} />
                  {errors.qualifications ? <em className="field-error">{errors.qualifications}</em> : null}
                </label>
                <label>
                  <span>{t.teachingLang}</span>
                  <select value={teachingLanguages} onChange={(e) => setTeachingLanguages(e.target.value)}>
                    <option value="">{t.skipCourses}</option>
                    <option value="urdu">{t.langUrdu}</option>
                    <option value="english">{t.langEnglish}</option>
                    <option value="both">{t.langBoth}</option>
                  </select>
                </label>
                <fieldset className="check-set">
                  <legend>{t.teachAudience}</legend>
                  <label className="check-row"><input type="checkbox" checked={teachKids} onChange={(e) => setTeachKids(e.target.checked)} /> {t.filterKids}</label>
                  <label className="check-row"><input type="checkbox" checked={teachAdults} onChange={(e) => setTeachAdults(e.target.checked)} /> {t.filterAdults}</label>
                </fieldset>
                <div className={`multi-select${errors.courses ? " is-invalid" : ""}`}>
                  <span>{t.teachCourses}</span>
                  <p className="hint" style={{ margin: "0.2rem 0 0.45rem", textAlign: "start" }}>{t.teachCoursesHint}</p>
                  <button type="button" className="multi-select-toggle" onClick={() => setCourseMenuOpen((open) => !open)}>
                    {courseIds.length ? t.teachCoursesPicked.replace("{n}", String(courseIds.length)) : t.teachCoursesPick}
                  </button>
                  {courseMenuOpen ? (
                    <div className="multi-select-menu" role="listbox" aria-multiselectable="true">
                      {catalog.map((c) => {
                        const checked = courseIds.includes(c.id);
                        return (
                          <label className="check-row" key={c.id}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => setCourseIds((ids) => (e.target.checked ? [...ids, c.id] : ids.filter((id) => id !== c.id)))}
                            />
                            {localized(c, lang).title}
                          </label>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}
            <button className="btn btn-gold" type="submit" disabled={busy}>{t.createAccount}</button>
          </form>
        ) : null}

        {mode === "forgot" ? (
          <form className="form" onSubmit={onForgot} noValidate>
            <label>
              <span>{t.fldEmail}</span>
              <input type="email" name="email" autoComplete="email" placeholder={t.phEmail} className={errors.email ? "is-invalid" : ""} />
              {errors.email ? <em className="field-error">{errors.email}</em> : null}
            </label>
            <button className="btn btn-primary" type="submit" disabled={busy}>{t.sendResetCode}</button>
            <button className="linkish auth-back" type="button" onClick={() => switchMode("login")}>{t.backToLogin}</button>
          </form>
        ) : null}

        {mode === "reset" ? (
          <form className="form" onSubmit={onReset} noValidate>
            <label>
              <span>{t.fldEmail}</span>
              <input type="email" name="email" value={resetEmail} readOnly />
            </label>
            <label>
              <span>{t.resetCode}</span>
              <input name="code" inputMode="numeric" autoComplete="one-time-code" placeholder={t.phResetCode} className={errors.code ? "is-invalid" : ""} />
              {errors.code ? <em className="field-error">{errors.code}</em> : null}
            </label>
            <label>
              <span>{t.newPassword}</span>
              <input type="password" name="password" autoComplete="new-password" placeholder={t.phPassNew} className={errors.password ? "is-invalid" : ""} />
              {errors.password ? <em className="field-error">{errors.password}</em> : null}
            </label>
            <label>
              <span>{t.confirmPassword}</span>
              <input type="password" name="confirm" autoComplete="new-password" placeholder={t.phPassConfirm} className={errors.confirm ? "is-invalid" : ""} />
              {errors.confirm ? <em className="field-error">{errors.confirm}</em> : null}
            </label>
            <button className="btn btn-gold" type="submit" disabled={busy}>{t.saveNewPass}</button>
            <button className="linkish auth-back" type="button" onClick={() => switchMode("login")}>{t.backToLogin}</button>
          </form>
        ) : null}

        {mode === "login" || mode === "register" ? <p className="hint">{t.loginHint}</p> : null}
      </div>
    </main>
  );
}
