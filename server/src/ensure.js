import { query } from "./db.js";

export async function ensureCourseSchema() {
  await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(16)");
  await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS teaching_languages VARCHAR(32)");
  await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS teach_kids BOOLEAN NOT NULL DEFAULT FALSE");
  await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS teach_adults BOOLEAN NOT NULL DEFAULT FALSE");
  await query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug VARCHAR(80)");
  await query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(64)");
  await query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS audiences TEXT[] NOT NULL DEFAULT '{}'");
  await query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS levels TEXT[] NOT NULL DEFAULT '{}'");
  await query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'active'");
  await query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS image_url TEXT");
  await query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS intro TEXT");
  await query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS description TEXT");
  await query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS who_for TEXT");
  await query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS learnings TEXT");
  await query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS frequency TEXT");
  await query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS requirements TEXT");
  await query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0");
  await query("UPDATE courses SET slug = id WHERE slug IS NULL OR slug = ''");
  await query("CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_idx ON courses (slug)");
  await query(`
    CREATE TABLE IF NOT EXISTS teacher_courses (
      id SERIAL PRIMARY KEY,
      teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (teacher_id, course_id)
    )
  `);

  const catalog = [
    ["noorani-qaida", "Noorani Qaida", "recitation", ["kids", "adults"], ["beginner"], "kids adults recitation", "Beginner", "Flexible", "30 min", 39, "First letters and joining, at a calm pace.", "ن", 1],
    ["nazra", "Quran Reading / Nazra", "recitation", ["kids", "adults"], ["beginner", "intermediate"], "kids adults recitation", "Beginner", "Flexible", "40 min", 49, "Read the Quran with a live teacher.", "ق", 2],
    ["tajweed-ul-quran", "Tajweed-ul-Quran", "tajweed", ["kids", "adults"], ["beginner", "intermediate", "advanced"], "kids adults tajweed", "Beginner", "Flexible", "40 min", 59, "Correct letters, madd, and makhraj.", "ت", 3],
    ["hifz", "Hifz-ul-Quran", "hifz", ["kids", "adults"], ["beginner", "intermediate", "advanced"], "kids adults hifz", "All levels", "Flexible", "45–60 min", 89, "Memorization with a revision cycle.", "ح", 4],
    ["quran-recitation", "Quran Recitation", "recitation", ["kids", "adults"], ["intermediate", "advanced"], "kids adults recitation", "Intermediate", "Flexible", "40 min", 55, "Fluent recitation with a certified teacher.", "ر", 5],
    ["arabic", "Arabic Basics", "arabic", ["kids", "adults"], ["beginner", "intermediate"], "kids adults arabic", "Beginner", "Flexible", "40 min", 45, "Core words so short surahs feel clearer.", "ع", 6],
    ["quran-translation", "Quran with Translation", "recitation", ["adults"], ["beginner", "intermediate"], "adults recitation", "Beginner", "Flexible", "45 min", 49, "Meaning of selected passages, with a teacher.", "م", 7],
    ["quran-tafseer", "Quran Tafseer", "recitation", ["adults"], ["intermediate", "advanced"], "adults recitation", "Intermediate", "Flexible", "45 min", 65, "A light introduction to meaning — not a substitute for a scholar.", "ف", 8],
    ["islamic-studies", "Islamic Studies", "recitation", ["kids", "adults"], ["beginner", "intermediate"], "kids adults recitation", "Beginner", "Flexible", "40 min", 42, "Aqeedah, seerah, and daily practice with a teacher.", "س", 9],
    ["salah-duas", "Salah & Daily Duas", "recitation", ["kids", "adults"], ["beginner"], "kids adults recitation", "Beginner", "Flexible", "30 min", 35, "Prayer and everyday duas, taught live.", "ص", 10],
  ];
  for (const c of catalog) {
    await query(
      `INSERT INTO courses (
         id, slug, title, category, audiences, levels, track, level, duration, length, price_usd, blurb, full_blurb, icon, sort_order, status
       ) VALUES ($1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11,$12,$13,'active')
       ON CONFLICT (id) DO UPDATE SET
         category=COALESCE(courses.category, EXCLUDED.category),
         audiences=CASE WHEN courses.audiences = '{}' THEN EXCLUDED.audiences ELSE courses.audiences END,
         levels=CASE WHEN courses.levels = '{}' THEN EXCLUDED.levels ELSE courses.levels END,
         slug=COALESCE(NULLIF(courses.slug,''), EXCLUDED.slug)`,
      c
    );
  }
}

let ready;
export function ensureCourseSchemaOnce() {
  if (!ready) ready = ensureCourseSchema().catch((err) => {
    console.error(err);
    ready = null;
  });
  return ready;
}
