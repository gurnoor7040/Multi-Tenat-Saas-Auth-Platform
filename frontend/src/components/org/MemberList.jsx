import { useEffect, useState } from "react";
import * as orgApi from "../../api/org.api";
import { useAuth } from "../../hooks/useAuth";
import { canChangeMemberRoles, canRemoveMembers } from "../../lib/permissions";

export default function MemberList({ slug, role }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadMembers() {
    setIsLoading(true);
    try {
      const { data } = await orgApi.listMembers(slug);
      setMembers(data.members);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load members");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [slug]);

  async function handleRoleChange(userId, newRole) {
    try {
      await orgApi.changeMemberRole(slug, userId, newRole);
      loadMembers();
    } catch (err) {
      alert(err.response?.data?.error || "Could not change role");
    }
  }

  async function handleRemove(userId) {
    if (!confirm("Remove this member from the organization?")) return;
    try {
      await orgApi.removeMember(slug, userId);
      loadMembers();
    } catch (err) {
      alert(err.response?.data?.error || "Could not remove member");
    }
  }

  if (isLoading) return <p className="text-sm text-slate-500">Loading members…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500">
          <th className="py-2">Name</th>
          <th className="py-2">Email</th>
          <th className="py-2">Role</th>
          <th className="py-2"></th>
        </tr>
      </thead>
      <tbody>
        {members.map((m) => (
          <tr key={m.userId} className="border-b border-slate-100">
            <td className="py-2">{m.name}</td>
            <td className="py-2 text-slate-500">{m.email}</td>
            <td className="py-2">
              {canChangeMemberRoles(role) ? (
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                  className="rounded border border-slate-300 px-1 py-0.5 text-xs"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              ) : (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{m.role}</span>
              )}
            </td>
            <td className="py-2 text-right">
              {canRemoveMembers(role) && m.email !== user?.email && (
                <button
                  onClick={() => handleRemove(m.userId)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}