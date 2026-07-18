import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">404</h1>
      <p className="text-sm text-slate-500">This page doesn't exist.</p>
      <Link to="/" className="text-sm font-medium text-slate-900 underline">
        Go home
      </Link>
    </div>
  );
}