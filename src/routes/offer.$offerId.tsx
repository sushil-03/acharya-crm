import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useGetOfferDetail } from "@/components/offer/hook/query/use-get-offer-detail";
import { OfferHeader } from "@/components/offer/offer-detail/offer-header";
import { OfferSidebar } from "@/components/offer/offer-detail/offer-sidebar";
import { OfferMainContent } from "@/components/offer/offer-detail/offer-main-content";

export const Route = createFileRoute("/offer/$offerId")({
  component: OfferDetail,
});

function OfferDetail() {
  const { offerId } = Route.useParams();
  const { data: offerData, isLoading } = useGetOfferDetail(offerId);

  if (isLoading || !offerData) {
    return (
      <AppShell>
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell noPadding>
      <div className="flex flex-col h-full bg-background overflow-hidden w-full">
        <OfferHeader offer={offerData} />
        <div className="flex flex-1 overflow-hidden min-h-0">
          <OfferSidebar offer={offerData} />
          <OfferMainContent offer={offerData} />
        </div>
      </div>
    </AppShell>
  );
}
