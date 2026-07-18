import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { generateUniqueSlug } from "../utils/generateSlug.js";

export async function createOrg(userId, name) {
  const slug = await generateUniqueSlug(name);

  // Org creation + auto-admin membership must succeed or fail together —
  // a transaction prevents an org existing with zero members if the
  // second write fails.
  const org = await prisma.$transaction(async (tx) => {
    const newOrg = await tx.organization.create({ data: { name, slug } });
    await tx.membership.create({
      data: { userId, orgId: newOrg.id, role: "ADMIN" },
    });
    return newOrg;
  });

  return org;
}

export async function getOrgBySlug(slug) {
  const org = await prisma.organization.findUnique({ where: { slug } });
  if (!org) throw new AppError("Organization not found", 404);
  return org;
}

export async function updateOrg(orgId, data) {
  return prisma.organization.update({ where: { id: orgId }, data });
}

export async function deleteOrg(orgId) {
  // Memberships/invites cascade-delete via the schema's onDelete: Cascade
  await prisma.organization.delete({ where: { id: orgId } });
}

export async function listMembers(orgId) {
  const memberships = await prisma.membership.findMany({
    where: { orgId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });

  return memberships.map((m) => ({
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    joinedAt: m.joinedAt,
  }));
}

export async function changeMemberRole(orgId, targetUserId, newRole, actingUserId) {
  const targetMembership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: targetUserId, orgId } },
  });

  if (!targetMembership) {
    throw new AppError("This user is not a member of this organization", 404);
  }

  if (targetUserId === actingUserId && newRole !== "ADMIN") {
    // Prevents an Admin from accidentally locking themselves out with
    // no other Admin left to reverse it.
    const adminCount = await prisma.membership.count({ where: { orgId, role: "ADMIN" } });
    if (adminCount <= 1) {
      throw new AppError("You can't demote yourself as the org's only Admin", 400);
    }
  }

  return prisma.membership.update({
    where: { userId_orgId: { userId: targetUserId, orgId } },
    data: { role: newRole },
  });
}

export async function removeMember(orgId, targetUserId, actingUserId) {
  if (targetUserId === actingUserId) {
    throw new AppError("You can't remove yourself from the organization this way", 400);
  }

  const targetMembership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: targetUserId, orgId } },
  });

  if (!targetMembership) {
    throw new AppError("This user is not a member of this organization", 404);
  }

  await prisma.membership.delete({
    where: { userId_orgId: { userId: targetUserId, orgId } },
  });
}

export async function getUserOrgs(userId) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { org: true },
    orderBy: { joinedAt: "asc" },
  });

  return memberships.map((m) => ({
    id: m.org.id,
    name: m.org.name,
    slug: m.org.slug,
    logo: m.org.logo,
    role: m.role,
  }));
}