import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query, queryOne } from "../db.js";
import { signToken, publicUser, cookieOpts, readToken } from "../middleware/auth.js";
import { recordAudit } from "../middleware/ownership.js";
import { normalizeName, normalizePhone, validatePersonName, validateEmail, validateEmailOptional, validatePassword, validatePhone } from "../validate.js";
import { sendMail } from "../mail.js";
import { isAdminEmail } from "../admins.js";

const router = express.Router();
const ROUNDS = 12;

async function ensureResetTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

router.post("/register", async (req, res) => {
  const { name, email, password, role, gender, phone, teachingLanguages, teachKids, teachAdults, courseIds, qualifications } = req.body || {};
  const nameErr = validatePersonName(name);
  const emailErr = validateEmailOptional(email);
  const phoneErr = validatePhone(phone);
  const passErr = validatePassword(password);
  if (nameErr || emailErr || phoneErr || passErr) {
    return res.status(400).json({ error: nameErr || emailErr || phoneErr || passErr });
  }
  if (gender !== "male" && gender !== "female") {
    return res.status(400).json({ error: "Please select gender." });
  }
  const emailNorm = String(email || "").trim().toLowerCase() || null;
  if (emailNorm && isAdminEmail(emailNorm)) {
    return res.status(409).json({ error: "That email is already registered." });
  }
  const chosen = role === "teacher" ? "teacher" : "student";
  const quals = String(qualifications || "").trim();
  if (chosen === "teacher" && !quals) {
    return res.status(400).json({ error: "Please enter your qualifications." });
  }
  const langs = chosen === "teacher" && ["urdu", "english", "both"].includes(teachingLanguages) ? teachingLanguages : null;
  const phoneNorm = normalizePhone(phone);
  try {
    const password_hash = await bcrypt.hash(password, ROUNDS);
    const user = await queryOne(
      `INSERT INTO users (role, name, email, password_hash, status, gender, phone_number, teaching_languages, teach_kids, teach_adults, qualifications)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        chosen,
        normalizeName(name),
        emailNorm,
        password_hash,
        chosen === "teacher" ? "pending" : "active",
        gender,
        phoneNorm,
        langs,
        chosen === "teacher" && !!teachKids,
        chosen === "teacher" && !!teachAdults,
        chosen === "teacher" ? quals : "",
      ]
    );
    if (chosen === "teacher" && Array.isArray(courseIds)) {
      for (const courseId of [...new Set(courseIds.map(String))]) {
        const course = await queryOne("SELECT id FROM courses WHERE (id=$1 OR slug=$1) AND status='active'", [courseId]);
        if (!course) continue;
        await query(
          `INSERT INTO teacher_courses (teacher_id, course_id, status) VALUES ($1,$2,'pending')
           ON CONFLICT (teacher_id, course_id) DO NOTHING`,
          [user.id, course.id]
        );
      }
    }
    await recordAudit(user.id, "user.registered", "user", user.id, { role: user.role });
    const token = signToken(user);
    res.cookie("token", token, cookieOpts);
    res.json({ user: publicUser(user) });
  } catch (err) {
    if (err.code === "23505") {
      const detail = `${err.constraint || ""} ${err.detail || ""}`.toLowerCase();
      if (detail.includes("phone")) return res.status(409).json({ error: "That phone number is already registered." });
      return res.status(409).json({ error: "That email is already registered." });
    }
    console.error(err);
    res.status(500).json({ error: "Could not create account." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, login } = req.body || {};
  const ident = String(login || email || "").trim();
  if (!ident || !password) return res.status(400).json({ error: "Phone or email, and password, are required." });
  try {
    let user;
    if (ident.includes("@")) {
      const emailNorm = ident.toLowerCase();
      const emailErr = validateEmail(emailNorm);
      if (emailErr) return res.status(400).json({ error: emailErr });
      user = await queryOne("SELECT * FROM users WHERE email=$1", [emailNorm]);
    } else {
      const phoneErr = validatePhone(ident);
      if (phoneErr) return res.status(400).json({ error: phoneErr });
      user = await queryOne("SELECT * FROM users WHERE phone_number=$1", [normalizePhone(ident)]);
    }
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Phone, email, or password is incorrect." });
    }
    if (user.email && isAdminEmail(user.email) && user.role !== "admin") {
      user = await queryOne("UPDATE users SET role='admin', status='active', updated_at=NOW() WHERE id=$1 RETURNING *", [user.id]);
    }
    await query("UPDATE users SET last_login=NOW(), updated_at=NOW() WHERE id=$1", [user.id]);
    await recordAudit(user.id, "user.login", "user", user.id, { role: user.role });
    const token = signToken(user);
    res.cookie("token", token, cookieOpts);
    res.json({ user: publicUser({ ...user, last_login: new Date().toISOString() }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not sign in. Check the database connection." });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  const emailErr = validateEmail(email);
  if (emailErr) return res.status(400).json({ error: emailErr });
  const normalized = String(email).trim().toLowerCase();
  try {
    await ensureResetTable();
    const user = await queryOne("SELECT id, name, email FROM users WHERE email=$1", [normalized]);
    if (user) {
      const recent = await queryOne(
        `SELECT id FROM password_resets
         WHERE user_id=$1 AND created_at > NOW() - INTERVAL '60 seconds'
         ORDER BY created_at DESC LIMIT 1`,
        [user.id]
      );
      if (recent) {
        return res.json({ ok: true });
      }
      await query("UPDATE password_resets SET used_at=NOW() WHERE user_id=$1 AND used_at IS NULL", [user.id]);
      const code = String(crypto.randomInt(100000, 1000000));
      const code_hash = await bcrypt.hash(code, ROUNDS);
      await query(
        `INSERT INTO password_resets (user_id, code_hash, expires_at)
         VALUES ($1,$2, NOW() + INTERVAL '15 minutes')`,
        [user.id, code_hash]
      );
      const text = `Assalamu alaikum ${user.name},\n\nYour Quran Academy password reset code is ${code}.\nIt expires in 15 minutes. If you did not ask for this, you can ignore this message.\n`;
      try {
        await sendMail({
          to: user.email,
          subject: "Quran Academy password reset code",
          text,
          html: `<p>Assalamu alaikum ${user.name},</p><p>Your password reset code is <strong>${code}</strong>.</p><p>It expires in 15 minutes.</p>`,
        });
      } catch (mailErr) {
        console.error(mailErr);
        console.log(`[mail] reset code for ${user.email}: ${code}`);
      }
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not start password reset." });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, code, password } = req.body || {};
  const emailErr = validateEmail(email);
  const passErr = validatePassword(password);
  if (emailErr || passErr) return res.status(400).json({ error: emailErr || passErr });
  if (!/^\d{6}$/.test(String(code || "").trim())) {
    return res.status(400).json({ error: "Enter the 6-digit code sent to your email." });
  }
  try {
    await ensureResetTable();
    const user = await queryOne("SELECT * FROM users WHERE email=$1", [String(email).trim().toLowerCase()]);
    if (!user) return res.status(400).json({ error: "This reset code is invalid or has expired." });
    const row = await queryOne(
      `SELECT * FROM password_resets
       WHERE user_id=$1 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );
    if (!row || !(await bcrypt.compare(String(code).trim(), row.code_hash))) {
      return res.status(400).json({ error: "This reset code is invalid or has expired." });
    }
    const password_hash = await bcrypt.hash(password, ROUNDS);
    await query("UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2", [password_hash, user.id]);
    await query("UPDATE password_resets SET used_at=NOW() WHERE id=$1", [row.id]);
    await query("UPDATE password_resets SET used_at=NOW() WHERE user_id=$1 AND used_at IS NULL", [user.id]);
    await recordAudit(user.id, "user.password_reset", "user", user.id, {});
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update password." });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token", { ...cookieOpts, maxAge: 0 });
  res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const token = readToken(req);
  if (!token) return res.json({ user: null });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    const user = await queryOne("SELECT * FROM users WHERE id=$1", [payload.id]);
    res.json({ user: publicUser(user) });
  } catch {
    res.json({ user: null });
  }
});

export default router;
