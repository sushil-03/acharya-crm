import { createFileRoute } from "@tanstack/react-router";
import { EmailCampaignsList } from "@/components/emails/campaigns/email-campaigns-list";

export const Route = createFileRoute("/email-campaigns/")({
  component: EmailCampaignsPage,
  head: () => ({ meta: [{ title: "Email Campaigns — Acharya One" }] }),
});

function EmailCampaignsPage() {
  return <EmailCampaignsList />;
}
