import { query } from "./db.js";
import {
  BLOG_KEYS,
  COURSE_KEYS,
  blogSource,
  courseSource,
  localeFromGlossary,
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

export async function saveCourseLocale(row) {
  if (!row?.id) return row;
  try {
    const locale_ur = await translateFields(courseSource(row));
    await query("UPDATE courses SET locale_ur=$1 WHERE id=$2", [locale_ur, row.id]);
    return { ...row, locale_ur };
  } catch {
    return row;
  }
}

export async function saveBlogLocale(row) {
  if (!row?.id) return row;
  try {
    const locale_ur = await translateFields(blogSource(row));
    await query("UPDATE blog_posts SET locale_ur=$1 WHERE id=$2", [locale_ur, row.id]);
    return { ...row, locale_ur };
  } catch {
    return row;
  }
}

export async function ensureCourseLocale(row) {
  if (!row) return row;
  const current = parseLocale(row.locale_ur);
  if (Object.keys(current).length) return { ...row, locale_ur: current };
  const locale_ur = localeFromGlossary(row, COURSE_KEYS);
  if (Object.keys(locale_ur).length) {
    await query("UPDATE courses SET locale_ur=$1 WHERE id=$2", [locale_ur, row.id]).catch(() => {});
  }
  return { ...row, locale_ur };
}

export async function ensureBlogLocale(row) {
  if (!row) return row;
  const current = parseLocale(row.locale_ur);
  if (Object.keys(current).length) return { ...row, locale_ur: current };
  const locale_ur = localeFromGlossary(row, BLOG_KEYS);
  if (Object.keys(locale_ur).length) {
    await query("UPDATE blog_posts SET locale_ur=$1 WHERE id=$2", [locale_ur, row.id]).catch(() => {});
  }
  return { ...row, locale_ur };
}
