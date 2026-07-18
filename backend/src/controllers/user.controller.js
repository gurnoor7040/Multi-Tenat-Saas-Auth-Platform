import * as userService from "../services/user.service.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  res.status(200).json({ user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  res.status(200).json({ user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user.id, currentPassword, newPassword);
  res.status(200).json({ message: "Password changed. Please log in again." });
});

// Powers the org-switcher — every org the user belongs to, with their role in each
export const getMyOrgs = asyncHandler(async (req, res) => {
  const orgs = await userService.getUserOrgs(req.user.id);
  res.status(200).json({ orgs });
});