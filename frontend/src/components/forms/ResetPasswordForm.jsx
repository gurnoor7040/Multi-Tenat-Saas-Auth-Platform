import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import * as authApi from "../../api/auth.api";

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); // matches the link built in backend/src/services/email.service.js

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is missing its token. Please request a new one.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      setIsDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      const details = err.response?.data?.details;
      const firstDetail = details && Object.values(details)[0]?.[0];
      setError(firstDetail || err.response?.data?.error || "Could not reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isDone) {
    return (
      <div className="w-full max-w-sm space-y-2 text-center">
        <h2 className="text-lg font-semibold text-slate-900">Password reset</h2>
        <p className="text-sm text-slate-600">Redirecting you to login…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <p className="mt-1 text-xs text-slate-400">
            At least 8 characters, with an uppercase letter and a number.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isSubmitting ? "Resetting…" : "Reset password"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        <Link to="/login" className="font-medium text-slate-900 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}