import express from "express";
import { query, queryOne } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = express.Router();

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

router.get("/me", authRequired, async (req, res) => {
  res.json(
    await query(
      "SELECT id, text, is_read, created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20",
      [req.user.id]
    )
  );
});

router.post("/read", authRequired, async (req, res) => {
  await query("UPDATE notifications SET is_read=TRUE WHERE user_id=$1", [req.user.id]);
  res.json({ ok: true });
});

router.get("/student", authRequired, requireRole("student"), async (req, res) => {
  const user = await queryOne("SELECT id, name FROM users WHERE id=$1", [req.user.id]);
  const classes = await query(
    `SELECT c.day_label, c.time_label, co.title AS course, u.name AS teacher
     FROM classes c JOIN courses co ON co.id=c.course_id JOIN users u ON u.id=c.teacher_id
     WHERE c.student_id=$1`,
    [req.user.id]
  );
  const homework = await query(
    "SELECT id, task, due_label, status FROM homework WHERE student_id=$1 ORDER BY id",
    [req.user.id]
  );
  const enrollments = await query(
    `SELECT e.*, co.title, t.name AS teacher_name, t.id AS teacher_id
     FROM enrollments e
     JOIN courses co ON co.id=e.course_id
     LEFT JOIN users t ON t.id=e.teacher_id
     WHERE e.user_id=$1`,
    [req.user.id]
  );
  const trials = await query(
    `SELECT ct.course_id, ct.starts_at, ct.ends_at, co.title
     FROM course_trials ct JOIN courses co ON co.id=ct.course_id
     WHERE ct.user_id=$1
     ORDER BY ct.starts_at DESC`,
    [req.user.id]
  );
  const completedHomework = homework.filter((item) => item.status === "done").length;
  const totalLessons = Math.max(20, classes.length * 6 + homework.length * 2);
  const lessonsDone = Math.max(1, classes.length * 4 + completedHomework + 4);
  const progressPercent = clamp(Math.round((lessonsDone / totalLessons) * 100), 8, 96);
  const tajweedPercent = clamp(50 + classes.length * 7, 35, 96);
  const memorizationPercent = clamp(30 + homework.length * 8 + completedHomework * 6, 20, 96);
  const attendancePercent = clamp(65 + classes.length * 8, 35, 99);
  const nextClass = classes[0] || null;
  const activeCourse = enrollments[0]?.title || nextClass?.course || "No active course yet";
  res.json({
    user,
    classes,
    homework,
    enrollments,
    trials,
    trial: trials[0] || null,
    stats: {
      activeCourse,
      nextClassText: nextClass
        ? `${nextClass.course} with ${nextClass.teacher} · ${nextClass.day_label} ${nextClass.time_label}`
        : "Choose a course to generate your first timetable.",
      certificateText:
        completedHomework > 0
          ? `You have completed ${completedHomework} homework task${completedHomework === 1 ? "" : "s"} and are building steady progress.`
          : "Complete a few lessons and homework tasks to unlock a certificate preview.",
      lessonsDone,
      totalLessons,
      progressPercent,
      tajweedPercent,
      memorizationPercent,
      attendancePercent,
      tajweedText: nextClass ? `Focused on ${nextClass.course.toLowerCase()} with guided correction.` : "Your pronunciation goals will appear after enrollment.",
      memorizationText:
        homework[0]?.task || "Assigned revision and hifz tasks will appear here once your teacher adds them.",
      attendanceText: classes.length ? `${classes.length} live class${classes.length === 1 ? "" : "es"} scheduled for your current plan.` : "No live classes scheduled yet.",
    },
  });
});

router.get("/teacher", authRequired, requireRole("teacher"), async (req, res) => {
  const user = await queryOne("SELECT id, name FROM users WHERE id=$1", [req.user.id]);
  const classes = await query(
    `SELECT c.id, c.day_label, c.time_label, co.title AS course, u.name AS student
     FROM classes c JOIN courses co ON co.id=c.course_id LEFT JOIN users u ON u.id=c.student_id
     WHERE c.teacher_id=$1`,
    [req.user.id]
  );
  const students = await query(
    `SELECT DISTINCT u.id, u.name, u.email, co.title AS course
     FROM classes c JOIN users u ON u.id=c.student_id JOIN courses co ON co.id=c.course_id
     WHERE c.teacher_id=$1`,
    [req.user.id]
  );
  const homework = await query(
    `SELECT h.id, h.task, h.due_label, u.name AS student FROM homework h JOIN users u ON u.id=h.student_id
     WHERE h.teacher_id=$1 ORDER BY h.id DESC`,
    [req.user.id]
  );
  const totalHours = classes.length * 0.75;
  res.json({
    user,
    classes,
    students,
    homework,
    stats: {
      classesToday: classes.length,
      activeStudents: students.length,
      hoursWeek: totalHours.toFixed(1),
      earningsUsd: students.length * 24 + classes.length * 18,
      nextClassText: classes[0]
        ? `${classes[0].course} with ${classes[0].student || "unassigned student"} at ${classes[0].time_label}`
        : "No class is scheduled yet.",
    },
  });
});

