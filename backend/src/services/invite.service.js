import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { generateRawToken } from "../utils/hashToken.js";

// Invite tokens are stored raw (not hashed) — same reasoning as
// verification tokens: they're single-use, short-lived (24-72hr), and
// only ever transmitted via a link the Admin shares directly, unlike a
// refresh token that persists in a cookie for days.
export async function createInvite(orgId, role, createdBy, expiresInHours) {
  const token = generateRawToken();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const invite = await prisma.inviteToken.create({
    data: { token, orgId, role, expiresAt, createdBy },
  });

  return invite;
}

export async function listActiveInvites(orgId) {
  return prisma.inviteToken.findMany({
    where: {
      orgId,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeInvite(orgId, inviteId) {
  const invite = await prisma.inviteToken.findUnique({ where: { id: inviteId } });

  if (!invite || invite.orgId !== orgId) {
    throw new AppError("Invite not found", 404);
  }
  if (invite.used) {
    throw new AppError("This invite has already been accepted and can't be revoked", 400);
  }

  await prisma.inviteToken.delete({ where: { id: inviteId } });
}

export async function acceptInvite(rawToken, userId) {
  const invite = await prisma.inviteToken.findUnique({ where: { token: rawToken } });

  if (!invite) {
    throw new AppError("This invite link is invalid", 400);
  }
  if (invite.used) {
    throw new AppError("This invite link has already been used", 400);
  }
  if (invite.expiresAt < new Date()) {
    throw new AppError("This invite link has expired", 400);
  }

  const existingMembership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId, orgId: invite.orgId } },
  });
  if (existingMembership) {
    throw new AppError("You're already a member of this organization", 400);
  }

  // Marking the token used and creating the membership must succeed
  // together — otherwise a failure mid-way could either leave the
  // invite reusable or create a member with no accepted-invite record.
  const org = await prisma.$transaction(async (tx) => {
    await tx.inviteToken.update({
      where: { id: invite.id },
      data: { used: true },
    });

    await tx.membership.create({
      data: { userId, orgId: invite.orgId, role: invite.role },
    });

    return tx.organization.findUnique({ where: { id: invite.orgId } });
  });

  return org;
}