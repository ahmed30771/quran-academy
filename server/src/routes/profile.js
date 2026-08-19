import express from "express";
import bcrypt from "bcryptjs";
import { queryOne } from "../db.js";
import { authRequired, publicUser } from "../middleware/auth.js";
import { validatePassword } from "../validate.js";

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
    gender,
    teachingLanguages,
    teachKids,
    teachAdults,
    avatar,
  } = req.body || {};
  const emailNorm = String(email || "").trim().toLowerCase() || null;
  const user = await queryOne(
    `UPDATE users
     SET name=$1, email=$2, bio=$3, phone_number=$4, date_of_birth=$5, preferred_language=$6, timezone=$7,
         qualifications=$8, experience=$9, subjects=$10, available_times=$11, introduction=$12,
         gender=COALESCE($13, gender),
         teaching_languages=CASE WHEN role='teacher' THEN COALESCE($14, teaching_languages) ELSE teaching_languages END,
         teach_kids=CASE WHEN role='teacher' THEN COALESCE($15, teach_kids) ELSE teach_kids END,
         teach_adults=CASE WHEN role='teacher' THEN COALESCE($16, teach_adults) ELSE teach_adults END,
         avatar=COALESCE($17, avatar), updated_at=NOW()
     WHERE id=$18
     RETURNING *`,
    [
      name,
      emailNorm,
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
      gender === "male" || gender === "female" ? gender : null,
      ["urdu", "english", "both"].includes(teachingLanguages) ? teachingLanguages : null,
      typeof teachKids === "boolean" ? teachKids : null,
      typeof teachAdults === "boolean" ? teachAdults : null,
      avatar === undefined ? null : String(avatar || ""),
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
    const passErr = validatePassword(password);
    if (passErr) return res.status(400).json({ error: passErr });
    const hash = await bcrypt.hash(password, 12);
    await queryOne("UPDATE users SET password_hash=$1 WHERE id=$2 RETURNING id", [hash, req.user.id]);
  }
  const user = await queryOne("SELECT * FROM users WHERE id=$1", [req.user.id]);
  res.json({ user: publicUser(user) });
});

export default router;
