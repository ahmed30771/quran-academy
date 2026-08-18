import { query, queryOne } from "./db.js";
import { ensureAdminAccounts } from "./admins.js";

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

const posts = [
  ["tajweed-home", "Five Tajweed habits that stick at home", "12 Aug 2026", "Tajweed", "Short, kind routines that help children keep makharij without turning practice into a battle.", "This is a sample article for the academy journal. It is not a fatwa and not a substitute for a teacher."],
  ["kids-focus", "How kids learn Quran online without losing focus", "4 Aug 2026", "Kids", "Class length, screen breaks, and what parents can sit nearby to do — and not do.", "Keep sessions short and sit nearby without coaching over the teacher."],
  ["teacher-amina", "Teacher spotlight: Ustadha Amina", "28 Jul 2026", "Teachers", "Ijazah in Hafs, ten years with young reciters, and a calm classroom style.", "Ustadha Amina teaches kids Tajweed live, with patient correction."],
  ["first-class", "What to expect in your first live class", "18 Jul 2026", "Getting started", "Placement chat, mushaf on screen, and how we pace the very first session.", "Arrive five minutes early with a Quran nearby."],
  ["hifz-pace", "A gentle pace for hifz that lasts", "2 Jul 2026", "Hifz", "Why revision days matter more than new pages in the first year.", "Revision keeps earlier pages strong."],
  ["adults-start", "Starting Quran as an adult learner", "20 Jun 2026", "Adults", "You are not behind. A simple path from alphabet to confident recitation.", "Adult beginners are welcome in Nazra and Tajweed."],
];

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
  await query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS locale_ur JSONB");
  await query("ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_url TEXT");
  await query("ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS locale_ur JSONB");
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
  await query(`
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(120) PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const seeded = await queryOne("SELECT key FROM settings WHERE key='demo_catalog'");
  if (!seeded) {
    const courseCount = await queryOne("SELECT COUNT(*)::int AS n FROM courses");
    if (!courseCount?.n) {
      for (const c of catalog) {
        await query(
          `INSERT INTO courses (
             id, slug, title, category, audiences, levels, track, level, duration, length, price_usd, blurb, full_blurb, icon, sort_order, status
           ) VALUES ($1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11,$12,$13,'active')
           ON CONFLICT (id) DO NOTHING`,
          c
        );
      }
    }
    const postCount = await queryOne("SELECT COUNT(*)::int AS n FROM blog_posts");
    if (!postCount?.n) {
      for (const p of posts) {
        await query(
          `INSERT INTO blog_posts (id,title,date_label,tag,excerpt,body) VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (id) DO NOTHING`,
          p
        );
      }
    }
    await query("INSERT INTO settings (key, value) VALUES ('demo_catalog', '{\"ok\":true}'::jsonb) ON CONFLICT DO NOTHING");
  }

  await ensureAdminAccounts();
}

let ready;
export function ensureCourseSchemaOnce() {
  if (!ready) ready = ensureCourseSchema().catch((err) => {
    console.error(err);
    ready = null;
  });
  return ready;
}
