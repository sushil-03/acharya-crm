import { createFileRoute } from "@tanstack/react-router";
import { CampaignDetail } from "@/components/emails/campaigns/campaign-detail";

export const Route = createFileRoute("/email-campaigns/$campaignId")({
  component: CampaignDetailPage,
  head: () => ({ meta: [{ title: "Campaign Report — Acharya One" }] }),
});

function CampaignDetailPage() {
  const { campaignId } = Route.useParams();
  return <CampaignDetail campaignId={campaignId} />;
}
