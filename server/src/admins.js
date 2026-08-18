import bcrypt from "bcryptjs";
import { query } from "./db.js";

const ROUNDS = 12;

export const ADMIN_ACCOUNTS = [
  { email: "admin@quranacademy.example", name: "Academy Admin" },
  { email: "support@bluexech.com", name: "Bluexech Admin" },
];

function extraAdminEmails() {
  return String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return false;
  if (ADMIN_ACCOUNTS.some((item) => item.email === normalized)) return true;
  return extraAdminEmails().includes(normalized);
}

export async function ensureAdminAccounts() {
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "password123", ROUNDS);
  const extras = extraAdminEmails()
    .filter((email) => !ADMIN_ACCOUNTS.some((item) => item.email === email))
    .map((email) => ({ email, name: "Academy Admin" }));
  for (const account of [...ADMIN_ACCOUNTS, ...extras]) {
    await query(
      `INSERT INTO users (role, name, email, password_hash, bio, status)
       VALUES ('admin', $1, $2, $3, 'Academy staff.', 'active')
       ON CONFLICT (email) DO UPDATE SET role='admin', status='active'`,
      [account.name, account.email, hash]
    );
  }
}
