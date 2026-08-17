import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../api";
import { dashPath } from "../helpers";

export default function Login() {
  const { t, user, setUser, showToast, ready } = useApp();
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("student");
  const [busy, setBusy] = useState(false);

  if (ready && user) return <Navigate to={dashPath(user)} replace />;

  async function onLogin(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    setBusy(true);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: { email: form.get("email"), password: form.get("password") },
      });
      setUser(data.user);
      nav(dashPath(data.user));
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onRegister(e) {
    e.preventDefault();
    if (role === "admin") {
      showToast(t.loginHint);
      return;
    }
    const form = new FormData(e.target);
    setBusy(true);
    try {
      const data = await api("/api/auth/register", {
        method: "POST",
        body: {
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          role,
        },
      });
      setUser(data.user);
      if (data.user.status === "pending") {
        showToast("Account created. An admin will approve teacher access.");
      }
      nav(dashPath(data.user));
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="kicker">{t.welcome}</p>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>{t.signIn}</h1>
        <p className="lede" style={{ marginBottom: "1.2rem" }}>{t.loginLede}</p>
        <div className="tabs">
          <button type="button" className={mode === "login" ? "is-on" : ""} onClick={() => setMode("login")}>{t.login}</button>
          <button type="button" className={mode === "register" ? "is-on" : ""} onClick={() => setMode("register")}>{t.register}</button>
        </div>
        <div className="role-tabs">
          {["student", "teacher", "admin"].map((r) => (
            <button key={r} type="button" className={role === r ? "is-on" : ""} onClick={() => setRole(r)}>
              {t[r]}
            </button>
          ))}
        </div>
        {mode === "login" ? (
          <form className="form" onSubmit={onLogin}>
            <label><span>{t.fldEmail}</span> <input type="email" name="email" required placeholder={t.phEmail} /></label>
            <label><span>{t.password}</span> <input type="password" name="password" required placeholder={t.phPass} /></label>
            <button className="btn btn-primary" type="submit" disabled={busy}>{t.enterDash}</button>
          </form>
        ) : (
          <form className="form" onSubmit={onRegister}>
            <label><span>{t.fullName}</span> <input name="name" required placeholder={t.phName} /></label>
            <label><span>{t.fldEmail}</span> <input type="email" name="email" required placeholder={t.phEmail} /></label>
            <label><span>{t.password}</span> <input type="password" name="password" required placeholder={t.phPassNew} /></label>
            <button className="btn btn-gold" type="submit" disabled={busy || role === "admin"}>{t.createAccount}</button>
          </form>
        )}
        <p className="hint">{t.loginHint}</p>
      </div>
    </main>
  );
}
