import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

// Accepts either "email@domain.com" or "Display Name <email@domain.com>".
function parseSender(emailFrom) {
  const match = emailFrom.match(/^(.*)<(.+)>$/);
  if (match) {
    return { name: match[1].trim() || undefined, email: match[2].trim() };
  }
  return { email: emailFrom.trim() };
}

const sender = parseSender(env.emailFrom);

async function send({ to, subject, html }) {
  const res = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": env.brevoApiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo request failed (${res.status}): ${body}`);
  }
}

export async function sendVerificationEmail(toEmail, token) {
  const link = `${env.clientUrl}/verify-email?token=${token}`;

  try {
    await send({
      to: toEmail,
      subject: "Verify your email",
      html: `
        <p>Welcome! Please verify your email address to activate your account.</p>
        <p><a href="${link}">Verify email</a></p>
        <p>This link expires in 1 hour. If you didn't create this account, ignore this email.</p>
      `,
    });
  } catch (error) {
    logger.error("Failed to send verification email", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendPasswordResetEmail(toEmail, token) {
  const link = `${env.clientUrl}/reset-password?token=${token}`;

  try {
    await send({
      to: toEmail,
      subject: "Reset your password",
      html: `
        <p>We received a request to reset your password.</p>
        <p><a href="${link}">Reset password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      `,
    });
  } catch (error) {
    logger.error("Failed to send password reset email", error);
    throw new Error("Failed to send password reset email");
  }
}
