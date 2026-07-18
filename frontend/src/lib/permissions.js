// UX ONLY. This does not enforce anything — it just decides what to show
// or hide. The actual enforcement lives in the backend's requireRole.js
// middleware; a user could bypass every check below by calling the API
// directly, and the backend must (and does) reject them there.

const PERMISSIONS = {
  ADMIN: new Set([
    "invite_members",
    "revoke_invites",
    "remove_members",
    "change_member_roles",
    "view_member_list",
    "access_org_dashboard",
    "edit_org_settings",
    "delete_org",
  ]),
  MEMBER: new Set(["view_member_list", "access_org_dashboard"]),
  VIEWER: new Set(["view_member_list", "access_org_dashboard"]),
};

export function can(role, permission) {
  if (!role) return false;
  return PERMISSIONS[role]?.has(permission) ?? false;
}

export const canInviteMembers = (role) => can(role, "invite_members");
export const canRevokeInvites = (role) => can(role, "revoke_invites");
export const canRemoveMembers = (role) => can(role, "remove_members");
export const canChangeMemberRoles = (role) => can(role, "change_member_roles");
export const canEditOrgSettings = (role) => can(role, "edit_org_settings");
export const canDeleteOrg = (role) => can(role, "delete_org");