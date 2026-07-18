import { useEffect, useState } from "react";
import * as inviteApi from "../../api/invite.api";

export default function InviteList({ slug }) {
  const [invites, setInvites] = useState([]);
  const [role, setRole] = useState("MEMBER");
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  async function loadInvites() {
    const { data } = await inviteApi.listInvites(slug);
    setInvites(data.invites);
  }

  useEffect(() => {
    loadInvites();
  }, [slug]);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    setIsCreating(true);
    try {
      await inviteApi.createInvite(slug, { role, expiresInHours: Number(expiresInHours) });
      loadInvites();
    } catch (err) {
      setError(err.response?.data?.error || "Could not create invite");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRevoke(inviteId) {
    await inviteApi.revokeInvite(slug, inviteId);
    loadInvites();
  }

  function inviteLink(token) {
    return `${window.location.origin}/invite/${token}`;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="MEMBER">Member</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500">Expires (hours)</label>
          <input
            type="number"
            min={24}
            max={72}
            value={expiresInHours}
            onChange={(e) => setExpiresInHours(e.target.value)}
            className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          Generate invite
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="space-y-2">
        {invites.map((inv) => (
          <li
            key={inv.id}
            className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            <div>
              <p className="truncate text-slate-700">{inviteLink(inv.token)}</p>
              <p className="text-xs text-slate-400">
                Role: {inv.role} · Expires {new Date(inv.expiresAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(inviteLink(inv.token))}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Copy
              </button>
              <button
                onClick={() => handleRevoke(inv.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Revoke
              </button>
            </div>
          </li>
        ))}
        {invites.length === 0 && (
          <p className="text-sm text-slate-400">No active invites</p>
        )}
      </ul>
    </div>
  );
}