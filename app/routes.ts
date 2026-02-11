import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("signin", "routes/signin.tsx"),
  route("signup", "routes/signup.tsx"),
  layout("routes/dashboard.tsx", [
    route(":orgSlug", "routes/dashboard/home.tsx", { index: true }),
    route(":orgSlug/badges", "routes/dashboard/badges.tsx"),
    route(":orgSlug/badges/browse", "routes/dashboard/badges-browse.tsx"),
    route(":orgSlug/badges/create", "routes/dashboard/badges-create.tsx"),
    route(":orgSlug/badges/:collectionId", "routes/dashboard/badges-detail.tsx"),
    route(":orgSlug/badges/:collectionId/:badgeId", "routes/dashboard/badge-detail.tsx"),
    route(":orgSlug/users", "routes/dashboard/users.tsx"),
    route(":orgSlug/users/add", "routes/dashboard/users-add.tsx"),
    route(":orgSlug/organization", "routes/dashboard/organization.tsx"),
    route(":orgSlug/organization/staff", "routes/dashboard/organization-staff.tsx"),
    route(":orgSlug/organization/settings", "routes/dashboard/organization-settings.tsx"),
    route(":orgSlug/user/profile", "routes/dashboard/user-profile.tsx"),
    route(":orgSlug/user/settings", "routes/dashboard/user-settings.tsx"),
    route(":orgSlug/about", "routes/dashboard/about.tsx"),
    route(":orgSlug/feedback", "routes/dashboard/feedback.tsx"),
  ]),
] satisfies RouteConfig;
