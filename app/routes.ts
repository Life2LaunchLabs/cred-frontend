import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("signin", "routes/signin.tsx"),
  route("signup", "routes/signup.tsx"),
  layout("routes/dashboard.tsx", [
    route("home", "routes/dashboard/home.tsx", { index: true }),
    route("home/badges", "routes/dashboard/badges.tsx"),
    route("home/badges/browse", "routes/dashboard/badges-browse.tsx"),
    route("home/badges/create", "routes/dashboard/badges-create.tsx"),
    route("home/users", "routes/dashboard/users.tsx"),
    route("home/users/add", "routes/dashboard/users-add.tsx"),
    route("home/organization", "routes/dashboard/organization.tsx"),
    route("home/organization/staff", "routes/dashboard/organization-staff.tsx"),
    route("home/organization/settings", "routes/dashboard/organization-settings.tsx"),
    route("home/settings", "routes/dashboard/settings.tsx"),
    route("home/about", "routes/dashboard/about.tsx"),
    route("home/feedback", "routes/dashboard/feedback.tsx"),
  ]),
] satisfies RouteConfig;
