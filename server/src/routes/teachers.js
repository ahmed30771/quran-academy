import express from "express";
import { query, queryOne } from "../db.js";
import { authRequired } from "../middleware/auth.js";
import { ensureTeacherAccess } from "../middleware/ownership.js";

const router = express.Router();

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
  res.json({ teacher, students });
});

router.get("/:id", authRequired, ensureTeacherAccess, async (req, res) => {
  const teacher = await queryOne(
    `SELECT id, name, email, phone_number, avatar, bio, qualifications, experience, subjects, available_times, introduction, role, status
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
  res.json({ teacher, classes });
});

export default router;
