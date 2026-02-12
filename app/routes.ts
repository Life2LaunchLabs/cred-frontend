import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/landing/landing.tsx"),
  route("signin", "routes/auth/signin.tsx"),
  route("signup", "routes/auth/signup.tsx"),
  layout("layouts/app-layout.tsx", [
    route(":orgSlug", "routes/dashboard/dashboard.tsx", { index: true }),
    route(":orgSlug/credentials", "routes/credentials/credentials.tsx"),
    route(":orgSlug/credentials/browse", "routes/credentials/browse.tsx"),
    route(":orgSlug/credentials/create", "routes/credentials/create.tsx"),
    route(":orgSlug/credentials/:collectionId", "routes/credentials/detail.tsx"),
    route(":orgSlug/credentials/:collectionId/:badgeId", "routes/credentials/badge-detail.tsx"),
    route(":orgSlug/learners", "routes/learners/learners.tsx"),
    route(":orgSlug/learners/add", "routes/learners/add.tsx"),
    route(":orgSlug/organization", "routes/organization/organization.tsx"),
    route(":orgSlug/organization/staff", "routes/organization/staff.tsx"),
    route(":orgSlug/organization/settings", "routes/organization/settings.tsx"),
    route(":orgSlug/user/profile", "routes/profile/profile.tsx"),
    route(":orgSlug/user/settings", "routes/profile/settings.tsx"),
    route(":orgSlug/about", "routes/dashboard/about.tsx"),
    route(":orgSlug/feedback", "routes/dashboard/feedback.tsx"),
  ]),
] satisfies RouteConfig;
