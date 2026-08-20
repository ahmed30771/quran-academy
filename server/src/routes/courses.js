import express from "express";
import { query, queryOne } from "../db.js";
import { authRequired, requireRole, optionalAuth } from "../middleware/auth.js";
import { recordAudit } from "../middleware/ownership.js";
import { coursePayload, STATUSES } from "../courseUtils.js";
import { ensureCourseLocale, ensureTeacherLocale, saveCourseLocale } from "../locale.js";

const router = express.Router();

function fail(res, err, fallback) {
  console.error(err);
  const message = err?.code === "23505" ? "A course with this name already exists." : fallback;
  if (!res.headersSent) res.status(500).json({ error: message });
}

function findCourse(id) {
  return queryOne("SELECT * FROM courses WHERE id=$1 OR slug=$1", [id]);
}

async function approvedTeacherForCourse(courseId, teacherId) {
  if (!teacherId) return null;
  return queryOne(
    `SELECT u.id, u.name
     FROM teacher_courses tc
     JOIN users u ON u.id = tc.teacher_id
     WHERE tc.course_id = $1
       AND tc.teacher_id = $2
       AND tc.status = 'approved'
       AND u.role = 'teacher'
       AND u.status = 'active'`,
    [courseId, teacherId]
  );
}

async function ensureStudentClass(courseId, teacherId, studentId) {
  const existing = await queryOne(
    `SELECT id FROM classes
     WHERE course_id=$1 AND teacher_id=$2 AND student_id=$3
     LIMIT 1`,
    [courseId, teacherId, studentId]
  );
  if (existing) return existing;
  return queryOne(
    `INSERT INTO classes (course_id, teacher_id, student_id, day_label, time_label, status)
     VALUES ($1,$2,$3,'To schedule','TBD','upcoming')
     RETURNING id`,
    [courseId, teacherId, studentId]
  );
}

router.get("/", optionalAuth, async (req, res) => {
  try {
    const all = req.query.all === "1";
    if (all) {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Not allowed." });
      }
      const rows = await query("SELECT * FROM courses ORDER BY sort_order, title");
      res.json(await Promise.all(rows.map(ensureCourseLocale)));
      return;
    }
    const rows = await query("SELECT * FROM courses WHERE status='active' ORDER BY sort_order, title");
    res.json(await Promise.all(rows.map(ensureCourseLocale)));
  } catch (err) {
    fail(res, err, "Could not load courses.");
  }
});

router.get("/trial/me", authRequired, requireRole("student"), async (req, res) => {
  try {
    const rows = await query(
      `SELECT ct.course_id, ct.starts_at, ct.ends_at, co.title
       FROM course_trials ct JOIN courses co ON co.id=ct.course_id
       WHERE ct.user_id=$1
       ORDER BY ct.starts_at DESC`,
      [req.user.id]
    );
    res.json({
      courseIds: rows.map((r) => r.course_id),
      trials: rows,
    });
  } catch (err) {
    fail(res, err, "Could not load trial status.");
  }
});

router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const data = coursePayload(req.body);
    if (!data.title) return res.status(400).json({ error: "Course name is required." });
    if (data.image_url && data.image_url.length > 2800000) {
      return res.status(413).json({ error: "Image is too large. Please use a file under 2 MB." });
    }
    const exists = await queryOne("SELECT id FROM courses WHERE id=$1 OR slug=$1", [data.slug]);
    if (exists) return res.status(409).json({ error: "A course with this name already exists." });
    const row = await queryOne(
      `INSERT INTO courses (
         id, slug, title, category, audiences, levels, track, level, duration, length, price_usd,
         blurb, full_blurb, icon, intro, description, who_for, learnings, frequency, requirements,
         image_url, status, sort_order
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
       RETURNING *`,
      [
        data.slug, data.slug, data.title, data.category, data.audiences, data.levels, data.track, data.level,
        data.duration, data.length, data.price_usd, data.blurb, data.full_blurb, data.icon, data.intro,
        data.description, data.who_for, data.learnings, data.frequency, data.requirements, data.image_url,
        data.status, data.sort_order,
      ]
    );
    await recordAudit(req.user.id, "course.create", "course", row.id, { title: row.title });
    res.json(await saveCourseLocale(row));
  } catch (err) {
    fail(res, err, "Could not create course.");
  }
});

