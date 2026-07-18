import { redis } from "../config/redis.js";
import { AppError } from "../utils/AppError.js";

// Fixed-window rate limiter keyed by IP + route. 10 requests / 15 min
// matches the spec for /login and /register specifically — pass a
// different `keyPrefix` if you reuse this elsewhere with different limits.
export function rateLimiter({ windowSeconds = 15 * 60, max = 10, keyPrefix }) {
  return async (req, res, next) => {
    try {
      const ip = req.ip;
      const key = `ratelimit:${keyPrefix}:${ip}`;

      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (count > max) {
        throw new AppError("Too many requests — please try again later", 429);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}