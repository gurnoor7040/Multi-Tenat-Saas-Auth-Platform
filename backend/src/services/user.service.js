import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { getUserOrgs } from "./org.service.js";

const SALT_ROUNDS = 12;

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, isVerified: true, createdAt: true },
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
}

export async function updateProfile(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true },
  });
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) {
    throw new AppError("Password change isn't available for OAuth-only accounts", 400);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Current password is incorrect", 401);
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  // Same reasoning as reset-password: a changed password should
  // invalidate every existing session, forcing re-login everywhere.
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}

export { getUserOrgs };