router.get("/:id/teachers", async (req, res) => {
  try {
    const course = await findCourse(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found." });
    const teachers = await query(
      `SELECT u.id, u.name, u.bio, u.avatar, u.gender, u.teaching_languages, u.teach_kids, u.teach_adults,
              u.experience, u.introduction, u.locale_ur, COALESCE(u.rating, 5) AS rating
       FROM teacher_courses tc
       JOIN users u ON u.id=tc.teacher_id
       WHERE tc.course_id=$1 AND tc.status='approved' AND u.role='teacher' AND u.status='active'
       ORDER BY u.name`,
      [course.id]
    );
    res.json(await Promise.all(teachers.map(ensureTeacherLocale)));
  } catch (err) {
    fail(res, err, "Could not load teachers.");
  }
});

router.post("/:id/enroll", authRequired, requireRole("student"), async (req, res) => {
  try {
    const plan = req.body?.plan || "standard";
    const teacherId = Number(req.body?.teacherId);
    const course = await findCourse(req.params.id);
    if (!course || course.status !== "active") return res.status(404).json({ error: "Course not found." });

    const teacherCount = await queryOne(
      `SELECT COUNT(*)::int AS n
       FROM teacher_courses tc
       JOIN users u ON u.id = tc.teacher_id
       WHERE tc.course_id = $1 AND tc.status = 'approved' AND u.status = 'active'`,
      [course.id]
    );
    let teacher = null;
    if (teacherCount?.n > 0) {
      if (!Number.isFinite(teacherId)) {
        return res.status(400).json({ error: "Please choose a teacher for this course." });
      }
      teacher = await approvedTeacherForCourse(course.id, teacherId);
      if (!teacher) return res.status(400).json({ error: "That teacher is not available for this course." });
    }

    const exists = await queryOne(
      "SELECT id, teacher_id FROM enrollments WHERE user_id=$1 AND course_id=$2",
      [req.user.id, course.id]
    );
    if (exists) {
      if (teacher && Number(exists.teacher_id) !== Number(teacher.id)) {
        await query("UPDATE enrollments SET teacher_id=$1 WHERE id=$2", [teacher.id, exists.id]);
        await ensureStudentClass(course.id, teacher.id, req.user.id);
        return res.json({ ok: true, already: true, updatedTeacher: true, course, teacher });
      }
      return res.json({ ok: true, already: true, course, teacher });
    }

    await queryOne(
      `INSERT INTO enrollments (user_id, course_id, plan, status, teacher_id)
       VALUES ($1,$2,$3,'pending',$4) RETURNING id`,
      [req.user.id, course.id, plan, teacher?.id || null]
    );
    if (teacher) await ensureStudentClass(course.id, teacher.id, req.user.id);

    const admin = await queryOne("SELECT id FROM users WHERE role='admin' LIMIT 1");
    if (admin) {
      const note = teacher
        ? `New enrollment for ${course.title} with ${teacher.name}.`
        : `New enrollment for ${course.title}.`;
      await queryOne(
        "INSERT INTO notifications (user_id, text) VALUES ($1,$2) RETURNING id",
        [admin.id, note]
      );
    }
    res.json({ ok: true, course, teacher });
  } catch (err) {
    fail(res, err, "Could not enroll in this course.");
  }
});

router.post("/:id/trial", authRequired, requireRole("student"), async (req, res) => {
  try {
    const teacherId = Number(req.body?.teacherId);
    const course = await findCourse(req.params.id);
    if (!course || course.status !== "active") return res.status(404).json({ error: "Course not found." });

    const teacherCount = await queryOne(
      `SELECT COUNT(*)::int AS n
       FROM teacher_courses tc
       JOIN users u ON u.id = tc.teacher_id
       WHERE tc.course_id = $1 AND tc.status = 'approved' AND u.status = 'active'`,
      [course.id]
    );
    let teacher = null;
    if (teacherCount?.n > 0) {
      if (!Number.isFinite(teacherId)) {
        return res.status(400).json({ error: "Please choose a teacher for this course." });
      }
      teacher = await approvedTeacherForCourse(course.id, teacherId);
      if (!teacher) return res.status(400).json({ error: "That teacher is not available for this course." });
    }

    const used = await queryOne("SELECT course_id FROM course_trials WHERE user_id=$1 AND course_id=$2", [req.user.id, course.id]);
    if (used) {
      return res.status(409).json({ error: "You have already used the free trial for this course." });
    }
    const trial = await queryOne(
      `INSERT INTO course_trials (user_id, course_id, starts_at, ends_at)
       VALUES ($1,$2,NOW(), NOW() + INTERVAL '1 day') RETURNING course_id, starts_at, ends_at`,
      [req.user.id, course.id]
    );
    const existing = await queryOne(
      "SELECT id, teacher_id FROM enrollments WHERE user_id=$1 AND course_id=$2",
      [req.user.id, course.id]
    );
    if (!existing) {
      await query(
        `INSERT INTO enrollments (user_id, course_id, plan, status, teacher_id)
         VALUES ($1,$2,'trial','active',$3)`,
        [req.user.id, course.id, teacher?.id || null]
      );
    } else if (teacher && !existing.teacher_id) {
      await query("UPDATE enrollments SET teacher_id=$1 WHERE id=$2", [teacher.id, existing.id]);
    }
    if (teacher) await ensureStudentClass(course.id, teacher.id, req.user.id);

    const admin = await queryOne("SELECT id FROM users WHERE role='admin' LIMIT 1");
    if (admin) {
      const student = await queryOne("SELECT name FROM users WHERE id=$1", [req.user.id]);
      const note = teacher
        ? `One-day free trial: ${student?.name || "Student"} on ${course.title} with ${teacher.name}.`
        : `One-day free trial: ${student?.name || "Student"} on ${course.title}.`;
      await query(
        "INSERT INTO notifications (user_id, text) VALUES ($1,$2)",
        [admin.id, note]
      );
    }
    res.json({ ok: true, trial, course, teacher });
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "You have already used the free trial for this course." });
    }
    fail(res, err, "Could not start the free trial.");
  }
});

