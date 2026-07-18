import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { hashToken, generateRawToken } from "../utils/hashToken.js";
import { AppError } from "../utils/AppError.js";

// ---------- Access tokens (JWT, short-lived, stateless) ----------

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.jwtAccessSecret);
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }
}

// ---------- Refresh tokens (opaque random string, stateful — stored hashed in DB) ----------

export async function issueRefreshToken(userId) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000
  );

  await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt },
  });

  return rawToken; // raw value goes in the cookie; only the hash is stored
}

// Validates the incoming refresh token, then rotates it:
// revokes the old one and issues a brand new one. If a revoked/unknown
// token is presented, it's treated as a possible replay attack.
export async function rotateRefreshToken(rawToken) {
  if (!rawToken) throw new AppError("Refresh token missing", 401);

  const tokenHash = hashToken(rawToken);
  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!existing) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (existing.revoked || existing.expiresAt < new Date()) {
    // Token reuse after revocation/expiry — invalidate all of this
    // user's refresh tokens as a precaution against token theft.
    await prisma.refreshToken.updateMany({
      where: { userId: existing.userId, revoked: false },
      data: { revoked: true },
    });
    throw new AppError("Refresh token expired or already used — please log in again", 401);
  }

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revoked: true },
  });

  const newRawToken = await issueRefreshToken(existing.userId);

  return { user: existing.user, newRawToken };
}

export async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}

// ---------- Verification / password-reset tokens ----------

export async function issueVerificationToken(userId, type, expiresInMs) {
  const rawToken = generateRawToken();
  await prisma.verificationToken.create({
    data: {
      token: rawToken, // not hashed: single-use + short expiry + emailed directly, lower risk than a long-lived refresh token
      userId,
      type,
      expiresAt: new Date(Date.now() + expiresInMs),
    },
  });
  return rawToken;
}

export async function consumeVerificationToken(rawToken, type) {
  const record = await prisma.verificationToken.findUnique({
    where: { token: rawToken },
  });

  if (!record || record.type !== type) {
    throw new AppError("Invalid or unknown token", 400);
  }
  if (record.used) {
    throw new AppError("This token has already been used", 400);
  }
  if (record.expiresAt < new Date()) {
    throw new AppError("This token has expired", 400);
  }

  await prisma.verificationToken.update({
    where: { id: record.id },
    data: { used: true },
  });

  return record;
}