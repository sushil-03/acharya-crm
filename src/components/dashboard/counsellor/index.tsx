import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStore } from "@/store/use-user-store";
import { useGetCounsellorAnalytics } from "@/components/dashboard/hook/query/use-get-counsellor-analytics";
import {
  DateRangeSelector,
  defaultDateRange,
  type DateRange,
} from "@/components/global/date-range-selector";
import { OverviewTab } from "./tabs/overview-tab";
import { LeadsTab } from "./tabs/leads-tab";
import { ApplicationsTab } from "./tabs/applications-tab";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "leads", label: "Leads" },
  { value: "applications", label: "Applications" },
] as const;

export function CounsellorDashboard() {
  const { user } = useUserStore();
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange());
  const { data: analytics } = useGetCounsellorAnalytics(user?.id);

  return (
    <AppShell>
      <Tabs defaultValue="overview" className="space-y-5">
        {/* Single-row header: title | tabs (center) | date range (right) */}
        <div className="flex items-center justify-between gap-4 mb-1">
          <h1 className="font-display text-[22px] font-bold leading-tight shrink-0">Dashboard</h1>

          <TabsList className="bg-muted rounded-full p-1 h-auto">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-full px-4 py-1.5 text-[13px] font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>

        <TabsContent value="overview" className="mt-0">
          <OverviewTab analytics={analytics} />
        </TabsContent>

        <TabsContent value="leads" className="mt-0">
          <LeadsTab analytics={analytics} />
        </TabsContent>

        <TabsContent value="applications" className="mt-0">
          <ApplicationsTab />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
