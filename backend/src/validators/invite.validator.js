import { z } from "zod";

export const createInviteSchema = z.object({
  role: z.enum(["MEMBER", "VIEWER"], {
    errorMap: () => ({ message: "Invite role must be MEMBER or VIEWER" }),
  }),
  // Spec allows 24-72hr expiry window; default to 24 if not specified
  expiresInHours: z
    .number()
    .int()
    .min(24, "Minimum invite expiry is 24 hours")
    .max(72, "Maximum invite expiry is 72 hours")
    .optional()
    .default(24),
});