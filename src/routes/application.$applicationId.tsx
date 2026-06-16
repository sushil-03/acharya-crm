import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useGetLead } from "@/components/leads/hook/query/use-get-lead";
import { LeadHeader } from "@/components/leads/lead-detail/lead-header";
import { ApplicationSidebar } from "@/components/application/application-sidebar";
import { ApplicationMainContent } from "@/components/application/application-main-content";
import { useGetApplication } from "@/components/application/hook/query/use-get-application";

export const Route = createFileRoute("/application/$applicationId")({
  component: ApplicationDetail,
});

function ApplicationDetail() {
  const { applicationId } = Route.useParams();
  const { data: applicationData, isLoading: applicationLoading } = useGetApplication(applicationId);
  const { data: leadData, isLoading: leadLoading } = useGetLead(applicationData?.leadId || "");

  if (applicationLoading || leadLoading || !leadData) {
    return (
      <AppShell>
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      </AppShell>
    );
  }

  const lead = {
    ...leadData,
    phone: leadData.mobile,
    program: leadData.courseInterest,
    source: leadData.sourceChannel,
    score: leadData.leadScore,

    country: leadData.country ?? "India",
    city: leadData.city ?? "Bangalore",
    createdAt: leadData.createdAt,
  };

  return (
    <AppShell noPadding className="h-screen scrollbar-thin">
      <div className="flex flex-col h-full bg-background overflow-hidden w-full">
        <LeadHeader
          lead={lead}
          applicationData={applicationData}
          isApplicationDataLoading={applicationLoading}
        />
        <div className="flex flex-1 overflow-hidden min-h-0">
          <ApplicationSidebar applicationData={applicationData} isLoading={applicationLoading} />
          <ApplicationMainContent
            lead={lead}
            applicationData={applicationData}
            isApplicationDataLoading={applicationLoading}
          />
        </div>
      </div>
    </AppShell>
  );
}
