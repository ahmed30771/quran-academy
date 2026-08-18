import express from "express";
import bcrypt from "bcryptjs";
import { queryOne } from "../db.js";
import { authRequired, publicUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  const user = await queryOne("SELECT * FROM users WHERE id=$1", [req.user.id]);
  res.json({ user: publicUser(user) });
});

router.put("/", authRequired, async (req, res) => {
  const {
    name,
    email,
    bio,
    phoneNumber,
    dateOfBirth,
    preferredLanguage,
    timezone,
    qualifications,
    experience,
    subjects,
    availableTimes,
    introduction,
  } = req.body || {};
  const user = await queryOne(
    `UPDATE users
     SET name=$1, email=$2, bio=$3, phone_number=$4, date_of_birth=$5, preferred_language=$6, timezone=$7,
         qualifications=$8, experience=$9, subjects=$10, available_times=$11, introduction=$12, updated_at=NOW()
     WHERE id=$13
     RETURNING *`,
    [
      name,
      email,
      bio || "",
      phoneNumber || "",
      dateOfBirth || null,
      preferredLanguage || "en",
      timezone || "UTC",
      qualifications || "",
      experience || "",
      subjects || "",
      availableTimes || "",
      introduction || "",
      req.user.id,
    ]
  );
  res.json({ user: publicUser(user) });
});

router.put("/settings", authRequired, async (req, res) => {
  const { privacy, showEmail, emailNotif, waNotif, password } = req.body || {};
  await queryOne(
    "UPDATE users SET privacy=$1, show_email=$2, email_notif=$3, wa_notif=$4 WHERE id=$5 RETURNING id",
    [privacy || "staff", !!showEmail, !!emailNotif, !!waNotif, req.user.id]
  );
  if (password) {
    const hash = await bcrypt.hash(password, 12);
    await queryOne("UPDATE users SET password_hash=$1 WHERE id=$2 RETURNING id", [hash, req.user.id]);
  }
  const user = await queryOne("SELECT * FROM users WHERE id=$1", [req.user.id]);
  res.json({ user: publicUser(user) });
});

export default router;
