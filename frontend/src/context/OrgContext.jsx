import { createContext, useState, useEffect, useCallback, useContext } from "react";
import * as orgApi from "../api/org.api";
import * as userApi from "../api/user.api";
import { AuthContext } from "./AuthContext";

export const OrgContext = createContext(null);

const ACTIVE_ORG_STORAGE_KEY = "activeOrgSlug";

export function OrgProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);

  const [orgs, setOrgs] = useState([]); // [{ id, name, slug, logo, role }]
  const [activeOrgSlug, setActiveOrgSlug] = useState(
    () => localStorage.getItem(ACTIVE_ORG_STORAGE_KEY) || null
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadOrgs = useCallback(async () => {
    if (!isAuthenticated) {
      setOrgs([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data } = await userApi.getMyOrgs();
    setOrgs(data.orgs);

    // If there's no active org yet, or the stored one no longer exists
    // (e.g. removed from it), default to the first org available.
    setActiveOrgSlug((current) => {
      const stillValid = data.orgs.some((o) => o.slug === current);
      return stillValid ? current : data.orgs[0]?.slug || null;
    });

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  useEffect(() => {
    if (activeOrgSlug) {
      localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, activeOrgSlug);
    } else {
      localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY);
    }
  }, [activeOrgSlug]);

  const switchOrg = useCallback(
    (slug) => {
      if (orgs.some((o) => o.slug === slug)) {
        setActiveOrgSlug(slug);
      }
    },
    [orgs]
  );

  const activeOrg = orgs.find((o) => o.slug === activeOrgSlug) || null;

  const refreshActiveOrgDetails = useCallback(async () => {
    // Fetches fuller org details (via GET /org/:slug) beyond what the
    // lightweight /user/orgs list includes — call after settings changes.
    if (!activeOrgSlug) return null;
    const { data } = await orgApi.getOrg(activeOrgSlug);
    return data;
  }, [activeOrgSlug]);

  const value = {
    orgs,
    activeOrg,
    activeOrgSlug,
    switchOrg,
    isLoading,
    refreshOrgs: loadOrgs,
    refreshActiveOrgDetails,
  };

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}