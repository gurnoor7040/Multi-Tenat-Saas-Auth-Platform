import * as orgService from "../services/org.service.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const createOrg = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const org = await orgService.createOrg(req.user.id, name);
  res.status(201).json({ org });
});

// req.org is attached by attachOrgContext — no re-fetch needed
export const getOrg = asyncHandler(async (req, res) => {
  res.status(200).json({ org: req.org, role: req.membership.role });
});

export const updateOrg = asyncHandler(async (req, res) => {
  const updated = await orgService.updateOrg(req.org.id, req.body);
  res.status(200).json({ org: updated });
});

export const deleteOrg = asyncHandler(async (req, res) => {
  await orgService.deleteOrg(req.org.id);
  res.status(200).json({ message: "Organization deleted" });
});

export const listMembers = asyncHandler(async (req, res) => {
  const members = await orgService.listMembers(req.org.id);
  res.status(200).json({ members });
});

export const changeMemberRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const updated = await orgService.changeMemberRole(req.org.id, userId, role, req.user.id);
  res.status(200).json({ membership: updated });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await orgService.removeMember(req.org.id, userId, req.user.id);
  res.status(200).json({ message: "Member removed" });
});