// backend/utils/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true", // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendVerificationEmail(toEmail, token) {
  const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;
  const info = await transporter.sendMail({
    from: `"QuickTask" <${process.env.SMTP_FROM || "no-reply@QuickTask.com"}>`,
    to: toEmail,
    subject: "Verify your email",
    html: `<p>Please verify your email by clicking <a href="${verifyUrl}">here</a>. This link expires in 24 hours.</p>`
  });
  return info;
}

module.exports = sendVerificationEmail;