import LoginForm from "../components/forms/LoginForm";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900">Log in</h1>
        <LoginForm />
      </div>
    </div>
  );
}