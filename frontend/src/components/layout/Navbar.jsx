import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import OrgSwitcher from "../org/OrgSwitcher";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="font-semibold text-slate-900">
          SaaS Auth
        </Link>
        <OrgSwitcher />
      </div>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/account" className="text-slate-600 hover:text-slate-900">
          {user?.name}
        </Link>
        <button onClick={handleLogout} className="text-slate-500 hover:text-slate-900">
          Log out
        </button>
      </div>
    </nav>
  );
}