async function updateCourseRecord(req, res) {
  const course = await findCourse(req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found." });
  const data = coursePayload({ ...course, ...req.body, slug: req.body.slug || course.slug });
  if (!data.title) return res.status(400).json({ error: "Course name is required." });
  if (data.image_url && data.image_url.length > 2800000) {
    return res.status(413).json({ error: "Image is too large. Please use a file under 2 MB." });
  }
  const clash = await queryOne("SELECT id FROM courses WHERE slug=$1 AND id<>$2", [data.slug, course.id]);
  if (clash) return res.status(409).json({ error: "Another course already uses this name." });
  const row = await queryOne(
    `UPDATE courses SET
       slug=$1, title=$2, category=$3, audiences=$4, levels=$5, track=$6, level=$7, duration=$8, length=$9,
       price_usd=$10, blurb=$11, full_blurb=$12, icon=$13, intro=$14, description=$15, who_for=$16, learnings=$17,
       frequency=$18, requirements=$19, image_url=$20, status=$21, sort_order=$22
     WHERE id=$23 RETURNING *`,
    [
      data.slug, data.title, data.category, data.audiences, data.levels, data.track, data.level, data.duration,
      data.length, data.price_usd, data.blurb, data.full_blurb, data.icon, data.intro, data.description, data.who_for,
      data.learnings, data.frequency, data.requirements, data.image_url, data.status, data.sort_order, course.id,
    ]
  );
  await recordAudit(req.user.id, "course.update", "course", course.id, { title: row.title });
  res.json(await saveCourseLocale(row));
}

router.post("/:id/save", authRequired, requireRole("admin"), async (req, res) => {
  try {
    await updateCourseRecord(req, res);
  } catch (err) {
    fail(res, err, "Could not update course.");
  }
});

router.post("/:id/delete", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const course = await findCourse(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found." });
    await query("DELETE FROM classes WHERE course_id=$1", [course.id]);
    await query("DELETE FROM teacher_courses WHERE course_id=$1", [course.id]);
    await query("DELETE FROM enrollments WHERE course_id=$1", [course.id]);
    await query("DELETE FROM courses WHERE id=$1", [course.id]);
    await recordAudit(req.user.id, "course.delete", "course", course.id, { title: course.title });
    res.json({ ok: true });
  } catch (err) {
    fail(res, err, "Could not delete course.");
  }
});

router.patch("/:id/status", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const status = STATUSES.includes(req.body?.status) ? req.body.status : "";
    if (!status) return res.status(400).json({ error: "Status must be active or inactive." });
    const course = await findCourse(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found." });
    const row = await queryOne("UPDATE courses SET status=$1 WHERE id=$2 RETURNING *", [status, course.id]);
    await recordAudit(req.user.id, "course.status", "course", course.id, { status });
    res.json(row);
  } catch (err) {
    fail(res, err, "Could not update course status.");
  }
});

router.put("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    await updateCourseRecord(req, res);
  } catch (err) {
    fail(res, err, "Could not update course.");
  }
});

router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const row = await findCourse(req.params.id);
    if (!row) return res.status(404).json({ error: "Course not found." });
    if (row.status !== "active" && req.user?.role !== "admin") {
      return res.status(404).json({ error: "Course not found." });
    }
    res.json(await ensureCourseLocale(row));
  } catch (err) {
    fail(res, err, "Could not load course.");
  }
});

export default router;
