import { Router } from "express";
import * as inviteController from "../controllers/invite.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { verifyCsrf } from "../middleware/csrf.js";

// Separate from invite.routes.js because it lives at a different URL
// prefix (/api/invite/:token/accept, not /api/org/:slug/...) and needs
// no org context — the token itself is what resolves the org. Only
// requires the user to be logged in first, per spec.
const router = Router();

router.post("/:token/accept", authenticate, verifyCsrf, inviteController.acceptInvite);

export default router;