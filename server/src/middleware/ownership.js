import { query, queryOne } from "../db.js";

export async function isAssignedTeacher(teacherId, studentId) {
  const row = await queryOne(
    `SELECT 1
     FROM classes
     WHERE teacher_id=$1 AND student_id=$2
     LIMIT 1`,
    [teacherId, studentId]
  );
  return !!row;
}

export async function canAccessStudent(requestUser, studentId) {
  if (!requestUser) return false;
  if (requestUser.role === "admin") return true;
  if (requestUser.role === "student") return Number(requestUser.id) === Number(studentId);
  if (requestUser.role === "teacher") return isAssignedTeacher(requestUser.id, studentId);
  return false;
}

export async function canAccessTeacher(requestUser, teacherId) {
  if (!requestUser) return false;
  if (requestUser.role === "admin") return true;
  if (requestUser.role === "teacher") return Number(requestUser.id) === Number(teacherId);
  if (requestUser.role === "student") {
    const row = await queryOne(
      `SELECT 1
       FROM classes
       WHERE teacher_id=$1 AND student_id=$2
       LIMIT 1`,
      [teacherId, requestUser.id]
    );
    return !!row;
  }
  return false;
}

export async function ensureStudentAccess(req, res, next) {
  const studentId = Number(req.params.id || req.params.studentId);
  if (!studentId) return res.status(400).json({ error: "Student id is required." });
  if (!(await canAccessStudent(req.user, studentId))) {
    return res.status(403).json({ error: "You do not have access to this student." });
  }
  req.scopeStudentId = studentId;
  next();
}

export async function ensureTeacherAccess(req, res, next) {
  const teacherId = Number(req.params.id || req.params.teacherId);
  if (!teacherId) return res.status(400).json({ error: "Teacher id is required." });
  if (!(await canAccessTeacher(req.user, teacherId))) {
    return res.status(403).json({ error: "You do not have access to this teacher." });
  }
  req.scopeTeacherId = teacherId;
  next();
}

export async function recordAudit(actorUserId, action, targetType, targetId, details = {}) {
  await query(
    `INSERT INTO audit_logs (actor_user_id, action, target_type, target_id, details)
     VALUES ($1,$2,$3,$4,$5)`,
    [actorUserId || null, action, targetType || null, targetId ? String(targetId) : null, JSON.stringify(details)]
  );
}
