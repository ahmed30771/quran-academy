export const SITE = {
  WHATSAPP: "https://wa.me/923092547332",
  EMAIL: "support@bluexech.com",
  LINKEDIN: "https://www.linkedin.com/company/bluexech-ai",
  INSTAGRAM: "https://www.instagram.com/bluexech_ai/",
  FACEBOOK: "https://www.facebook.com/people/Bluexech-AI/61586923501415/",
  PHONE: "+92 309 2547332",
  USD_TO_PKR: 280,
};

export function formatMoney(usd, currency) {
  const n = Number(usd) || 0;
  if (currency === "usd") return "$" + n;
  return "Rs " + Math.round(n * SITE.USD_TO_PKR).toLocaleString("en-PK");
}

export async function api(path, opts = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
    body: opts.body && typeof opts.body !== "string" ? JSON.stringify(opts.body) : opts.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
