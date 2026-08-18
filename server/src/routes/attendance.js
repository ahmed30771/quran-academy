import express from "express";
import { query, queryOne } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { ensureStudentAccess, recordAudit } from "../middleware/ownership.js";

const router = express.Router();

router.get("/me", authRequired, async (req, res) => {
  const rows = await query(
    `SELECT a.*, co.title AS class_name, t.name AS teacher_name
     FROM attendance a
     LEFT JOIN classes c ON c.id=a.class_id
     LEFT JOIN courses co ON co.id=c.course_id
     LEFT JOIN users t ON t.id=a.teacher_id
     WHERE a.student_id=$1
     ORDER BY a.class_date DESC`,
    [req.user.id]
  );
  res.json(rows);
});

router.get("/student/:studentId", authRequired, ensureStudentAccess, async (req, res) => {
  const rows = await query(
    `SELECT a.*, co.title AS class_name, t.name AS teacher_name
     FROM attendance a
     LEFT JOIN classes c ON c.id=a.class_id
     LEFT JOIN courses co ON co.id=c.course_id
     LEFT JOIN users t ON t.id=a.teacher_id
     WHERE a.student_id=$1
     ORDER BY a.class_date DESC`,
    [req.scopeStudentId]
  );
  res.json(rows);
});

router.post("/", authRequired, requireRole("teacher", "admin"), async (req, res) => {
  const { classId, studentId, classDate, status, notes } = req.body || {};
  if (!studentId || !classDate || !status) return res.status(400).json({ error: "studentId, classDate, and status are required." });
  if (req.user.role === "teacher") {
    const own = await queryOne(
      "SELECT id FROM classes WHERE id=$1 AND teacher_id=$2 AND student_id=$3",
      [classId || null, req.user.id, studentId]
    );
    if (!own) return res.status(403).json({ error: "You can manage attendance only for your own classes." });
  }
  const row = await queryOne(
    `INSERT INTO attendance (class_id, student_id, teacher_id, class_date, status, notes)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [classId || null, studentId, req.user.role === "teacher" ? req.user.id : null, classDate, status, notes || ""]
  );
  await recordAudit(req.user.id, "attendance.recorded", "attendance", row.id, { studentId, classId, status });
  res.json(row);
});

export default router;
