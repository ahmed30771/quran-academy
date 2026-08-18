import jwt from "jsonwebtoken";

const secret = () => process.env.JWT_SECRET || "dev-secret";

export const cookieOpts = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
  path: "/",
  maxAge: 7 * 24 * 3600 * 1000,
};

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, secret(), { expiresIn: "7d" });
}

export function readToken(req) {
  const header = req.headers.authorization || "";
  return req.cookies?.token || (header.startsWith("Bearer ") ? header.slice(7) : "");
}

export function authRequired(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: "Please sign in." });
  try {
    req.user = jwt.verify(token, secret());
    next();
  } catch {
    return res.status(401).json({ error: "Session expired. Please sign in again." });
  }
}

export function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) return next();
  try {
    req.user = jwt.verify(token, secret());
  } catch {
    req.user = null;
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Not allowed." });
    }
    next();
  };
}

export function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
    phoneNumber: row.phone_number,
    dateOfBirth: row.date_of_birth,
    preferredLanguage: row.preferred_language,
    timezone: row.timezone,
    avatar: row.avatar,
    bio: row.bio,
    qualifications: row.qualifications,
    experience: row.experience,
    subjects: row.subjects,
    availableTimes: row.available_times,
    introduction: row.introduction,
    privacy: row.privacy,
    showEmail: !!row.show_email,
    emailNotif: !!row.email_notif,
    waNotif: !!row.wa_notif,
    gender: row.gender || "",
    teachingLanguages: row.teaching_languages || "",
    teachKids: !!row.teach_kids,
    teachAdults: !!row.teach_adults,
    status: row.status,
  };
}
