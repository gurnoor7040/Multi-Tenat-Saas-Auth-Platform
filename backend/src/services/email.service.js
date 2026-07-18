import { Resend } from "resend";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const resend = new Resend(env.resendApiKey);

export async function sendVerificationEmail(toEmail, token) {
  const link = `${env.clientUrl}/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to: toEmail,
    subject: "Verify your email",
    html: `
      <p>Welcome! Please verify your email address to activate your account.</p>
      <p><a href="${link}">Verify email</a></p>
      <p>This link expires in 1 hour. If you didn't create this account, ignore this email.</p>
    `,
  });

  if (error) {
    logger.error("Failed to send verification email", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendPasswordResetEmail(toEmail, token) {
  const link = `${env.clientUrl}/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to: toEmail,
    subject: "Reset your password",
    html: `
      <p>We received a request to reset your password.</p>
      <p><a href="${link}">Reset password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    logger.error("Failed to send password reset email", error);
    throw new Error("Failed to send password reset email");
  }
}