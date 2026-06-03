import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useGetLead } from "@/components/leads/hook/query/use-get-lead";
import { LeadHeader } from "@/components/leads/lead-detail/lead-header";
import { LeadSidebar } from "@/components/leads/lead-detail/lead-sidebar";
import { LeadMainContent } from "@/components/leads/lead-detail/lead-main-content";
import { useGetApplication } from "@/components/application/hook/query/use-get-application";

export const Route = createFileRoute("/leads/$leadId")({
  component: LeadDetail,
});

function LeadDetail() {
  const { leadId } = Route.useParams();
  const { data: leadData, isLoading } = useGetLead(leadId);

  // Determine if there is a submitted application to fetch
  const appId =
    leadData?.applications && leadData.applications.length > 0
      ? leadData.applications[0].id
      : undefined;

  const { data: applicationData, isLoading: applicationLoading } = useGetApplication(appId);

  if (isLoading || !leadData) {
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
    <AppShell noPadding>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-background overflow-hidden w-full">
        <LeadHeader
          lead={lead}
          applicationData={applicationData}
          isApplicationDataLoading={applicationLoading}
        />
        <div className="flex flex-1 overflow-hidden min-h-0">
          <LeadSidebar
            lead={leadData}
            applicationData={applicationData}
            isApplicationDataLoading={applicationLoading}
          />
          <LeadMainContent
            lead={lead}
            applicationData={applicationData}
            isApplicationDataLoading={applicationLoading}
          />
        </div>
      </div>
    </AppShell>
  );
}
