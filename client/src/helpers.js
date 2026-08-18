const LATIN_NAME = /^[A-Za-z]+(?: [A-Za-z]+)+$/;
const URDU_NAME = /^[\u0600-\u065F\u066E-\u06D3\u06D5\u06EE-\u06FF\u0750-\u077F]+(?:\s+[\u0600-\u065F\u066E-\u06D3\u06D5\u06EE-\u06FF\u0750-\u077F]+)+$/;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function normalizeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

export function validatePersonName(name, t) {
  const value = normalizeName(name);
  if (!value) return t.errNameRequired;
  if (/[0-9\u0660-\u0669\u06F0-\u06F9]/.test(value)) return t.errNameNumbers;
  const hasLatin = /[A-Za-z]/.test(value);
  const hasUrdu = /[\u0600-\u06FF]/.test(value);
  if (hasLatin && hasUrdu) return t.errNameMix;
  if (hasLatin && !LATIN_NAME.test(value)) return t.errNameEnglish;
  if (hasUrdu && !URDU_NAME.test(value)) return t.errNameUrdu;
  if (!hasLatin && !hasUrdu) return t.errNameLetters;
  return "";
}

export function validateEmail(email, t) {
  const value = String(email || "").trim().toLowerCase();
  if (!value) return t.errEmailRequired;
  if (!value.includes("@") || !EMAIL_RE.test(value)) return t.errEmailInvalid;
  return "";
}

export function validatePassword(password, t) {
  if (!password) return t.errPassRequired;
  if (String(password).length < 8) return t.errPassLength;
  return "";
}

export function initials(name) {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ago(iso) {
  if (!iso) return "";
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 2) return "Just now";
  if (mins < 60) return mins + "m ago";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h ago";
  return Math.floor(hours / 24) + "d ago";
}

export function coursePath(course) {
  return `/courses/${course?.slug || course?.id || ""}`;
}

export function langLabel(value, t) {
  if (value === "both") return `${t.langUrdu} · ${t.langEnglish}`;
  if (value === "urdu") return t.langUrdu;
  if (value === "english") return t.langEnglish;
  return "";
}

export function audienceLabel(list, t) {
  const items = Array.isArray(list) ? list : [];
  return items.map((a) => (a === "kids" ? t.filterKids : t.filterAdults)).join(" · ");
}

export function levelLabel(list, t) {
  const items = Array.isArray(list) ? list : [];
  const map = { beginner: t.beginner, intermediate: t.intermediate, advanced: t.advanced };
  return items.map((l) => map[l] || l).join(" · ");
}
export function dashPath(user) {
  if (!user) return "/login";
  if (user.role === "admin") return "/admin/dashboard";
  if (user.role === "teacher") return "/teacher/dashboard";
  return "/student/dashboard";
}
