import type { Route } from "./+types/landing";
import LandingPage from "./LandingPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Welcome" },
    { name: "description", content: "Welcome to our platform" },
  ];
}

export default function Landing() {
  return <LandingPage />;
}
