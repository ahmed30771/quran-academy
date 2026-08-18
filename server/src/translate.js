const HAS_URDU = /[\u0600-\u06FF]/;
const LATIN_WORD = /[A-Za-z]{3,}/;

const COURSE_KEYS = ["title", "blurb", "full_blurb", "intro", "description", "who_for", "learnings", "duration", "length", "frequency", "requirements"];
const BLOG_KEYS = ["title", "tag", "excerpt", "body"];

const EXACT = new Map(
  [
    ["noorani qaida", "نورانی قاعدہ"],
    ["quran reading / nazra", "قرآن خوانی / ناظرہ"],
    ["quran reading/nazra", "قرآن خوانی / ناظرہ"],
    ["tajweed-ul-quran", "تجوید القرآن"],
    ["hifz-ul-quran", "حفظ القرآن"],
    ["quran recitation", "قرآن کی تلاوت"],
    ["arabic basics", "عربی کی بنیادیں"],
    ["quran with translation", "قرآن مع ترجمہ"],
    ["quran tafseer", "قرآن تفسیر"],
    ["islamic studies", "اسلامی تعلیمات"],
    ["salah & daily duas", "نماز اور روزمرہ دعائیں"],
    ["salah and daily duas", "نماز اور روزمرہ دعائیں"],
    ["beginner", "ابتدائی"],
    ["intermediate", "درمیانی"],
    ["advanced", "اعلیٰ"],
    ["all levels", "تمام سطحیں"],
    ["flexible", "لچکدار"],
    ["kids", "بچے"],
    ["adults", "بالغ"],
    ["teachers", "اساتذہ"],
    ["tajweed", "تجوید"],
    ["hifz", "حفظ"],
    ["nazra", "ناظرہ"],
    ["getting started", "شروع کریں"],
    ["first letters and joining, at a calm pace.", "پہلے حروف اور جوڑ، نرم رفتار کے ساتھ۔"],
    ["read the quran with a live teacher.", "لائیو استاد کے ساتھ قرآن پڑھیں۔"],
    ["correct letters, madd, and makhraj.", "حروف، مد اور مخرج درست کریں۔"],
    ["memorization with a revision cycle.", "دورِ حفظ کے ساتھ یاد کرنا۔"],
    ["fluent recitation with a certified teacher.", "تصدیق شدہ استاد کے ساتھ رواں تلاوت۔"],
    ["core words so short surahs feel clearer.", "بنیادی الفاظ تاکہ چھوٹی سورتیں واضح لگیں۔"],
    ["meaning of selected passages, with a teacher.", "منتخب آیات کا مطلب، استاد کے ساتھ۔"],
    ["a light introduction to meaning — not a substitute for a scholar.", "معنی کا ہلکا تعارف — عالم کی جگہ نہیں۔"],
    ["aqeedah, seerah, and daily practice with a teacher.", "عقیدہ، سیرت اور روزمرہ عمل، استاد کے ساتھ۔"],
    ["prayer and everyday duas, taught live.", "نماز اور روزمرہ دعائیں، لائیو پڑھائی۔"],
    ["five tajweed habits that stick at home", "پانچ تجوید عادتیں جو گھر پر قائم رہیں"],
    ["how kids learn quran online without losing focus", "بچے آن لائن قرآن کیسے سیکھیں بغیر توجہ کھوئے"],
    ["teacher spotlight: ustadha amina", "استادہ آمنہ: تعارف"],
    ["what to expect in your first live class", "پہلی لائیو کلاس میں کیا توقع رکھیں"],
    ["a gentle pace for hifz that lasts", "حفظ کی نرم رفتار جو قائم رہے"],
    ["starting quran as an adult learner", "بالغ کی حیثیت سے قرآن کا آغاز"],
    ["short, kind routines that help children keep makharij without turning practice into a battle.", "مختصر اور نرم معمول جن سے بچے مخرج قائم رکھیں، مشق جھگڑا نہ بنے۔"],
    ["class length, screen breaks, and what parents can sit nearby to do — and not do.", "کلاس کی لمبائی، اسکرین وقفے، اور والدین قریب بیٹھ کر کیا کریں — اور کیا نہ کریں۔"],
    ["ijazah in hafs, ten years with young reciters, and a calm classroom style.", "حفص میں اجازہ، دس سال چھوٹے قاریوں کے ساتھ، اور پرسکون کلاس کا انداز۔"],
    ["placement chat, mushaf on screen, and how we pace the very first session.", "سطح کی گفتگو، اسکرین پر مصحف، اور پہلی نشست کی رفتار۔"],
    ["why revision days matter more than new pages in the first year.", "پہلے سال نئے صفحات سے زیادہ دور کا دن کیوں اہم ہے۔"],
    ["you are not behind. a simple path from alphabet to confident recitation.", "آپ پیچھے نہیں۔ حروف تہجی سے پراعتماد تلاوت تک سیدھا راستہ۔"],
    ["this is a sample article for the academy journal. it is not a fatwa and not a substitute for a teacher.", "یہ اکیڈمی جرنل کا نمونہ مضمون ہے۔ فتویٰ نہیں اور استاد کا متبادل نہیں۔"],
    ["keep sessions short and sit nearby without coaching over the teacher.", "نشستیں مختصر رکھیں اور استاد کے اوپر کوچ کیے بغیر قریب بیٹھیں۔"],
    ["ustadha amina teaches kids tajweed live, with patient correction.", "استادہ آمنہ بچوں کو لائیو تجوید پڑھاتی ہیں، صبر سے اصلاح کے ساتھ۔"],
    ["arrive five minutes early with a quran nearby.", "پانچ منٹ پہلے پہنچیں، قرآن قریب رکھیں۔"],
    ["revision keeps earlier pages strong.", "دور پہلے صفحات کو مضبوط رکھتا ہے۔"],
    ["adult beginners are welcome in nazra and tajweed.", "بالغ مبتدی ناظرہ اور تجوید میں خوش آمدید ہیں۔"],
  ].map(([en, ur]) => [norm(en), ur])
);

