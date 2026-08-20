import express from "express";
import { query, queryOne } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { ensureReviewLocale, saveReviewLocale } from "../locale.js";

const router = express.Router();

function cleanText(value, max = 600) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
}

router.get("/", async (_req, res) => {
  try {
    const rows = await query(
      `SELECT r.id, r.name, r.country, r.stars, r.text, r.locale_ur, r.user_id, r.created_at,
              u.avatar AS avatar
       FROM reviews r
       LEFT JOIN users u ON u.id = r.user_id
       ORDER BY r.stars DESC, r.id DESC`
    );
    res.json(await Promise.all(rows.map(ensureReviewLocale)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load reviews." });
  }
});

router.get("/mine", authRequired, requireRole("student"), async (req, res) => {
  try {
    const row = await queryOne("SELECT * FROM reviews WHERE user_id=$1", [req.user.id]);
    if (!row) return res.json(null);
    res.json(await ensureReviewLocale(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load your review." });
  }
});

router.post("/", authRequired, requireRole("student"), async (req, res) => {
  try {
    const stars = Math.round(Number(req.body?.stars));
    const text = cleanText(req.body?.text, 600);
    const country = cleanText(req.body?.country, 80);
    if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Please choose a rating from 1 to 5 stars." });
    }
    if (text.length < 20) {
      return res.status(400).json({ error: "Please write at least 20 characters about your experience." });
    }
    if (country.length < 2) {
      return res.status(400).json({ error: "Please enter your country." });
    }

    const student = await queryOne(
      "SELECT id, name, avatar FROM users WHERE id=$1 AND role='student'",
      [req.user.id]
    );
    if (!student) return res.status(403).json({ error: "Student access only." });

    const existing = await queryOne("SELECT id FROM reviews WHERE user_id=$1", [student.id]);
    let row;
    if (existing) {
      row = await queryOne(
        `UPDATE reviews
         SET name=$1, country=$2, stars=$3, text=$4, locale_ur=NULL, created_at=NOW()
         WHERE user_id=$5
         RETURNING *`,
        [student.name, country, stars, text, student.id]
      );
    } else {
      row = await queryOne(
        `INSERT INTO reviews (name, country, stars, text, user_id)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING *`,
        [student.name, country, stars, text, student.id]
      );
    }

    const saved = await saveReviewLocale(row);
    res.json({ ...saved, avatar: student.avatar || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save your review." });
  }
});

export default router;
