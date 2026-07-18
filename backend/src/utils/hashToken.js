import crypto from "crypto";

// Refresh tokens and verification tokens are stored hashed in the DB —
// same principle as password hashing: if the DB leaks, raw tokens
// (which act like passwords) aren't exposed. SHA-256 is fine here
// (not bcrypt) because these are high-entropy random tokens, not
// low-entropy human passwords — no need for slow hashing to resist brute force.
export function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

// Generates a high-entropy random token for refresh/verification/invite tokens
export function generateRawToken() {
  return crypto.randomBytes(40).toString("hex");
}