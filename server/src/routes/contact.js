import express from "express";
import { query, queryOne } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, role, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Please fill in name, email, and message." });
  }
  const row = await queryOne(
    "INSERT INTO contact_messages (name, email, role, message) VALUES ($1,$2,$3,$4) RETURNING id",
    [name, email, role || "student", message]
  );
  const admin = await queryOne("SELECT id FROM users WHERE role='admin' LIMIT 1");
  if (admin) {
    await queryOne("INSERT INTO notifications (user_id, text) VALUES ($1,$2) RETURNING id", [
      admin.id,
      `Contact message from ${name}.`,
    ]);
  }
  res.json({ id: row.id, ok: true });
});

router.get("/", authRequired, requireRole("admin"), async (_req, res) => {
  res.json(await query("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 50"));
});

export default router;
