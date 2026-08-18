import express from "express";
import { queryOne } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { ensureStudentAccess, canAccessStudent, recordAudit } from "../middleware/ownership.js";

const router = express.Router();

router.get("/me", authRequired, async (req, res) => {
  if (req.user.role !== "student") return res.status(403).json({ error: "Student access only." });
  const row = await queryOne("SELECT * FROM student_progress WHERE student_id=$1", [req.user.id]);
  res.json(row);
});

router.get("/student/:studentId", authRequired, ensureStudentAccess, async (req, res) => {
  const row = await queryOne("SELECT * FROM student_progress WHERE student_id=$1", [req.scopeStudentId]);
  res.json(row);
});

router.put("/student/:studentId", authRequired, requireRole("teacher", "admin"), async (req, res) => {
  const studentId = Number(req.params.studentId);
  if (!(await canAccessStudent(req.user, studentId))) {
    return res.status(403).json({ error: "You cannot update progress for this student." });
  }
  const body = req.body || {};
  const row = await queryOne(
    `INSERT INTO student_progress
      (student_id, teacher_id, current_surah, current_juz, lesson_title, lessons_completed, lessons_remaining,
       memorization_progress, reading_progress, tajweed_progress, overall_progress, strengths, weaknesses, feedback, teacher_notes, updated_at)
     VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())
     ON CONFLICT (student_id) DO UPDATE SET
      teacher_id=EXCLUDED.teacher_id,
      current_surah=EXCLUDED.current_surah,
      current_juz=EXCLUDED.current_juz,
      lesson_title=EXCLUDED.lesson_title,
      lessons_completed=EXCLUDED.lessons_completed,
      lessons_remaining=EXCLUDED.lessons_remaining,
      memorization_progress=EXCLUDED.memorization_progress,
      reading_progress=EXCLUDED.reading_progress,
      tajweed_progress=EXCLUDED.tajweed_progress,
      overall_progress=EXCLUDED.overall_progress,
      strengths=EXCLUDED.strengths,
      weaknesses=EXCLUDED.weaknesses,
      feedback=EXCLUDED.feedback,
      teacher_notes=EXCLUDED.teacher_notes,
      updated_at=NOW()
     RETURNING *`,
    [
      studentId,
      req.user.role === "teacher" ? req.user.id : body.teacherId || null,
      body.currentSurah || null,
      body.currentJuz || null,
      body.lessonTitle || null,
      body.lessonsCompleted || 0,
      body.lessonsRemaining || 0,
      body.memorizationProgress || 0,
      body.readingProgress || 0,
      body.tajweedProgress || 0,
      body.overallProgress || 0,
      body.strengths || "",
      body.weaknesses || "",
      body.feedback || "",
      body.teacherNotes || "",
    ]
  );
  await recordAudit(req.user.id, "progress.updated", "student_progress", studentId, { overallProgress: body.overallProgress || 0 });
  res.json(row);
});

export default router;
