import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { query } from "./db.js";
import { ensureTeacherLocale } from "./locale.js";
import { ensureCourseSchemaOnce } from "./ensure.js";
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
import reviewRoutes from "./routes/reviews.js";

dotenv.config();

const app = express();
const allowed = [
  process.env.CLIENT_ORIGIN,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowed.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return next();
  if (typeof req.body === "string" || Buffer.isBuffer(req.body)) {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : req.body;
    if (!raw) {
      req.body = {};
      return next();
    }
    try {
      req.body = JSON.parse(raw);
      return next();
    } catch {
      return res.status(400).json({ error: "Invalid JSON body." });
    }
  }
  express.json({ limit: "4mb" })(req, res, (err) => {
    if (!err) return next();
    if (err.type === "entity.too.large") {
      return res.status(413).json({ error: "Image is too large. Please use a file under 2 MB." });
    }
    return res.status(400).json({ error: err.message || "Invalid request body." });
  });
});
app.use(cookieParser());

app.use(async (_req, _res, next) => {
  try {
    await ensureCourseSchemaOnce();
  } catch (err) {
    console.error(err);
  }
  next();
});

app.use((req, _res, next) => {
  const header = req.headers["x-forwarded-uri"] || req.headers["x-invoke-path"] || "";
  const candidate = String(Array.isArray(header) ? header[0] : header).split("?")[0];
  if (candidate.startsWith("/api/") && !String(req.url).startsWith("/api/")) {
    const url = String(req.url || "");
    const qs = url.includes("?") ? url.slice(url.indexOf("?")) : "";
    req.url = candidate + qs;
  }
  next();
});

const api = express.Router();

api.get("/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false, error: "Database is not reachable." });
  }
});

api.use("/reviews", reviewRoutes);
api.get("/teachers", async (_req, res) => {
  try {
    const rows = await query(
      `SELECT id, name, bio, avatar, gender, teaching_languages, teach_kids, teach_adults, experience, introduction, locale_ur, COALESCE(rating, 5) AS rating
       FROM users WHERE role='teacher' AND status='active' ORDER BY name`
    );
    res.json(await Promise.all(rows.map(ensureTeacherLocale)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load teachers." });
  }
});

api.use("/auth", authRoutes);
api.use("/profile", profileRoutes);
api.use("/courses", courseRoutes);
api.use("/contact", contactRoutes);
api.use("/blog", blogRoutes);
api.use("/dash", dashRoutes);
api.use("/students", studentRoutes);
api.use("/teachers", teacherRoutes);
api.use("/attendance", attendanceRoutes);
api.use("/progress", progressRoutes);
api.use("/assignments", assignmentRoutes);
api.use("/notifications", notificationRoutes);
api.use((req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

app.get("/", (_req, res) => {
  const site = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  res.json({
    ok: true,
    message: "This is the API. Open the website instead.",
    website: site,
    health: "/api/health",
  });
});
app.use("/api", api);
app.use("/", api);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (!res.headersSent) res.status(500).json({ error: err.message || "Server error." });
});

export default app;
