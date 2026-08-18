import express from "express";
import { query, queryOne } from "../db.js";
import { authRequired } from "../middleware/auth.js";
import { ensureStudentAccess } from "../middleware/ownership.js";

const router = express.Router();

router.get("/me", authRequired, async (req, res) => {
  if (req.user.role !== "student") return res.status(403).json({ error: "Student access only." });
  const student = await queryOne("SELECT * FROM users WHERE id=$1", [req.user.id]);
  const teacher = await queryOne(
    `SELECT u.id, u.name, u.email, u.avatar, u.qualifications, u.introduction, c.day_label, c.time_label
     FROM classes c
     JOIN users u ON u.id=c.teacher_id
     WHERE c.student_id=$1
     ORDER BY c.id
     LIMIT 1`,
    [req.user.id]
  );
  const classes = await query(
    `SELECT c.id, co.title AS class_name, c.day_label, c.time_label, c.status, c.meeting_link, u.name AS teacher_name
     FROM classes c
     JOIN courses co ON co.id=c.course_id
     JOIN users u ON u.id=c.teacher_id
     WHERE c.student_id=$1
     ORDER BY c.id DESC`,
    [req.user.id]
  );
  res.json({ student, teacher, classes });
});

router.get("/:id", authRequired, ensureStudentAccess, async (req, res) => {
  const student = await queryOne(
    "SELECT id, name, email, phone_number, date_of_birth, preferred_language, timezone, avatar, bio, role, status FROM users WHERE id=$1 AND role='student'",
    [req.scopeStudentId]
  );
  if (!student) return res.status(404).json({ error: "Student not found." });
  const progress = await queryOne("SELECT * FROM student_progress WHERE student_id=$1", [req.scopeStudentId]);
  const attendance = await query(
    "SELECT class_date, status, notes FROM attendance WHERE student_id=$1 ORDER BY class_date DESC LIMIT 30",
    [req.scopeStudentId]
  );
  const assignments = await query(
    "SELECT id, task, due_label, feedback, marks, submission_status FROM homework WHERE student_id=$1 ORDER BY created_at DESC",
    [req.scopeStudentId]
  );
  res.json({ student, progress, attendance, assignments });
});

export default router;