function norm(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function leftoverEnglish(text) {
  const stripped = String(text || "")
    .replace(/\bhttps?:\/\/\S+/gi, "")
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, "");
  return LATIN_WORD.test(stripped);
}

export function isMixedText(text) {
  const value = String(text || "");
  return HAS_URDU.test(value) && leftoverEnglish(value);
}

function exactMatch(text) {
  return EXACT.get(norm(text)) || "";
}

function wholeDuration(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";
  if (/^flexible$/i.test(raw)) return "لچکدار";
  let out = raw
    .replace(/^(\d+)\s*(?:minutes?|mins?|min)$/i, "$1 منٹ")
    .replace(/^(\d+)\s*(?:–|-|to)\s*(\d+)\s*(?:minutes?|mins?|min)$/i, "$1–$2 منٹ")
    .replace(/^(\d+)\s*(?:months?|month)$/i, "$1 مہینے")
    .replace(/^(\d+)\s*(?:years?|year)$/i, "$1 سال")
    .replace(/^(\d+)\s*(?:weeks?|week)$/i, "$1 ہفتے")
    .replace(/^(\d+)\s*(?:hours?|hrs?|hour)$/i, "$1 گھنٹے")
    .replace(/^(\d+)\s*times\s*a\s*week$/i, "ہفتے میں $1 بار")
    .replace(/^(\d+)\s*days?\s*a\s*week$/i, "ہفتے میں $1 دن");
  if (out !== raw && !leftoverEnglish(out)) return out;
  return "";
}

