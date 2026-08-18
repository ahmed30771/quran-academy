import { query } from "./db.js";
import {
  blogSource,
  courseSource,
  isMixedText,
  leftoverEnglish,
  localeNeedsRefresh,
  translateFields,
} from "./translate.js";

function parseLocale(value) {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value) || {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" ? value : {};
}

function cleanLocale(locale) {
  const out = {};
  for (const [key, value] of Object.entries(locale || {})) {
    const text = String(value || "").trim();
    if (text && !isMixedText(text) && !leftoverEnglish(text)) out[key] = text;
  }
  return out;
}

async function persistLocale(table, id, locale_ur) {
  if (!id || !locale_ur || !Object.keys(locale_ur).length) return;
  await query(`UPDATE ${table} SET locale_ur=$1 WHERE id=$2`, [locale_ur, id]);
}

async function fillLocale(table, row, source) {
  if (!row?.id) return row;
  const current = cleanLocale(parseLocale(row.locale_ur));
  if (!localeNeedsRefresh(current, source)) return { ...row, locale_ur: current };
  const next = await translateFields(source);
  const locale_ur = cleanLocale({ ...current, ...next });
  await persistLocale(table, row.id, locale_ur).catch(() => {});
  return { ...row, locale_ur };
}

export function saveCourseLocale(row) {
  return fillLocale("courses", row, courseSource(row));
}

export function saveBlogLocale(row) {
  return fillLocale("blog_posts", row, blogSource(row));
}

export function ensureCourseLocale(row) {
  return fillLocale("courses", row, courseSource(row));
}

export function ensureBlogLocale(row) {
  return fillLocale("blog_posts", row, blogSource(row));
}
