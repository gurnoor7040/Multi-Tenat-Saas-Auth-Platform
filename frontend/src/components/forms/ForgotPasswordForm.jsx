import { useState } from "react";
import { Link } from "react-router-dom";
import * as authApi from "../../api/auth.api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      // Backend always returns success here regardless of whether the
      // email exists — see backend/src/services/auth.service.js — so
      // this state shows unconditionally, never revealing account existence.
      setIsSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSent) {
    return (
      <div className="w-full max-w-sm space-y-3 text-center">
        <h2 className="text-lg font-semibold text-slate-900">Check your email</h2>
        <p className="text-sm text-slate-600">
          If an account exists for <span className="font-medium">{email}</span>, a reset link
          is on its way. The link expires in 1 hour.
        </p>
        <Link to="/login" className="inline-block text-sm font-medium text-slate-900 underline">
          Back to login
        </Link>
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
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Remembered it?{" "}
        <Link to="/login" className="font-medium text-slate-900 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}