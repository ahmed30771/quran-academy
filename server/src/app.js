import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { query } from "./db.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import courseRoutes from "./routes/courses.js";
import contactRoutes from "./routes/contact.js";
import blogRoutes from "./routes/blog.js";
import dashRoutes from "./routes/dash.js";
import studentRoutes from "./routes/students.js";
import teacherRoutes from "./routes/teachers.js";
import attendanceRoutes from "./routes/attendance.js";
import progressRoutes from "./routes/progress.js";
import assignmentRoutes from "./routes/assignments.js";
import notificationRoutes from "./routes/notifications.js";

dotenv.config();

const app = express();
const allowed = [
  process.env.CLIENT_ORIGIN,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowed.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.use((req, _res, next) => {
  const forwarded = req.headers["x-forwarded-uri"];
  if (typeof forwarded === "string" && forwarded.startsWith("/api") && !req.url.startsWith("/api")) {
    req.url = forwarded;
  }
  next();
});

app.get("/api/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false, error: "Database is not reachable." });
  }
});

app.get("/api/reviews", async (_req, res) => {
  try {
    res.json(await query("SELECT * FROM reviews"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load reviews." });
  }
});

app.get("/api/teachers", async (_req, res) => {
  try {
    res.json(
      await query("SELECT id, name, bio, avatar FROM users WHERE role='teacher' AND status='active'")
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load teachers." });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/dash", dashRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error." });
});

export default app;
