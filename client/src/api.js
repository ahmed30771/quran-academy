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
  try {
    const headers = { ...(opts.headers || {}) };
    const hasBody = opts.body !== undefined && opts.body !== null;
    if (hasBody && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    const res = await fetch(path, {
      credentials: "include",
      ...opts,
      headers,
      body: hasBody && typeof opts.body !== "string" ? JSON.stringify(opts.body) : opts.body,
    });
    const text = await res.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = {};
      }
    }
    if (!res.ok) throw new Error(data.error || data.message || `Request failed (${res.status})`);
    return data;
  } catch (err) {
    if (err instanceof TypeError) throw new Error("Could not reach the server.");
    throw err;
  }
}
