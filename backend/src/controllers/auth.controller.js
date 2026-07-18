import * as authService from "../services/auth.service.js";
import {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from "../services/token.service.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
} from "../utils/cookieOptions.js";
import { env } from "../config/env.js";

// Small helper — one place that sets both auth cookies after a
// successful login/register/refresh, so the pair never drifts out of sync.
async function issueSessionCookies(res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user.id);

  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
}

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  res.status(201).json({
    message: "Registration successful. Please check your email to verify your account.",
    user: { id: user.id, name: user.name, email: user.email },
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  await authService.verifyEmail(token);
  res.status(200).json({ message: "Email verified successfully. You can now log in." });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.validateCredentials(email, password);

  await issueSessionCookies(res, user);

  res.status(200).json({
    user: { id: user.id, name: user.name, email: user.email },
  });
});

// req.user here is set by Passport (see passport.js strategies), not by
// our own authenticate middleware — it's the User record Passport
// resolved after a successful Google/GitHub handshake. From this point
// on, OAuth users get the exact same cookie-based session as
// email/password users.
export const oauthCallback = asyncHandler(async (req, res) => {
  await issueSessionCookies(res, req.user);
  res.redirect(`${env.clientUrl}/dashboard`);
});

export const refresh = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  const { user, newRawToken } = await rotateRefreshToken(rawRefreshToken);

  const accessToken = signAccessToken(user);
  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", newRawToken, refreshTokenCookieOptions);

  res.status(200).json({ message: "Token refreshed" });
});

export const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  await revokeRefreshToken(rawRefreshToken);

  res.clearCookie("accessToken", clearCookieOptions);
  res.clearCookie("refreshToken", { ...clearCookieOptions, path: "/api/auth" });

  res.status(200).json({ message: "Logged out" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.requestPasswordReset(email);

  // Same response whether or not the email exists — see auth.service.js
  res.status(200).json({
    message: "If an account with that email exists, a reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  res.status(200).json({ message: "Password reset successfully. Please log in again." });
});