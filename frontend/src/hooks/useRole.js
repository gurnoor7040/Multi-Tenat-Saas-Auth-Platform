import { useOrg } from "./useOrg";

// Convenience hook for components that just need "am I an Admin here"
// without pulling in the whole org object. Returns null if there's no
// active org yet (e.g. still loading, or the user has no orgs).
export function useRole() {
  const { activeOrg } = useOrg();
  return activeOrg?.role || null;
}