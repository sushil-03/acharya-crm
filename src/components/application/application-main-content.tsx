import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  FileText,
  File,
  CheckSquare,
  Clock,
} from "lucide-react";
import { LeadActivityTimeline } from "@/components/leads/lead-detail/lead-activity-timeline";
import { LeadInteraction } from "@/components/leads/lead-detail/lead-interaction";
import { LeadDetail } from "@/types/lead";
import { IApplicationDetails } from "@/components/application/hook/query/use-get-application";
import { LeadFiles } from "@/components/leads/lead-detail/lead-files";
import { LeadTask } from "@/components/leads/lead-detail/lead-task";
import { LeadStudentTimeline } from "@/components/leads/lead-detail/lead-student-timeline";

export function ApplicationMainContent({
  lead,
  applicationData,
  isApplicationDataLoading,
}: {
  lead: LeadDetail;
  applicationData?: IApplicationDetails;
  isApplicationDataLoading: boolean;
}) {
  console.log("app Data ===> ", applicationData);
  return (
    <div className="flex-1 bg-background h-full overflow-hidden flex flex-col min-h-0">
      <Tabs defaultValue="timeline" className="w-full h-full flex flex-col min-h-0">
        <TabsList className="w-full justify-start border-b border-border rounded-none h-12 bg-transparent p-0 px-4 shrink-0">
          <TabsTrigger
            value="timeline"
            className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4"
          >
            <Clock className="size-4 mr-2" /> Timeline
          </TabsTrigger>
          <TabsTrigger
            value="communication"
            className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4"
          >
            <Activity className="size-4 mr-2" /> Communication
          </TabsTrigger>
          <TabsTrigger
            value="interaction"
            className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4"
          >
            <FileText className="size-4 mr-2" /> Interaction{" "}
            <span className="ml-1.5 text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {lead.interactions.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4"
          >
            <File className="size-4 mr-2" /> Files{" "}
            <span className="ml-1.5 text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {applicationData?.documents?.length || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4"
          >
            <CheckSquare className="size-4 mr-2" /> Tasks
          </TabsTrigger>
        </TabsList>

        <div className="p-4 flex-1 overflow-y-auto min-h-0">
          <TabsContent value="timeline" className="mt-0 outline-none">
            <LeadStudentTimeline leadId={lead.id} />
          </TabsContent>

          <TabsContent value="communication" className="mt-0 outline-none">
            <LeadActivityTimeline lead={lead} />
          </TabsContent>

          <TabsContent value="interaction" className="mt-0 outline-none">
            <LeadInteraction lead={lead} />
          </TabsContent>

          <TabsContent value="files" className="mt-0 outline-none text-sm text-muted-foreground">
            <LeadFiles
              application={applicationData}
              lead={lead}
              isLoading={isApplicationDataLoading}
            />
          </TabsContent>

          <TabsContent value="tasks" className="mt-0 outline-none">
            <LeadTask lead={lead} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
