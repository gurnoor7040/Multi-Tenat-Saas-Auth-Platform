import * as inviteService from "../services/invite.service.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Admin-only, org-scoped (req.org attached by attachOrgContext)
export const createInvite = asyncHandler(async (req, res) => {
  const { role, expiresInHours } = req.body;
  const invite = await inviteService.createInvite(
    req.org.id,
    role,
    req.user.id,
    expiresInHours
  );
  res.status(201).json({ invite });
});

export const listInvites = asyncHandler(async (req, res) => {
  const invites = await inviteService.listActiveInvites(req.org.id);
  res.status(200).json({ invites });
});

export const revokeInvite = asyncHandler(async (req, res) => {
  const { inviteId } = req.params;
  await inviteService.revokeInvite(req.org.id, inviteId);
  res.status(200).json({ message: "Invite revoked" });
});

// Public-ish: only requires the user to be logged in (authenticate),
// no org membership yet — that's what this route grants.
export const acceptInvite = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const org = await inviteService.acceptInvite(token, req.user.id);
  res.status(200).json({
    message: `You've joined ${org.name}`,
    org,
  });
});