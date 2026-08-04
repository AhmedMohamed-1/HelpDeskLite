import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/people")({
  beforeLoad: () => {
    throw redirect({ to: "/team" });
  },
  component: () => null,
});
