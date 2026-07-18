import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as inviteApi from "../api/invite.api";
import { useAuth } from "../hooks/useAuth";
import { useOrg } from "../hooks/useOrg";

export default function InviteAccept() {
  const { token } = useParams();
  const { isAuthenticated, isLoading } = useAuth();
  const { refreshOrgs, switchOrg } = useOrg();
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  async function handleAccept() {
    setError(null);
    setIsJoining(true);
    try {
      const { data } = await inviteApi.acceptInvite(token);
      await refreshOrgs();
      switchOrg(data.org.slug);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Could not accept this invite");
    } finally {
      setIsJoining(false);
    }
  }

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-lg font-semibold text-slate-900">You've been invited</h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {isAuthenticated ? (
          <button
            onClick={handleAccept}
            disabled={isJoining}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isJoining ? "Joining…" : "Accept invite"}
          </button>
        ) : (
          <>
            <p className="text-sm text-slate-600">Log in or create an account to accept.</p>
            <Link
              to="/login"
              state={{ from: { pathname: `/invite/${token}` } }}
              className="block w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Log in
            </Link>
            <Link to="/register" className="block text-sm text-slate-500 underline">
              Or create an account
            </Link>
          </>
        )}
      </div>
    </div>
  );
}