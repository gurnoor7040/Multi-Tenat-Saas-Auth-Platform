import { env } from "../config/env.js";

const base = {
  httpOnly: true,
  secure: env.cookieSecure, // must be true in production — required for sameSite: "none"
  // "none" is required when frontend (Vercel) and backend (Render) are on
  // different domains — the browser won't send a "lax"/"strict" cookie
  // cross-site even with credentials: true. Locally, both run on
  // localhost so "lax" works and avoids needing HTTPS in dev.
  sameSite: env.cookieSecure ? "none" : "lax",
  path: "/",
};

export const accessTokenCookieOptions = {
  ...base,
  maxAge: 15 * 60 * 1000, // 15 minutes — keep in sync with JWT_ACCESS_EXPIRES_IN
};

export const refreshTokenCookieOptions = {
  ...base,
  maxAge: env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
  path: "/api/auth", // only sent on auth routes (refresh/logout), reduces exposure
};

export const clearCookieOptions = {
  ...base,
};