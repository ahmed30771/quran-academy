import express from "express";
import { query, queryOne } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.json(await query("SELECT * FROM courses ORDER BY price_usd"));
});

router.get("/:id", async (req, res) => {
  const row = await queryOne("SELECT * FROM courses WHERE id=$1", [req.params.id]);
  if (!row) return res.status(404).json({ error: "Course not found." });
  res.json(row);
});

router.post("/:id/enroll", authRequired, requireRole("student"), async (req, res) => {
  const plan = req.body?.plan || "standard";
  const course = await queryOne("SELECT id, title FROM courses WHERE id=$1", [req.params.id]);
  if (!course) return res.status(404).json({ error: "Course not found." });
  const exists = await queryOne(
    "SELECT id FROM enrollments WHERE user_id=$1 AND course_id=$2",
    [req.user.id, req.params.id]
  );
  if (exists) return res.json({ ok: true, already: true });
  await queryOne(
    `INSERT INTO enrollments (user_id, course_id, plan, status)
     VALUES ($1,$2,$3,'pending') RETURNING id`,
    [req.user.id, req.params.id, plan]
  );
  const admin = await queryOne("SELECT id FROM users WHERE role='admin' LIMIT 1");
  if (admin) {
    await queryOne(
      "INSERT INTO notifications (user_id, text) VALUES ($1,$2) RETURNING id",
      [admin.id, `New enrollment for ${course.title}.`]
    );
  }
  res.json({ ok: true, course });
});

export default router;
