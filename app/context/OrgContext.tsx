import * as React from "react";
import { listUserOrgs } from "~/api/generated";
import type { UserOrgMembership, OrgMemberRole } from "~/api/generated";
import { useAuth } from "./AuthContext";

export interface OrgContextValue {
  orgs: UserOrgMembership[];
  activeOrg: UserOrgMembership | null;
  selectOrg: (orgId: string) => void;
  isLoading: boolean;
  activeRole: OrgMemberRole | null;
  isAdmin: boolean;
}

const OrgContext = React.createContext<OrgContextValue | null>(null);

const ACTIVE_ORG_KEY = "active_org_id";

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [orgs, setOrgs] = React.useState<UserOrgMembership[]>([]);
  const [activeOrgId, setActiveOrgId] = React.useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACTIVE_ORG_KEY);
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      setOrgs([]);
      setActiveOrgId(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchOrgs() {
      setIsLoading(true);
      const res = await listUserOrgs(user!.id);
      if (cancelled) return;

      if (res.status === 200) {
        const fetched = res.data.data;
        setOrgs(fetched);

        // Restore saved org or default to first
        const savedId = localStorage.getItem(ACTIVE_ORG_KEY);
        const match = fetched.find((m) => m.org.id === savedId);
        if (match) {
          setActiveOrgId(match.org.id);
        } else if (fetched.length > 0) {
          const firstId = fetched[0].org.id;
          setActiveOrgId(firstId);
          localStorage.setItem(ACTIVE_ORG_KEY, firstId);
        }
      }
      setIsLoading(false);
    }

    fetchOrgs();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const selectOrg = React.useCallback((orgId: string) => {
    setActiveOrgId(orgId);
    localStorage.setItem(ACTIVE_ORG_KEY, orgId);
  }, []);

  const activeOrg = React.useMemo(
    () => orgs.find((m) => m.org.id === activeOrgId) ?? null,
    [orgs, activeOrgId],
  );

  const activeRole = activeOrg?.membership.role as OrgMemberRole | null ?? null;
  const isAdmin = activeRole === "owner" || activeRole === "admin";

  const value = React.useMemo(
    () => ({ orgs, activeOrg, selectOrg, isLoading, activeRole, isAdmin }),
    [orgs, activeOrg, selectOrg, isLoading, activeRole, isAdmin],
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  const context = React.useContext(OrgContext);
  if (!context) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
}

export default OrgContext;
