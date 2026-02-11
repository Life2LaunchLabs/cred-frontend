import { useParams } from "react-router";

/**
 * Returns a function that builds absolute paths prefixed with the current org slug.
 *
 * Usage:
 *   const orgPath = useOrgPath();
 *   orgPath("/badges")      → "/:orgSlug/badges"
 *   orgPath()               → "/:orgSlug"
 */
export function useOrgPath() {
  const { orgSlug } = useParams();
  return (path?: string) => (path ? `/${orgSlug}${path}` : `/${orgSlug}`);
}
