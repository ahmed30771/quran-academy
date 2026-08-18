import nodemailer from "nodemailer";

export async function sendMail({ to, subject, text, html }) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.log(`[mail] ${subject}\nTo: ${to}\n${text}`);
    return { sent: false };
  }
  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER || "Quran Academy <noreply@localhost>",
    to,
    subject,
    text,
    html,
  });
  return { sent: true };
}
