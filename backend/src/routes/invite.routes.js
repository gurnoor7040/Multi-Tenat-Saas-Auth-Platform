import { Router } from "express";
import * as inviteController from "../controllers/invite.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { attachOrgContext } from "../middleware/orgContext.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { verifyCsrf } from "../middleware/csrf.js";
import { createInviteSchema } from "../validators/invite.validator.js";

// Mounted at app.use("/api/org", inviteRoutes) — alongside org.routes.js,
// which is why paths here start with "/:slug/invite..." rather than
// repeating "/org". Both routers share the same URL prefix.
const router = Router();

router.use(authenticate);

const ADMIN_ONLY = ["ADMIN"];

router.post(
  "/:slug/invite",
  attachOrgContext,
  requireRole(ADMIN_ONLY),
  verifyCsrf,
  validate(createInviteSchema),
  inviteController.createInvite
);

router.get(
  "/:slug/invites",
  attachOrgContext,
  requireRole(ADMIN_ONLY),
  inviteController.listInvites
);

router.delete(
  "/:slug/invites/:inviteId",
  attachOrgContext,
  requireRole(ADMIN_ONLY),
  verifyCsrf,
  inviteController.revokeInvite
);

export default router;