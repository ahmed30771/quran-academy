import express from "express";
import { query, queryOne } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { recordAudit } from "../middleware/ownership.js";
import { slugify } from "../courseUtils.js";

const router = express.Router();

function fail(res, err, fallback) {
  console.error(err);
  const message = err?.code === "23505" ? "A post with this title already exists." : fallback;
  if (!res.headersSent) res.status(500).json({ error: message });
}

function dateLabel(value) {
  const raw = String(value || "").trim();
  if (raw) return raw.slice(0, 64);
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function postPayload(body = {}) {
  const title = String(body.title || "").trim();
  return {
    title,
    slug: slugify(body.slug || title) || `post-${Date.now()}`.slice(0, 64),
    date_label: dateLabel(body.date_label),
    tag: String(body.tag || "").trim().slice(0, 64),
    excerpt: String(body.excerpt || "").trim(),
    body: String(body.body || "").trim(),
  };
}

router.get("/", async (_req, res) => {
  try {
    res.json(await query("SELECT id, title, date_label, tag, excerpt, created_at FROM blog_posts ORDER BY created_at DESC"));
  } catch (err) {
    fail(res, err, "Could not load posts.");
  }
});

router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const data = postPayload(req.body);
    if (!data.title) return res.status(400).json({ error: "Post title is required." });
    if (!data.tag) return res.status(400).json({ error: "Please enter a tag." });
    if (!data.excerpt) return res.status(400).json({ error: "Please enter a short excerpt." });
    if (!data.body) return res.status(400).json({ error: "Please write the post." });
    const exists = await queryOne("SELECT id FROM blog_posts WHERE id=$1", [data.slug]);
    if (exists) return res.status(409).json({ error: "A post with this title already exists." });
    const row = await queryOne(
      `INSERT INTO blog_posts (id, title, date_label, tag, excerpt, body)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [data.slug, data.title, data.date_label, data.tag, data.excerpt, data.body]
    );
    await recordAudit(req.user.id, "blog.create", "blog", row.id, { title: row.title });
    res.json(row);
  } catch (err) {
    fail(res, err, "Could not create post.");
  }
});

router.post("/:id/save", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const post = await queryOne("SELECT * FROM blog_posts WHERE id=$1", [req.params.id]);
    if (!post) return res.status(404).json({ error: "Post not found." });
    const data = postPayload({ ...post, ...req.body, slug: req.body.slug || post.id });
    if (!data.title) return res.status(400).json({ error: "Post title is required." });
    if (!data.tag) return res.status(400).json({ error: "Please enter a tag." });
    if (!data.excerpt) return res.status(400).json({ error: "Please enter a short excerpt." });
    if (!data.body) return res.status(400).json({ error: "Please write the post." });
    const row = await queryOne(
      `UPDATE blog_posts SET title=$1, date_label=$2, tag=$3, excerpt=$4, body=$5
       WHERE id=$6 RETURNING *`,
      [data.title, data.date_label, data.tag, data.excerpt, data.body, post.id]
    );
    await recordAudit(req.user.id, "blog.update", "blog", post.id, { title: row.title });
    res.json(row);
  } catch (err) {
    fail(res, err, "Could not update post.");
  }
});

router.post("/:id/delete", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const post = await queryOne("SELECT id, title FROM blog_posts WHERE id=$1", [req.params.id]);
    if (!post) return res.status(404).json({ error: "Post not found." });
    await query("DELETE FROM blog_posts WHERE id=$1", [post.id]);
    await recordAudit(req.user.id, "blog.delete", "blog", post.id, { title: post.title });
    res.json({ ok: true });
  } catch (err) {
    fail(res, err, "Could not delete post.");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const row = await queryOne("SELECT * FROM blog_posts WHERE id=$1", [req.params.id]);
    if (!row) return res.status(404).json({ error: "Post not found." });
    res.json(row);
  } catch (err) {
    fail(res, err, "Could not load post.");
  }
});

export default router;
