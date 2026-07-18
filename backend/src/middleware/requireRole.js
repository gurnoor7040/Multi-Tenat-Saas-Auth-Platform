import { AppError } from "../utils/AppError.js";

// Must run AFTER attachOrgContext (needs req.membership). Pass the roles
// allowed to access a route — this is the actual enforcement point for
// the permissions table in the spec; the frontend's permissions.js only
// hides buttons, it grants nothing on its own.
//
// Usage: requireRole(["ADMIN"])            -> Admin only
//        requireRole(["ADMIN", "MEMBER"])  -> Admin or Member
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.membership) {
      return next(new AppError("Organization context missing", 500));
    }

    if (!allowedRoles.includes(req.membership.role)) {
      return next(new AppError("You don't have permission to perform this action", 403));
    }

    next();
  };
}