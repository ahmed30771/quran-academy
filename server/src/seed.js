import bcrypt from "bcryptjs";
import { pool, query, queryOne } from "./db.js";

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

async function seed() {
  const hash = await bcrypt.hash("password123", 12);
  await query(
    `INSERT INTO users (role, name, email, password_hash, bio, status) VALUES
      ('student','Fatima Khan','fatima@quranacademy.example',$1,'Student on Tajweed for Kids.','active'),
      ('teacher','Ustadha Amina','amina@quranacademy.example',$1,'Ijazah in Hafs. Kids Tajweed.','active'),
      ('teacher','Qari Yusuf','yusuf@quranacademy.example',$1,'Hifz track for adults.','active'),
      ('teacher','Qari Hassan','hassan@quranacademy.example',$1,'Hifz · Adults.','active'),
      ('admin','Academy Admin','admin@quranacademy.example',$1,'Academy staff.','active')
     ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, status=EXCLUDED.status, bio=EXCLUDED.bio, password_hash=EXCLUDED.password_hash`,
    [hash]
  );

  const seeded = await queryOne("SELECT key FROM settings WHERE key='demo_catalog'");
  if (!seeded) {
    for (const c of catalog) {
      await query(
        `INSERT INTO courses (
           id, slug, title, category, audiences, levels, track, level, duration, length, price_usd, blurb, full_blurb, icon, sort_order, status, image_url
         ) VALUES ($1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11,$12,$13,'active', NULL)
         ON CONFLICT (id) DO NOTHING`,
        c
      );
    }
    for (const p of posts) {
      await query(
        `INSERT INTO blog_posts (id,title,date_label,tag,excerpt,body) VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO NOTHING`,
        p
      );
    }
    await query("INSERT INTO settings (key, value) VALUES ('demo_catalog', '{\"ok\":true}'::jsonb) ON CONFLICT DO NOTHING");
  }

  await query("UPDATE courses SET status='inactive' WHERE id IN ('tajweed-kids','tajweed-adv','family')");

  const amina = await queryOne("SELECT id FROM users WHERE email='amina@quranacademy.example'");
  const yusuf = await queryOne("SELECT id FROM users WHERE email='yusuf@quranacademy.example'");
  if (amina) {
    await query("UPDATE users SET gender='female', teaching_languages='both', teach_kids=TRUE, teach_adults=TRUE WHERE id=$1", [amina.id]);
    for (const courseId of ["tajweed-ul-quran", "nazra", "noorani-qaida"]) {
      const course = await queryOne("SELECT id FROM courses WHERE id=$1", [courseId]);
      if (!course) continue;
      await query(
        `INSERT INTO teacher_courses (teacher_id, course_id, status) VALUES ($1,$2,'approved')
         ON CONFLICT (teacher_id, course_id) DO UPDATE SET status='approved'`,
        [amina.id, courseId]
      );
    }
  }
  if (yusuf) {
    await query("UPDATE users SET gender='male', teaching_languages='urdu', teach_kids=FALSE, teach_adults=TRUE WHERE id=$1", [yusuf.id]);
    const hifz = await queryOne("SELECT id FROM courses WHERE id='hifz'");
    if (hifz) {
      await query(
        `INSERT INTO teacher_courses (teacher_id, course_id, status) VALUES ($1,'hifz','approved')
         ON CONFLICT (teacher_id, course_id) DO UPDATE SET status='approved'`,
        [yusuf.id]
      );
    }
  }


  await query("DELETE FROM reviews");
  await query(
    `INSERT INTO reviews (name,country,stars,text) VALUES
      ('Fatima K.','United Kingdom',5,'My daughter looks forward to class. The teacher is patient and the Tajweed corrections are clear.'),
      ('Omar S.','Canada',5,'I started as an adult with almost no recitation. Six months later I can read short surahs with confidence.'),
      ('Ayesha R.','Pakistan',5,'Flexible timing around school. The free trial made it easy to see if the teacher was a good match.'),
      ('Yusuf M.','United States',4,'Hifz track is structured without feeling rushed. Weekly revision saved my son''s earlier pages.'),
      ('Layla H.','UAE',5,'Certified teachers, calm design, and WhatsApp support when we needed to reschedule.'),
      ('Ibrahim N.','Germany',5,'Small group for my twins worked well. They stay engaged and we see notes after each lesson.')`
  );

  const fatima = await queryOne("SELECT id FROM users WHERE email='fatima@quranacademy.example'");
  const admin = await queryOne("SELECT id FROM users WHERE email='admin@quranacademy.example'");
  if (fatima) {
    await query("UPDATE users SET gender='female' WHERE id=$1", [fatima.id]);
    const enrollCourse = await queryOne("SELECT id FROM courses WHERE id='tajweed-kids'");
    if (enrollCourse) {
      await query(
        `INSERT INTO enrollments (user_id, course_id, plan, status)
         VALUES ($1, 'tajweed-kids', 'standard', 'active')
         ON CONFLICT (user_id, course_id) DO NOTHING`,
        [fatima.id]
      );
    }

    await query("DELETE FROM classes WHERE student_id=$1", [fatima.id]);
    const classCourses = await query("SELECT id FROM courses WHERE id = ANY($1)", [["tajweed-kids", "hifz", "nazra"]]);
    const have = new Set(classCourses.map((row) => row.id));
    if (amina && have.size) {
      const rows = [
        have.has("tajweed-kids") ? ["tajweed-kids", "Mon", "16:00"] : null,
        have.has("hifz") ? ["hifz", "Wed", "16:00"] : null,
        have.has("nazra") ? ["nazra", "Sat", "11:00"] : null,
      ].filter(Boolean);
      for (const [courseId, day, time] of rows) {
        await query(
          "INSERT INTO classes (course_id, teacher_id, student_id, day_label, time_label) VALUES ($1,$2,$3,$4,$5)",
          [courseId, amina.id, fatima.id, day, time]
        );
      }
    }
  }

  await query("DELETE FROM homework WHERE student_id=$1", [fatima.id]);
  await query(
    `INSERT INTO homework (teacher_id, student_id, task, due_label) VALUES
      ($1, $2, 'Repeat Surah Al-Fatiha slowly, three times', 'Due Mon'),
      ($1, $2, 'Practice qaf vs kaf with the worksheet audio', 'Due Wed'),
      ($1, $2, 'Revise last four ayahs of Al-Ikhlas', 'Due Sat')`,
    [amina.id, fatima.id]
  );

  await query("DELETE FROM notifications WHERE user_id = ANY($1)", [[fatima.id, amina.id, admin.id]]);
  await query(
    `INSERT INTO notifications (user_id, text) VALUES
      ($1, 'Your Tajweed class starts in 20 minutes.'),
      ($1, 'Homework is due Wednesday.'),
      ($1, 'Ustadha Amina left a note after class.'),
      ($2, 'Fatima submitted today’s homework.'),
      ($2, 'New trial student assigned to you.'),
      ($2, 'Your 16:40 class starts soon.'),
      ($3, 'New enrollment waiting for review.'),
      ($3, 'Teacher applicant: Qari Hassan.'),
      ($3, 'Contact message from Ayesha R.')`,
    [fatima.id, amina.id, admin.id]
  );

  console.log("Seed complete.");
  console.log("Logins (password: password123):");
  console.log("  student  fatima@quranacademy.example");
  console.log("  teacher  amina@quranacademy.example");
  console.log("  admin    admin@quranacademy.example");
  await pool.end();
}

seed().catch(async (err) => {
  console.error(err);
  await pool.end().catch(() => {});
  process.exit(1);
});
