import { createFileRoute } from "@tanstack/react-router";
import { CampaignCreator } from "@/components/emails/campaigns/campaign-creator";

export const Route = createFileRoute("/email-campaigns/new")({
  component: CampaignCreatorPage,
  head: () => ({ meta: [{ title: "New Email Campaign — Acharya One" }] }),
});

function CampaignCreatorPage() {
  return <CampaignCreator />;
}
