const AUDIENCES = ["kids", "adults"];
const LEVELS = ["beginner", "intermediate", "advanced"];
const CATEGORIES = ["tajweed", "hifz", "recitation", "arabic"];
const STATUSES = ["active", "inactive"];

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function asList(value, allowed) {
  let list = [];
  if (Array.isArray(value)) {
    list = value;
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      list = trimmed
        .slice(1, -1)
        .split(",")
        .map((item) => item.replace(/^"+|"+$/g, "").trim())
        .filter(Boolean);
    } else if (trimmed) {
      list = [trimmed];
    }
  }
  return [...new Set(list.map((item) => String(item).toLowerCase()).filter((item) => allowed.includes(item)))];
}

function asText(value, fallback = "") {
  if (value == null) return fallback;
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

export function coursePayload(body = {}) {
  const title = String(body.title || "").trim();
  const slug = slugify(body.slug || title) || slugify(`course-${Date.now()}`);
  const audiences = asList(body.audiences, AUDIENCES);
  const levels = asList(body.levels, LEVELS);
  const duration = asText(body.duration, "Flexible").slice(0, 64);
  const length = asText(typeof body.length === "string" ? body.length : body.class_length, duration === "Flexible" ? "40 min" : duration).slice(0, 64);
  const price = Number(body.price_usd);
  return {
    title,
    slug,
    category: CATEGORIES.includes(body.category) ? body.category : "recitation",
    audiences: audiences.length ? audiences : ["kids"],
    levels: levels.length ? levels : ["beginner"],
    track: [audiences.join(" ") || "kids", CATEGORIES.includes(body.category) ? body.category : "recitation"].filter(Boolean).join(" ").slice(0, 120),
    level: asText(body.level, levels[0] || "beginner").slice(0, 64),
    duration,
    length,
    price_usd: Number.isFinite(price) ? Math.min(999999, Math.max(0, price)) : 0,
    blurb: asText(body.blurb),
    full_blurb: asText(body.full_blurb || body.description || body.blurb),
    icon: asText(body.icon, "ق").slice(0, 8),
    intro: asText(body.intro),
    description: asText(body.description),
    who_for: asText(body.who_for),
    learnings: asText(body.learnings),
    frequency: asText(body.frequency),
    requirements: asText(body.requirements),
    image_url: body.image_url ? String(body.image_url) : null,
    status: STATUSES.includes(body.status) ? body.status : "active",
    sort_order: Number(body.sort_order) || 0,
  };
}

export { AUDIENCES, LEVELS, CATEGORIES, STATUSES };
