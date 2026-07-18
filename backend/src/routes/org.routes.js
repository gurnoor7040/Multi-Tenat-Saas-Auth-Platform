import { Router } from "express";
import * as orgController from "../controllers/org.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { attachOrgContext } from "../middleware/orgContext.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { verifyCsrf } from "../middleware/csrf.js";
import {
  createOrgSchema,
  updateOrgSchema,
  changeRoleSchema,
} from "../validators/org.validator.js";

const router = Router();

// Every org route requires a logged-in user
router.use(authenticate);

const ANY_ROLE = ["ADMIN", "MEMBER", "VIEWER"];
const ADMIN_ONLY = ["ADMIN"];

router.post("/create", verifyCsrf, validate(createOrgSchema), orgController.createOrg);

router.get("/:slug", attachOrgContext, requireRole(ANY_ROLE), orgController.getOrg);

router.patch(
  "/:slug",
  attachOrgContext,
  requireRole(ADMIN_ONLY),
  verifyCsrf,
  validate(updateOrgSchema),
  orgController.updateOrg
);

router.delete(
  "/:slug",
  attachOrgContext,
  requireRole(ADMIN_ONLY),
  verifyCsrf,
  orgController.deleteOrg
);

router.get(
  "/:slug/members",
  attachOrgContext,
  requireRole(ANY_ROLE),
  orgController.listMembers
);

router.patch(
  "/:slug/members/:userId/role",
  attachOrgContext,
  requireRole(ADMIN_ONLY),
  verifyCsrf,
  validate(changeRoleSchema),
  orgController.changeMemberRole
);

router.delete(
  "/:slug/members/:userId",
  attachOrgContext,
  requireRole(ADMIN_ONLY),
  verifyCsrf,
  orgController.removeMember
);

export default router;