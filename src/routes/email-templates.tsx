import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/email-templates")({
  component: EmailTemplatesLayout,
});

function EmailTemplatesLayout() {
  return <Outlet />;
}
