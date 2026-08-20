import express from "express";
import { query, queryOne } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = express.Router();

function cleanText(value, max = 400) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
}

async function refreshTeacherRating(teacherId) {
  const avg = await queryOne(
    `SELECT ROUND(AVG(stars)::numeric, 1) AS rating, COUNT(*)::int AS n
     FROM teacher_ratings WHERE teacher_id=$1`,
    [teacherId]
  );
  const rating = avg?.n ? Number(avg.rating) : 5;
  await query("UPDATE users SET rating=$1 WHERE id=$2 AND role='teacher'", [rating, teacherId]);
  return rating;
}

async function canRateTeacher(studentId, teacherId) {
  const row = await queryOne(
    `SELECT 1 AS ok FROM classes
     WHERE student_id=$1 AND teacher_id=$2
     LIMIT 1`,
    [studentId, teacherId]
  );
  return !!row;
}

router.get("/teachers", authRequired, requireRole("student"), async (req, res) => {
  try {
    const teachers = await query(
      `SELECT DISTINCT u.id, u.name, u.avatar, u.bio, COALESCE(u.rating, 5) AS rating,
              tr.stars AS my_stars, tr.comment AS my_comment, tr.updated_at AS rated_at
       FROM classes c
       JOIN users u ON u.id = c.teacher_id AND u.role = 'teacher'
       LEFT JOIN teacher_ratings tr ON tr.teacher_id = u.id AND tr.student_id = $1
       WHERE c.student_id = $1
       ORDER BY u.name`,
      [req.user.id]
    );
    res.json(
      teachers.map((row) => ({
        id: row.id,
        name: row.name,
        avatar: row.avatar,
        bio: row.bio,
        rating: Number(row.rating) || 5,
        myStars: row.my_stars != null ? Number(row.my_stars) : null,
        myComment: row.my_comment || "",
        ratedAt: row.rated_at || null,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load teachers to rate." });
  }
});

router.post("/teachers/:teacherId", authRequired, requireRole("student"), async (req, res) => {
  try {
    const teacherId = Number(req.params.teacherId);
    if (!Number.isFinite(teacherId)) return res.status(400).json({ error: "Invalid teacher." });

    const teacher = await queryOne(
      "SELECT id, name FROM users WHERE id=$1 AND role='teacher' AND status='active'",
      [teacherId]
    );
    if (!teacher) return res.status(404).json({ error: "Teacher not found." });

    const allowed = await canRateTeacher(req.user.id, teacherId);
    if (!allowed) {
      return res.status(403).json({ error: "You can only rate teachers from your classes." });
    }

    const stars = Math.round(Number(req.body?.stars));
    const comment = cleanText(req.body?.comment, 400);
    if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Please choose a rating from 1 to 5 stars." });
    }

    const row = await queryOne(
      `INSERT INTO teacher_ratings (student_id, teacher_id, stars, comment)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (student_id, teacher_id)
       DO UPDATE SET stars=EXCLUDED.stars, comment=EXCLUDED.comment, updated_at=NOW()
       RETURNING *`,
      [req.user.id, teacherId, stars, comment || null]
    );

    const rating = await refreshTeacherRating(teacherId);
    res.json({
      id: row.id,
      teacherId: teacher.id,
      teacherName: teacher.name,
      stars: Number(row.stars),
      comment: row.comment || "",
      rating,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save teacher rating." });
  }
});

export default router;
