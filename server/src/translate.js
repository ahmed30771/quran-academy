const HAS_URDU = /[\u0600-\u06FF]/;
const HAS_ENGLISH = /[A-Za-z]{3,}/;

const PHRASES = [
  ["Quran Reading / Nazra", "قرآن خوانی / ناظرہ"],
  ["Tajweed-ul-Quran", "تجوید القرآن"],
  ["Hifz-ul-Quran", "حفظ القرآن"],
  ["Quran with Translation", "قرآن مع ترجمہ"],
  ["Salah & Daily Duas", "نماز اور روزمرہ دعائیں"],
  ["Quran Recitation", "قرآن کی تلاوت"],
  ["Quran Tafseer", "قرآن تفسیر"],
  ["Islamic Studies", "اسلامی تعلیمات"],
  ["Arabic Basics", "عربی کی بنیادیں"],
  ["Noorani Qaida", "نورانی قاعدہ"],
  ["Getting started", "شروع کریں"],
  ["All levels", "تمام سطحیں"],
  ["Intermediate", "درمیانی"],
  ["Beginner", "ابتدائی"],
  ["Advanced", "اعلیٰ"],
  ["Flexible", "لچکدار"],
  ["live teacher", "لائیو استاد"],
  ["certified teacher", "تصدیق شدہ استاد"],
  ["free trial", "مفت ٹرائل"],
  ["per month", "ماہانہ"],
  ["Teachers", "اساتذہ"],
  ["Tajweed", "تجوید"],
  ["Adults", "بالغ"],
  ["Kids", "بچے"],
  ["Hifz", "حفظ"],
  ["Nazra", "ناظرہ"],
];

const COURSE_KEYS = ["title", "blurb", "full_blurb", "intro", "description", "who_for", "learnings", "duration", "length", "frequency", "requirements"];
const BLOG_KEYS = ["title", "tag", "excerpt", "body"];

function applyPatterns(text) {
  return String(text || "")
    .replace(/\b(\d+)\s*(?:minutes?|mins?|min)\b/gi, "$1 منٹ")
    .replace(/\b(\d+)\s*(?:months?|month)\b/gi, "$1 مہینے")
    .replace(/\b(\d+)\s*(?:years?|year)\b/gi, "$1 سال")
    .replace(/\b(\d+)\s*(?:weeks?|week)\b/gi, "$1 ہفتے")
    .replace(/\b(\d+)\s*(?:hours?|hrs?|hour)\b/gi, "$1 گھنٹے")
    .replace(/\b(\d+)\s*times\s*a\s*week\b/gi, "ہفتے میں $1 بار")
    .replace(/\b(\d+)\s*days?\s*a\s*week\b/gi, "ہفتے میں $1 دن");
}

export function applyGlossary(text) {
  let out = String(text || "").trim();
  if (!out) return "";
  if (HAS_URDU.test(out) && !HAS_ENGLISH.test(out)) return out;
  for (const [en, ur] of PHRASES) {
    out = out.replace(new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), ur);
  }
  return applyPatterns(out);
}

async function mymemory(text) {
  const q = String(text || "").trim().slice(0, 450);
  if (!q) return "";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=en|ur`;
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return "";
    const data = await res.json();
    const translated = String(data?.responseData?.translatedText || "").trim();
    if (!translated || /MYMEMORY|INVALID|QUERY LENGTH/i.test(translated)) return "";
    return translated;
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

export async function toUrdu(text) {
  const src = String(text || "").trim();
  if (!src) return "";
  if (HAS_URDU.test(src) && !HAS_ENGLISH.test(src)) return src;
  const local = applyGlossary(src);
  if (!HAS_ENGLISH.test(local)) return local;
  const remote = await mymemory(src);
  return remote || local;
}

function pick(row, keys) {
  const out = {};
  for (const key of keys) {
    const value = String(row?.[key] || "").trim();
    if (value) out[key] = value;
  }
  return out;
}

export async function translateFields(fields) {
  const entries = Object.entries(fields || {}).filter(([, value]) => String(value || "").trim());
  const pairs = await Promise.all(entries.map(async ([key, value]) => [key, await toUrdu(value)]));
  return Object.fromEntries(pairs);
}

export function courseSource(row) {
  return pick(row, COURSE_KEYS);
}

export function blogSource(row) {
  return pick(row, BLOG_KEYS);
}

export function localeFromGlossary(row, keys) {
  const out = {};
  for (const key of keys) {
    const value = String(row?.[key] || "").trim();
    if (value) out[key] = applyGlossary(value);
  }
  return out;
}

export { COURSE_KEYS, BLOG_KEYS };
