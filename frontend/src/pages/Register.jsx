import RegisterForm from "../components/forms/RegisterForm";

export default function Register() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900">
          Create your account
        </h1>
        <RegisterForm />
      </div>
    </div>
  );
}