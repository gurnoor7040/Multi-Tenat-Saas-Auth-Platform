import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { verifyCsrf } from "../middleware/csrf.js";
import { updateProfileSchema, changePasswordSchema } from "../validators/user.validator.js";

const router = Router();

router.use(authenticate);

router.get("/me", userController.getMe);
router.patch("/me", verifyCsrf, validate(updateProfileSchema), userController.updateMe);
router.post(
  "/change-password",
  verifyCsrf,
  validate(changePasswordSchema),
  userController.changePassword
);
router.get("/orgs", userController.getMyOrgs);

export default router;