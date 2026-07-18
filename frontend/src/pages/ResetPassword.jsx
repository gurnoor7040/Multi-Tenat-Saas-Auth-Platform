import ResetPasswordForm from "../components/forms/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900">
          Set a new password
        </h1>
        <ResetPasswordForm />
      </div>
    </div>
  );
}