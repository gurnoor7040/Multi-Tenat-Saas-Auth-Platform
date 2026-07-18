import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useOrg } from "../hooks/useOrg";
import { canInviteMembers, canEditOrgSettings } from "../lib/permissions";

export default function Dashboard() {
  const { user } = useAuth();
  const { activeOrg, isLoading } = useOrg();

  return (
    <div>
      <Navbar />
      <div className="p-8">
        <h1 className="text-xl font-semibold text-slate-900">Welcome, {user?.name}</h1>

        {isLoading && <p className="mt-2 text-sm text-slate-500">Loading…</p>}

        {!isLoading && !activeOrg && (
          <div className="mt-4">
            <p className="text-sm text-slate-500">You're not part of an organization yet.</p>
            <Link
              to="/org/create"
              className="mt-2 inline-block rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Create one
            </Link>
          </div>
        )}

        {activeOrg && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-slate-500">
              Active org: <span className="font-medium text-slate-700">{activeOrg.name}</span>{" "}
              — role: {activeOrg.role}
            </p>
            <div className="flex gap-4 text-sm">
              <Link to={`/org/${activeOrg.slug}/members`} className="text-slate-900 underline">
                Members
              </Link>
              {canInviteMembers(activeOrg.role) && (
                <Link to={`/org/${activeOrg.slug}/invite`} className="text-slate-900 underline">
                  Invite people
                </Link>
              )}
              {canEditOrgSettings(activeOrg.role) && (
                <Link to={`/org/${activeOrg.slug}/settings`} className="text-slate-900 underline">
                  Org settings
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}