import express from "express";
import { query, queryOne } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { ensureTeacherAccess, recordAudit } from "../middleware/ownership.js";
import { ensureTeacherLocale } from "../locale.js";

const router = express.Router();
const LANGS = ["urdu", "english", "both"];

function publicTeacher(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    bio: row.bio,
    gender: row.gender || "",
    teachingLanguages: row.teaching_languages || "",
    teachKids: !!row.teach_kids,
    teachAdults: !!row.teach_adults,
    qualifications: row.qualifications || "",
    experience: row.experience || "",
    introduction: row.introduction || "",
    rating: Number(row.rating) || 5,
    status: row.status,
    locale_ur: row.locale_ur || {},
  };
}

async function teacherCourses(teacherId, statuses = ["approved"]) {
  return query(
    `SELECT tc.id, tc.status, tc.course_id, co.title, co.slug, co.blurb, co.icon, co.category, co.locale_ur
     FROM teacher_courses tc
     JOIN courses co ON co.id=tc.course_id
     WHERE tc.teacher_id=$1 AND tc.status = ANY($2)
     ORDER BY co.sort_order, co.title`,
    [teacherId, statuses]
  );
}

router.get("/me", authRequired, async (req, res) => {
  if (req.user.role !== "teacher") return res.status(403).json({ error: "Teacher access only." });
  const teacher = await queryOne("SELECT * FROM users WHERE id=$1", [req.user.id]);
  const students = await query(
    `SELECT DISTINCT u.id, u.name, u.email, co.title AS course
     FROM classes c
     JOIN users u ON u.id=c.student_id
     JOIN courses co ON co.id=c.course_id
     WHERE c.teacher_id=$1`,
    [req.user.id]
  );
  const courses = await teacherCourses(req.user.id, ["pending", "approved", "rejected"]);
  res.json({ teacher: publicTeacher(teacher), students, courses });
});

router.get("/me/courses", authRequired, requireRole("teacher"), async (req, res) => {
  res.json(await teacherCourses(req.user.id, ["pending", "approved", "rejected"]));
});

router.post("/me/courses", authRequired, requireRole("teacher"), async (req, res) => {
  const ids = Array.isArray(req.body?.courseIds) ? req.body.courseIds : [];
  const unique = [...new Set(ids.map(String))];
  if (!unique.length) return res.status(400).json({ error: "Select at least one course." });
  for (const courseId of unique) {
    const course = await queryOne("SELECT id, status FROM courses WHERE id=$1 OR slug=$1", [courseId]);
    if (!course || course.status !== "active") continue;
    await query(
      `INSERT INTO teacher_courses (teacher_id, course_id, status)
       VALUES ($1,$2,'pending')
       ON CONFLICT (teacher_id, course_id) DO UPDATE SET
         status = CASE WHEN teacher_courses.status='approved' THEN teacher_courses.status ELSE 'pending' END,
         updated_at=NOW()`,
      [req.user.id, course.id]
    );
  }
  const admin = await queryOne("SELECT id FROM users WHERE role='admin' LIMIT 1");
  if (admin) {
    await query("INSERT INTO notifications (user_id, text) VALUES ($1,$2)", [
      admin.id,
      "A teacher updated teaching course requests.",
    ]);
  }
  res.json(await teacherCourses(req.user.id, ["pending", "approved", "rejected"]));
});

router.delete("/me/courses/:courseId", authRequired, requireRole("teacher"), async (req, res) => {
  const course = await queryOne("SELECT id FROM courses WHERE id=$1 OR slug=$1", [req.params.courseId]);
  if (!course) return res.status(404).json({ error: "Course not found." });
  await query("DELETE FROM teacher_courses WHERE teacher_id=$1 AND course_id=$2", [req.user.id, course.id]);
  res.json({ ok: true });
});

router.put("/me/teaching", authRequired, requireRole("teacher"), async (req, res) => {
  const languages = LANGS.includes(req.body?.teachingLanguages) ? req.body.teachingLanguages : "";
  const teachKids = !!req.body?.teachKids;
  const teachAdults = !!req.body?.teachAdults;
  const teacher = await queryOne(
    `UPDATE users SET teaching_languages=$1, teach_kids=$2, teach_adults=$3, updated_at=NOW()
     WHERE id=$4 AND role='teacher' RETURNING *`,
    [languages, teachKids, teachAdults, req.user.id]
  );
  res.json({ teacher: publicTeacher(teacher) });
});

router.get("/:id/courses", async (req, res) => {
  const teacher = await queryOne("SELECT id FROM users WHERE id=$1 AND role='teacher' AND status='active'", [req.params.id]);
  if (!teacher) return res.status(404).json({ error: "Teacher not found." });
  res.json(await teacherCourses(teacher.id, ["approved"]));
});

router.get("/:id/public", async (req, res) => {
  const teacher = await queryOne(
    `SELECT id, name, avatar, bio, gender, teaching_languages, teach_kids, teach_adults, qualifications, experience, introduction, locale_ur, status, COALESCE(rating, 5) AS rating
     FROM users WHERE id=$1 AND role='teacher' AND status='active'`,
    [req.params.id]
  );
  if (!teacher) return res.status(404).json({ error: "Teacher not found." });
  const localized = await ensureTeacherLocale(teacher);
  res.json({ teacher: publicTeacher(localized), courses: await teacherCourses(teacher.id, ["approved"]) });
});

router.get("/:id", authRequired, ensureTeacherAccess, async (req, res) => {
  const teacher = await queryOne(
    `SELECT id, name, email, phone_number, avatar, bio, qualifications, experience, subjects, available_times, introduction, role, status,
            gender, teaching_languages, teach_kids, teach_adults
     FROM users
     WHERE id=$1 AND role='teacher'`,
    [req.scopeTeacherId]
  );
  if (!teacher) return res.status(404).json({ error: "Teacher not found." });
  const classes = await query(
    `SELECT c.id, co.title AS class_name, c.day_label, c.time_label, c.status, c.meeting_link, s.name AS student_name
     FROM classes c
     JOIN courses co ON co.id=c.course_id
     LEFT JOIN users s ON s.id=c.student_id
     WHERE c.teacher_id=$1
     ORDER BY c.id DESC`,
    [req.scopeTeacherId]
  );
  res.json({ teacher, classes, courses: await teacherCourses(req.scopeTeacherId, ["pending", "approved", "rejected"]) });
});

export default router;
export { publicTeacher, teacherCourses, LANGS };
