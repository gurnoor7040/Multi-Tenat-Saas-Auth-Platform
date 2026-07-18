import { verifyAccessToken } from "../services/token.service.js";
import { AppError } from "../utils/AppError.js";

// Runs on every protected route. Reads the access token from the httpOnly
// cookie (never from an Authorization header for this project — cookies
// only, per spec), verifies it, and attaches the identity to req.user.
// Does NOT hit the DB — access tokens are stateless by design, which is
// exactly why they're short-lived (15min) and paired with a revocable
// refresh token for anything longer-lived.
export function authenticate(req, res, next) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new AppError("Not authenticated", 401));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    next(err);
  }
}