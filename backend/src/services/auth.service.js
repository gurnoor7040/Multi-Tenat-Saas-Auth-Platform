import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.service.js";
import {
  issueVerificationToken,
  consumeVerificationToken,
} from "./token.service.js";

const SALT_ROUNDS = 12;
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function registerUser({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const token = await issueVerificationToken(user.id, "EMAIL", ONE_HOUR_MS);
  await sendVerificationEmail(user.email, token);

  return user;
}

export async function verifyEmail(rawToken) {
  const record = await consumeVerificationToken(rawToken, "EMAIL");

  const user = await prisma.user.update({
    where: { id: record.userId },
    data: { isVerified: true },
  });

  return user;
}

export async function validateCredentials(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Same error for "no such user" and "wrong password" — don't leak
  // which one it was, that tells an attacker whether an email is registered.
  if (!user || !user.passwordHash) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isVerified) {
    throw new AppError("Please verify your email before logging in", 403);
  }

  return user;
}

// Called from Passport strategies (passport.js) after Google/GitHub
// confirms identity. If the email already has an account (e.g. they
// originally signed up with a password), OAuth just logs them into that
// same account — same principle as most SaaS products, one identity per
// email regardless of login method. New OAuth users are auto-verified,
// since the provider has already confirmed the email on our behalf.
export async function findOrCreateOAuthUser({ email, name }) {
  if (!email) {
    throw new AppError("This provider did not return an email address", 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  return prisma.user.create({
    data: { email, name, isVerified: true }, // passwordHash left null — OAuth-only account
  });
}

export async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always resolve successfully even if the user doesn't exist —
  // prevents leaking which emails are registered via response timing/content.
  if (!user) return;

  const token = await issueVerificationToken(user.id, "PASSWORD_RESET", ONE_HOUR_MS);
  await sendPasswordResetEmail(user.email, token);
}

export async function resetPassword(rawToken, newPassword) {
  const record = await consumeVerificationToken(rawToken, "PASSWORD_RESET");

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });

  // Invalidate all existing sessions on password change — a leaked
  // refresh token becomes useless the moment the password is reset.
  await prisma.refreshToken.updateMany({
    where: { userId: record.userId, revoked: false },
    data: { revoked: true },
  });
}