const LATIN_NAME = /^[A-Za-z]+(?: [A-Za-z]+)+$/;
const URDU_NAME = /^[\u0600-\u065F\u066E-\u06D3\u06D5\u06EE-\u06FF\u0750-\u077F]+(?:\s+[\u0600-\u065F\u066E-\u06D3\u06D5\u06EE-\u06FF\u0750-\u077F]+)+$/;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function normalizeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

export function validatePersonName(name) {
  const value = normalizeName(name);
  if (!value) return "Please enter your full name.";
  if (/[0-9\u0660-\u0669\u06F0-\u06F9]/.test(value)) return "Name cannot contain numbers.";
  const hasLatin = /[A-Za-z]/.test(value);
  const hasUrdu = /[\u0600-\u06FF]/.test(value);
  if (hasLatin && hasUrdu) return "Use either English or Urdu letters, not both.";
  if (hasLatin && !LATIN_NAME.test(value)) return "English name: letters only, first and last name, no special characters.";
  if (hasUrdu && !URDU_NAME.test(value)) return "Urdu name: letters only, first and last name, no special characters.";
  if (!hasLatin && !hasUrdu) return "Name may use English or Urdu letters only.";
  return "";
}

export function validateEmail(email) {
  const value = String(email || "").trim().toLowerCase();
  if (!value) return "Please enter your email.";
  if (!value.includes("@") || !EMAIL_RE.test(value)) return "Enter a valid email with @ and a domain, such as name@email.com.";
  return "";
}

export function validatePassword(password) {
  if (!password) return "Please enter a password.";
  if (String(password).length < 8) return "Password must be at least 8 characters.";
  return "";
}
