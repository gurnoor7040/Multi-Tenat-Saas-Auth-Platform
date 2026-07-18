import crypto from "crypto";
import { AppError } from "../utils/AppError.js";
import { clearCookieOptions } from "../utils/cookieOptions.js";

// Double-submit cookie pattern: a non-httpOnly CSRF cookie is readable by
// frontend JS, which must echo its value back in an X-CSRF-Token header
// on every mutating request. A cross-site form/script can trigger the
// cookie to be sent automatically, but can't read it to set the header —
// so a mismatch means the request didn't originate from your own frontend.

export function issueCsrfCookie(req, res, next) {
  const token = crypto.randomBytes(24).toString("hex");
  res.cookie("csrfToken", token, {
    ...clearCookieOptions,
    httpOnly: false, // must be readable by frontend JS
  });
  next();
}

export function verifyCsrf(req, res, next) {
  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new AppError("Invalid CSRF token", 403));
  }

  next();
}