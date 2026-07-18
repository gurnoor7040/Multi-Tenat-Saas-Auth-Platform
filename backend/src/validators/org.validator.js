import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().trim().min(2, "Org name must be at least 2 characters").max(100),
});

export const updateOrgSchema = z.object({
  name: z.string().trim().min(2, "Org name must be at least 2 characters").max(100),
});

export const changeRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"], {
    errorMap: () => ({ message: "Role must be ADMIN, MEMBER, or VIEWER" }),
  }),
});