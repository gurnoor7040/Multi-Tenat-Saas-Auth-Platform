import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import * as orgApi from "../api/org.api";
import { useOrg } from "../hooks/useOrg";
import { useRole } from "../hooks/useRole";
import { canEditOrgSettings, canDeleteOrg } from "../lib/permissions";

export default function OrgSettings() {
  const { activeOrg, refreshOrgs } = useOrg();
  const role = useRole();
  const navigate = useNavigate();

  const [name, setName] = useState(activeOrg?.name || "");
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!activeOrg) return null;

  if (!canEditOrgSettings(role)) {
    return (
      <div>
        <Navbar />
        <p className="p-8 text-sm text-slate-500">
          Only an Admin can view organization settings.
        </p>
      </div>
    );
  }

  async function handleRename(e) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await orgApi.updateOrg(activeOrg.slug, { name });
      await refreshOrgs();
    } catch (err) {
      setError(err.response?.data?.error || "Could not update organization");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${activeOrg.name}"? This can't be undone.`)) return;
    await orgApi.deleteOrg(activeOrg.slug);
    await refreshOrgs();
    navigate("/dashboard", { replace: true });
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-lg space-y-8 p-8">
        <h1 className="text-xl font-semibold text-slate-900">Organization settings</h1>

        <form onSubmit={handleRename} className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <label className="block text-sm font-medium text-slate-700">Organization name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Save changes
          </button>
        </form>

        {canDeleteOrg(role) && (
          <div className="rounded-md border border-red-200 p-4">
            <h2 className="text-sm font-medium text-red-700">Danger zone</h2>
            <p className="mt-1 text-sm text-slate-500">
              Deleting an organization removes all members and invites permanently.
            </p>
            <button
              onClick={handleDelete}
              className="mt-3 rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
            >
              Delete organization
            </button>
          </div>
        )}
      </div>
    </div>
  );
}