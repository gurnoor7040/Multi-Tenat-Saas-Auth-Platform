import { Router } from "express";
import passport from "../config/passport.js";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { env } from "../config/env.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

const authRateLimiter = rateLimiter({ keyPrefix: "auth", max: 10, windowSeconds: 15 * 60 });

router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post(
  "/forgot-password",
  authRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

// --- OAuth ---
// session: false on every call — Passport only performs the handshake;
// oauthCallback then issues our own JWT/refresh-token cookies exactly
// like the email/password login path.

router.get(
  "/oauth/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/oauth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.clientUrl}/login?error=oauth_failed`,
  }),
  authController.oauthCallback
);

router.get(
  "/oauth/github",
  passport.authenticate("github", { scope: ["user:email"], session: false })
);
router.get(
  "/oauth/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${env.clientUrl}/login?error=oauth_failed`,
  }),
  authController.oauthCallback
);

export default router;