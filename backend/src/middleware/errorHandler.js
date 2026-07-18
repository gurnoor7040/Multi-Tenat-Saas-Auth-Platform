import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

// Must be registered LAST, after all routes. Any next(err) call, or any
// thrown error in an async route handler, ends up here.
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  if (!isOperational) {
    // Unexpected bug, not a deliberate AppError — log full detail
    logger.error(err);
  }

  res.status(statusCode).json({
    error: isOperational ? err.message : "Something went wrong",
    ...(env.nodeEnv === "development" && !isOperational ? { stack: err.stack } : {}),
  });
}

// Wraps async route handlers so thrown errors/rejected promises are
// forwarded to errorHandler instead of crashing the process unhandled.
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}