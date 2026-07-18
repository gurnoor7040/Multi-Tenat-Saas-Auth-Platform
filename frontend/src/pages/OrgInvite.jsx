import Navbar from "../components/layout/Navbar";
import InviteList from "../components/org/InviteList";
import { useOrg } from "../hooks/useOrg";
import { useRole } from "../hooks/useRole";
import { canInviteMembers } from "../lib/permissions";

export default function OrgInvite() {
  const { activeOrg } = useOrg();
  const role = useRole();

  if (!activeOrg) return null;

  if (!canInviteMembers(role)) {
    return (
      <div>
        <Navbar />
        <p className="p-8 text-sm text-slate-500">Only an Admin can manage invites.</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="mb-6 text-xl font-semibold text-slate-900">
          Invite people — {activeOrg.name}
        </h1>
        <InviteList slug={activeOrg.slug} />
      </div>
    </div>
  );
}