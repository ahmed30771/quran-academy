import express from "express";
import { query, queryOne } from "../db.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.json(await query("SELECT id, title, date_label, tag, excerpt FROM blog_posts ORDER BY created_at DESC"));
});

router.get("/:id", async (req, res) => {
  const row = await queryOne("SELECT * FROM blog_posts WHERE id=$1", [req.params.id]);
  if (!row) return res.status(404).json({ error: "Post not found." });
  res.json(row);
});

export default router;