function splitChunks(text, max = 900) {
  const src = String(text || "").trim();
  if (src.length <= max) return [src];
  const parts = src.split(/(\n+|(?<=[.!?۔])\s+)/);
  const chunks = [];
  let buf = "";
  for (const part of parts) {
    if ((buf + part).length > max && buf) {
      chunks.push(buf.trim());
      buf = part;
    } else {
      buf += part;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks.filter(Boolean);
}

async function fetchJson(url, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 QuranAcademy" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function googleUrdu(text) {
  const chunks = splitChunks(text, 900);
  const out = [];
  for (const chunk of chunks) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ur&dt=t&q=${encodeURIComponent(chunk)}`;
    const data = await fetchJson(url, 7000);
    const translated = Array.isArray(data?.[0]) ? data[0].map((row) => row?.[0] || "").join("") : "";
    if (!translated.trim()) return "";
    out.push(translated.trim());
  }
  return out.join(" ").trim();
}

async function mymemoryUrdu(text) {
  const chunks = splitChunks(text, 450);
  const out = [];
  for (const chunk of chunks) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|ur`;
    const data = await fetchJson(url, 5000);
    const translated = String(data?.responseData?.translatedText || "").trim();
    if (!translated || /MYMEMORY|INVALID|QUERY LENGTH/i.test(translated)) return "";
    out.push(translated);
  }
  return out.join(" ").trim();
}

const TERM_FIX = [
  [/Noorani Qaida/gi, "نورانی قاعدہ"],
  [/Tajweed-ul-Quran/gi, "تجوید القرآن"],
  [/Hifz-ul-Quran/gi, "حفظ القرآن"],
  [/Qur['’]?an/gi, "قرآن"],
  [/Tajweed/gi, "تجوید"],
  [/Tafseer/gi, "تفسیر"],
  [/Makharij/gi, "مخارج"],
  [/Makhraj/gi, "مخرج"],
  [/Nazra/gi, "ناظرہ"],
  [/Hifz/gi, "حفظ"],
  [/Salah/gi, "نماز"],
  [/Duas/gi, "دعائیں"],
  [/Dua\b/gi, "دعا"],
  [/Seerah/gi, "سیرت"],
  [/Aqeedah/gi, "عقیدہ"],
  [/Ijazah/gi, "اجازہ"],
  [/Mushaf/gi, "مصحف"],
  [/Surahs/gi, "سورتیں"],
  [/Surah/gi, "سورہ"],
  [/Ayahs/gi, "آیات"],
  [/Ayah/gi, "آیت"],
  [/Hafs/gi, "حفص"],
  [/WhatsApp/gi, "واٹس ایپ"],
  [/online/gi, "آن لائن"],
  [/live/gi, "لائیو"],
];

function polishUrdu(text) {
  let out = String(text || "").trim();
  if (!out || !HAS_URDU.test(out)) return out;
  for (const [from, to] of TERM_FIX) out = out.replace(from, to);
  return out
    .replace(/\b(\d+)\s*(?:minutes?|mins?|min)\b/gi, "$1 منٹ")
    .replace(/\b(\d+)\s*(?:months?|month)\b/gi, "$1 مہینے")
    .replace(/\b(\d+)\s*(?:years?|year)\b/gi, "$1 سال")
    .replace(/\s+/g, " ")
    .trim();
}

export async function toUrdu(text) {
  const src = String(text || "").trim();
  if (!src) return "";
  if (HAS_URDU.test(src) && !leftoverEnglish(src)) return src;
  const exact = exactMatch(src);
  if (exact) return exact;
  const duration = wholeDuration(src);
  if (duration) return duration;
  const google = polishUrdu(await googleUrdu(src));
  if (google && HAS_URDU.test(google) && !isMixedText(google)) return google;
  const memory = polishUrdu(await mymemoryUrdu(src));
  if (memory && HAS_URDU.test(memory) && !isMixedText(memory)) return memory;
  return "";
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
  const pairs = [];
  for (const [key, value] of entries) {
    pairs.push([key, await toUrdu(value)]);
  }
  const out = {};
  for (const [key, value] of pairs) {
    if (value && !isMixedText(value)) out[key] = value;
  }
  return out;
}

export function localeNeedsRefresh(locale, source) {
  const keys = Object.keys(source || {});
  if (!keys.length) return false;
  if (!locale || !Object.keys(locale).length) return true;
  return keys.some((key) => {
    const en = String(source[key] || "").trim();
    if (!en) return false;
    const ur = String(locale[key] || "").trim();
    if (!ur) return true;
    return isMixedText(ur) || leftoverEnglish(ur);
  });
}

export function courseSource(row) {
  return pick(row, COURSE_KEYS);
}

export function blogSource(row) {
  return pick(row, BLOG_KEYS);
}

export { COURSE_KEYS, BLOG_KEYS };
