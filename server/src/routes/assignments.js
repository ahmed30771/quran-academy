import express from "express";
import { query, queryOne } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { canAccessStudent, recordAudit } from "../middleware/ownership.js";

const router = express.Router();

router.get("/me", authRequired, async (req, res) => {
  if (req.user.role === "student") {
    return res.json(
      await query(
        "SELECT id, task, due_label, status, feedback, marks, submission_status, submission_text FROM homework WHERE student_id=$1 ORDER BY created_at DESC",
        [req.user.id]
      )
    );
  }
  if (req.user.role === "teacher") {
    return res.json(
      await query(
        "SELECT h.id, h.task, h.due_label, h.status, h.feedback, h.marks, h.submission_status, u.name AS student_name FROM homework h JOIN users u ON u.id=h.student_id WHERE h.teacher_id=$1 ORDER BY h.created_at DESC",
        [req.user.id]
      )
    );
  }
  return res.json(await query("SELECT * FROM homework ORDER BY created_at DESC LIMIT 100"));
});

router.post("/", authRequired, requireRole("teacher", "admin"), async (req, res) => {
  const { studentId, task, dueLabel } = req.body || {};
  if (!studentId || !task) return res.status(400).json({ error: "studentId and task are required." });
  if (req.user.role === "teacher" && !(await canAccessStudent(req.user, studentId))) {
    return res.status(403).json({ error: "You can assign homework only to your own students." });
  }
  const row = await queryOne(
    `INSERT INTO homework (teacher_id, student_id, task, due_label, status, submission_status)
     VALUES ($1,$2,$3,$4,'open','pending')
     RETURNING *`,
    [req.user.role === "teacher" ? req.user.id : null, studentId, task, dueLabel || "Due soon"]
  );
  await recordAudit(req.user.id, "assignment.created", "homework", row.id, { studentId });
  res.json(row);
});

router.post("/:id/submit", authRequired, requireRole("student"), async (req, res) => {
  const row = await queryOne("SELECT * FROM homework WHERE id=$1 AND student_id=$2", [req.params.id, req.user.id]);
  if (!row) return res.status(404).json({ error: "Assignment not found." });
  const updated = await queryOne(
    `UPDATE homework
     SET submission_text=$1, submitted_at=NOW(), submission_status='submitted'
     WHERE id=$2
     RETURNING *`,
    [req.body?.submissionText || "", req.params.id]
  );
  await recordAudit(req.user.id, "assignment.submitted", "homework", updated.id, {});
  res.json(updated);
});

router.put("/:id/review", authRequired, requireRole("teacher", "admin"), async (req, res) => {
  const row = await queryOne("SELECT * FROM homework WHERE id=$1", [req.params.id]);
  if (!row) return res.status(404).json({ error: "Assignment not found." });
  if (req.user.role === "teacher" && Number(row.teacher_id) !== Number(req.user.id)) {
    return res.status(403).json({ error: "You can review only your own assignments." });
  }
  const updated = await queryOne(
    `UPDATE homework
     SET feedback=$1, marks=$2, submission_status=$3, status=$4
     WHERE id=$5
     RETURNING *`,
    [req.body?.feedback || "", req.body?.marks ?? null, req.body?.submissionStatus || "reviewed", req.body?.status || row.status, req.params.id]
  );
  await recordAudit(req.user.id, "assignment.reviewed", "homework", updated.id, { marks: updated.marks });
  res.json(updated);
});

export default router;