router.post("/homework", authRequired, requireRole("teacher"), async (req, res) => {
  const { studentId, task, dueLabel } = req.body || {};
  if (!studentId || !task) return res.status(400).json({ error: "Student and task are required." });
  await queryOne(
    "INSERT INTO homework (teacher_id, student_id, task, due_label) VALUES ($1,$2,$3,$4) RETURNING id",
    [req.user.id, studentId, task, dueLabel || "Due soon"]
  );
  await queryOne("INSERT INTO notifications (user_id, text) VALUES ($1,$2) RETURNING id", [
    studentId,
    "New homework was assigned.",
  ]);
  res.json({ ok: true });
});

router.get("/admin", authRequired, requireRole("admin"), async (_req, res) => {
  const user = await queryOne("SELECT id, name FROM users WHERE role='admin' LIMIT 1");
  const students = await queryOne("SELECT COUNT(*)::int AS n FROM users WHERE role='student'");
  const teachers = await queryOne("SELECT COUNT(*)::int AS n FROM users WHERE role='teacher'");
  const classes = await queryOne("SELECT COUNT(*)::int AS n FROM classes");
  const enrollments = await query(
    `SELECT e.id, e.plan, e.status, e.created_at, u.name AS student, co.title AS course, t.name AS teacher
     FROM enrollments e
     JOIN users u ON u.id=e.user_id
     JOIN courses co ON co.id=e.course_id
     LEFT JOIN users t ON t.id=e.teacher_id
     ORDER BY e.created_at DESC LIMIT 20`
  );
  const inbox = await query("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 10");
  const pendingTeachers = await query(
    `SELECT id, name, email, gender, teaching_languages, teach_kids, teach_adults, created_at
     FROM users WHERE role='teacher' AND status='pending'`
  );
  const teacherCourseRequests = await query(
    `SELECT tc.id, tc.status, tc.teacher_id, tc.course_id, u.name AS teacher, u.email, u.gender, u.teaching_languages,
            u.teach_kids, u.teach_adults, co.title AS course, co.slug
     FROM teacher_courses tc
     JOIN users u ON u.id=tc.teacher_id
     JOIN courses co ON co.id=tc.course_id
     ORDER BY tc.created_at DESC`
  );
  const posts = await query("SELECT id, title, date_label FROM blog_posts");
  res.json({
    user,
    kpi: { students: students.n, teachers: teachers.n, classes: classes.n },
    enrollments,
    inbox,
    pendingTeachers,
    teacherCourseRequests,
    posts,
    stats: {
      inboxCount: inbox.length,
      pendingTeacherCount: pendingTeachers.length,
      latestEnrollment: enrollments[0] || null,
    },
  });
});

router.post("/admin/teachers/:id/approve", authRequired, requireRole("admin"), async (req, res) => {
  const yes = req.body?.approve !== false;
  await query("UPDATE users SET status=$1 WHERE id=$2 AND role='teacher'", [yes ? "active" : "declined", req.params.id]);
  res.json({ ok: true });
});

router.post("/admin/teacher-courses/:id", authRequired, requireRole("admin"), async (req, res) => {
  const status = req.body?.status;
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ error: "Status must be approved, rejected, or pending." });
  }
  const row = await queryOne(
    "UPDATE teacher_courses SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
    [status, req.params.id]
  );
  if (!row) return res.status(404).json({ error: "Request not found." });
  res.json(row);
});

router.put("/admin/teachers/:id/teaching", authRequired, requireRole("admin"), async (req, res) => {
  const languages = ["urdu", "english", "both", ""].includes(req.body?.teachingLanguages) ? req.body.teachingLanguages : "";
  const row = await queryOne(
    `UPDATE users SET teaching_languages=$1, teach_kids=$2, teach_adults=$3, updated_at=NOW()
     WHERE id=$4 AND role='teacher' RETURNING id, name, teaching_languages, teach_kids, teach_adults`,
    [languages || null, !!req.body?.teachKids, !!req.body?.teachAdults, req.params.id]
  );
  if (!row) return res.status(404).json({ error: "Teacher not found." });
  res.json(row);
});

export default router;
