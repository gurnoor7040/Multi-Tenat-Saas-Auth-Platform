import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import * as userApi from "../api/user.api";
import { useAuth } from "../hooks/useAuth";

export default function Account() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [profileMsg, setProfileMsg] = useState(null);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileMsg(null);
    try {
      await userApi.updateMe({ name });
      await refreshUser();
      setProfileMsg("Saved");
    } catch (err) {
      setProfileMsg(err.response?.data?.error || "Could not save");
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMsg(null);
    try {
      await userApi.changePassword(passwords);
      setPasswordMsg("Password changed. You'll need to log in again next time.");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.error || "Could not change password");
    }
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-lg space-y-10 p-8">
        <section className="space-y-3">
          <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
          <form onSubmit={handleProfileSave} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <p className="text-sm text-slate-500">{user?.email}</p>
            {profileMsg && <p className="text-sm text-slate-600">{profileMsg}</p>}
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Save
            </button>
          </form>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            {passwordMsg && <p className="text-sm text-green-700">{passwordMsg}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Current password
              </label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">New password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Change password
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}