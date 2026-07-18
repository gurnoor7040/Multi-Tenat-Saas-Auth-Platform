// Thrown deliberately from services/controllers for expected failure cases
// (bad credentials, expired token, etc.) so errorHandler.js can format them
// consistently and distinguish them from unexpected bugs.
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}