import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { i18n } from "../i18n";
import { api } from "../api";

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("qa-lang") || "en");
  const [currency, setCurrencyState] = useState(() => localStorage.getItem("qa-currency") || "pkr");
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");

  const t = i18n[lang] || i18n.en;

  useEffect(() => {
    document.documentElement.lang = lang === "ur" ? "ur" : "en";
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    localStorage.setItem("qa-lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("qa-currency", currency);
  }, [currency]);

  useEffect(() => {
    api("/api/auth/me")
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const value = useMemo(
    () => ({
      lang,
      setLang: setLangState,
      currency,
      setCurrency: setCurrencyState,
      t,
      user,
      setUser,
      ready,
      showToast,
    }),
    [lang, currency, t, user, ready]
  );

  return (
    <AppCtx.Provider value={value}>
      {children}
      {toast ? <div className="toast show">{toast}</div> : null}
    </AppCtx.Provider>
  );
}

export function useApp() {
  return useContext(AppCtx);
}
