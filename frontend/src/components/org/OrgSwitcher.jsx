import { Link } from "react-router-dom";
import { useOrg } from "../../hooks/useOrg";

export default function OrgSwitcher() {
  const { orgs, activeOrg, switchOrg } = useOrg();

  if (!orgs.length) {
    return (
      <Link to="/org/create" className="text-sm font-medium text-slate-900 underline">
        Create an organization
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={activeOrg?.slug || ""}
        onChange={(e) => switchOrg(e.target.value)}
        className="rounded-md border border-slate-300 px-2 py-1 text-sm"
      >
        {orgs.map((org) => (
          <option key={org.slug} value={org.slug}>
            {org.name}
          </option>
        ))}
      </select>
      <Link to="/org/create" className="text-xs text-slate-500 hover:text-slate-900">
        + New
      </Link>
    </div>
  );
}