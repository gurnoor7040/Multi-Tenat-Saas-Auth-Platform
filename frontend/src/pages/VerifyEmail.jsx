import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import * as authApi from "../api/auth.api";

// Landing page after clicking the email verification link. No form here
// (nothing for the user to type) — just resolves the token on mount.
export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("This verification link is missing its token.");
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err.response?.data?.error || "This link is invalid or expired.");
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-3 text-center">
        {status === "verifying" && (
          <p className="text-sm text-slate-500">Verifying your email…</p>
        )}

        {status === "success" && (
          <>
            <h1 className="text-lg font-semibold text-slate-900">Email verified</h1>
            <p className="text-sm text-slate-600">Your account is active. You can log in now.</p>
            <Link
              to="/login"
              className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Go to login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-lg font-semibold text-slate-900">Verification failed</h1>
            <p className="text-sm text-red-600">{errorMessage}</p>
            <Link to="/login" className="inline-block text-sm font-medium text-slate-900 underline">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}