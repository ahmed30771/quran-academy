import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { queryOne } from "../db.js";
import { signToken, publicUser, cookieOpts, readToken } from "../middleware/auth.js";

const router = express.Router();
const ROUNDS = 12;

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }
  const chosen = role === "teacher" ? "teacher" : "student";
  try {
    const password_hash = await bcrypt.hash(password, ROUNDS);
    const user = await queryOne(
      `INSERT INTO users (role, name, email, password_hash, status)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [chosen, name.trim(), email.trim().toLowerCase(), password_hash, chosen === "teacher" ? "pending" : "active"]
    );
    const token = signToken(user);
    res.cookie("token", token, cookieOpts);
    res.json({ user: publicUser(user) });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "That email is already registered." });
    console.error(err);
    res.status(500).json({ error: "Could not create account." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
  try {
    const user = await queryOne("SELECT * FROM users WHERE email=$1", [email.trim().toLowerCase()]);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Email or password is incorrect." });
    }
    const token = signToken(user);
    res.cookie("token", token, cookieOpts);
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not sign in. Check the database connection." });
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
