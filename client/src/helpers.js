import { api } from "./api.js";

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

export function normalizePhone(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = "92" + digits.slice(1);
  return digits;
}

export function validatePhone(phone, t) {
  const raw = String(phone || "").trim();
  if (!raw) return t.errPhoneRequired;
  const digits = normalizePhone(raw);
  if (digits.length < 10 || digits.length > 15) return t.errPhoneInvalid;
  return "";
}

export function validateEmail(email, t) {
  const value = String(email || "").trim().toLowerCase();
  if (!value) return t.errEmailRequired;
  if (!value.includes("@") || !EMAIL_RE.test(value)) return t.errEmailInvalid;
  return "";
}

export function validateEmailOptional(email, t) {
  const value = String(email || "").trim();
  if (!value) return "";
  return validateEmail(value, t);
}

export function validatePassword(password, t) {
  if (!password) return t.errPassRequired;
  if (String(password).length < 8) return t.errPassLength;
  return "";
}

export function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function firstLastName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length <= 2) return parts.join(" ");
  return `${parts[0]} ${parts[parts.length - 1]}`;
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

export function starLine(value) {
  const n = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return "★".repeat(n) + "☆".repeat(5 - n);
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

export function categoryLabel(value, t) {
  const map = {
    tajweed: t.filterTajweed,
    hifz: t.filterHifz,
    recitation: t.filterRec,
    arabic: t.filterArabic,
  };
  return map[value] || value || "";
}

export function localized(item, lang) {
  if (!item || lang !== "ur") return item;
  const ur = item.locale_ur && typeof item.locale_ur === "object" ? item.locale_ur : {};
  const pick = (key) => ur[key] || item[key];
  return {
    ...item,
    title: pick("title"),
    blurb: pick("blurb"),
    full_blurb: pick("full_blurb"),
    intro: pick("intro"),
    description: pick("description"),
    who_for: pick("who_for"),
    learnings: pick("learnings"),
    duration: pick("duration"),
    length: pick("length"),
    frequency: pick("frequency"),
    requirements: pick("requirements"),
    excerpt: pick("excerpt"),
    body: pick("body"),
    tag: pick("tag"),
  };
}

export const COVER_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_MAX_BYTES = 400 * 1024;

function coverCrop(img) {
  const ratio = 16 / 9;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (sw / sh > ratio) {
    sw = img.height * ratio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / ratio;
    sy = (img.height - sh) / 2;
  }
  return { sx, sy, sw, sh };
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("bad-image"));
    reader.readAsDataURL(blob);
  });
}

export function readCoverAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("bad-image"));
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(url);
      try {
        const crop = coverCrop(img);
        let width = Math.min(1920, Math.max(1, Math.round(crop.sw)));
        let quality = 0.88;
        let best = null;
        for (let i = 0; i < 12; i += 1) {
          const height = Math.max(1, Math.round(width / (16 / 9)));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);
          const blob = await canvasToBlob(canvas, quality);
          if (blob) best = blob;
          if (blob && blob.size <= COVER_MAX_BYTES) break;
          if (quality > 0.55) quality -= 0.1;
          else width = Math.max(640, Math.round(width * 0.82));
          if (width <= 640 && quality <= 0.55) break;
        }
        if (!best) return reject(new Error("bad-image"));
        resolve(await blobToDataUrl(best));
      } catch {
        reject(new Error("bad-image"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("bad-image"));
    };
    img.src = url;
  });
}

export function readAvatarAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("bad-image"));
    if (!String(file.type || "").startsWith("image/")) return reject(new Error("bad-image"));
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(url);
      try {
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        let size = Math.min(320, side);
        let quality = 0.86;
        let best = null;
        for (let i = 0; i < 10; i += 1) {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          canvas.getContext("2d").drawImage(img, sx, sy, side, side, 0, 0, size, size);
          const blob = await canvasToBlob(canvas, quality);
          if (blob) best = blob;
          if (blob && blob.size <= AVATAR_MAX_BYTES) break;
          if (quality > 0.55) quality -= 0.1;
          else size = Math.max(96, Math.round(size * 0.82));
          if (size <= 96 && quality <= 0.55) break;
        }
        if (!best) return reject(new Error("bad-image"));
        resolve(await blobToDataUrl(best));
      } catch {
        reject(new Error("bad-image"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("bad-image"));
    };
    img.src = url;
  });
}

export async function squareImageToAvatarDataUrl(img, sx, sy, side) {
  const srcSide = Math.max(1, side);
  let size = Math.min(320, Math.round(srcSide));
  let quality = 0.86;
  let best = null;
  for (let i = 0; i < 10; i += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    canvas.getContext("2d").drawImage(img, sx, sy, srcSide, srcSide, 0, 0, size, size);
    const blob = await canvasToBlob(canvas, quality);
    if (blob) best = blob;
    if (blob && blob.size <= AVATAR_MAX_BYTES) break;
    if (quality > 0.55) quality -= 0.1;
    else size = Math.max(96, Math.round(size * 0.82));
    if (size <= 96 && quality <= 0.55) break;
  }
  if (!best) throw new Error("bad-image");
  return blobToDataUrl(best);
}

export function dashPath(user) {
  if (!user) return "/login";
  if (user.role === "admin") return "/admin/dashboard";
  if (user.role === "teacher") return "/teacher/dashboard";
  return "/student/dashboard";
}

export async function startCourseTrial({ nav, user, showToast, t, courseId }) {
  if (!user) {
    nav("/login", { state: { from: `/courses/${courseId}` } });
    return null;
  }
  if (user.role !== "student") {
    showToast(t.onlyStudentTrial);
    return null;
  }
  try {
    const res = await api(`/api/courses/${encodeURIComponent(courseId)}/trial`, { method: "POST" });
    showToast(t.toastTrial);
    return res;
  } catch (err) {
    showToast(err.message || t.toastTrialUsed);
    return null;
  }
}
