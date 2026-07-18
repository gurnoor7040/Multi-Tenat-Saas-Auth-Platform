import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

// Runs on every /api/org/:slug/* route, after authenticate(). Resolves
// the org from the slug and the current user's membership in it, and
// attaches both to req so downstream handlers (and requireRole) don't
// need to re-query. A missing membership means the user isn't in this
// org at all — treated as 404, not 403, so org existence isn't leaked
// to users who aren't members of it.
export async function attachOrgContext(req, res, next) {
  try {
    const { slug } = req.params;

    const org = await prisma.organization.findUnique({ where: { slug } });
    if (!org) {
      throw new AppError("Organization not found", 404);
    }

    const membership = await prisma.membership.findUnique({
      where: { userId_orgId: { userId: req.user.id, orgId: org.id } },
    });
    if (!membership) {
      throw new AppError("Organization not found", 404);
    }

    req.org = org;
    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
}