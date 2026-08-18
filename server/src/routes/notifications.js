import express from "express";
import { query, queryOne } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { recordAudit } from "../middleware/ownership.js";

const router = express.Router();

router.get("/me", authRequired, async (req, res) => {
  res.json(await query("SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC", [req.user.id]));
});

router.post("/:id/read", authRequired, async (req, res) => {
  const row = await queryOne("UPDATE notifications SET is_read=TRUE WHERE id=$1 AND user_id=$2 RETURNING *", [req.params.id, req.user.id]);
  if (!row) return res.status(404).json({ error: "Notification not found." });
  res.json(row);
});

router.delete("/:id", authRequired, async (req, res) => {
  const row = await queryOne("DELETE FROM notifications WHERE id=$1 AND user_id=$2 RETURNING id", [req.params.id, req.user.id]);
  if (!row) return res.status(404).json({ error: "Notification not found." });
  res.json({ ok: true });
});

router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  const { userId, text } = req.body || {};
  if (!userId || !text) return res.status(400).json({ error: "userId and text are required." });
  const row = await queryOne("INSERT INTO notifications (user_id, text) VALUES ($1,$2) RETURNING *", [userId, text]);
  await recordAudit(req.user.id, "notification.sent", "notification", row.id, { userId });
  res.json(row);
});

export default router;
