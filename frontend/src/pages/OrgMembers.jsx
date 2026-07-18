import Navbar from "../components/layout/Navbar";
import MemberList from "../components/org/MemberList";
import { useOrg } from "../hooks/useOrg";
import { useRole } from "../hooks/useRole";

export default function OrgMembers() {
  const { activeOrg } = useOrg();
  const role = useRole();

  if (!activeOrg) return null;

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="mb-6 text-xl font-semibold text-slate-900">
          Members — {activeOrg.name}
        </h1>
        <MemberList slug={activeOrg.slug} role={role} />
      </div>
    </div>
  );
}