import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/email-campaigns")({
  component: EmailCampaignsLayout,
});

function EmailCampaignsLayout() {
  return <Outlet />;
}
