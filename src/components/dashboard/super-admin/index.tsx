import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { AppShell } from "@/components/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/store/use-user-store";
import { useGetCampuses } from "@/components/global/hooks/use-get-campuses";
import type { AnalyticsFilters } from "@/components/dashboard/hook/query/use-get-analytics";
// import {
//   DateRangeSelector,
//   defaultDateRange,
//   type DateRange,
// } from "@/components/gl/shared/date-range-selector";
import { OverviewTab } from "./tabs/overview-tab";
import { LeadsTab } from "./tabs/leads-tab";
import { ApplicationsTab } from "./tabs/applications-tab";
import { CollegesTab } from "./tabs/colleges-tab";
import {
  DateRange,
  DateRangeSelector,
  defaultDateRange,
} from "@/components/global/date-range-selector";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "leads", label: "Leads" },
  { value: "applications", label: "Applications" },
  { value: "colleges", label: "Colleges" },
] as const;

function computeGroupBy(range: DateRange): "day" | "week" | "month" {
  const days = differenceInDays(range.to, range.from);
  if (days <= 14) return "day";
  if (days <= 90) return "week";
  return "month";
}

export function SuperAdminDashboard() {
  const { user } = useUserStore();
  const [selectedCampusId, setSelectedCampusId] = useState(user?.campusId || "all");
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange());

  const { data: campuses } = useGetCampuses({ isActive: true });

  const filters: AnalyticsFilters = {
    from: format(dateRange.from, "yyyy-MM-dd"),
    to: format(dateRange.to, "yyyy-MM-dd"),
    campusId: selectedCampusId === "all" ? null : selectedCampusId,
    groupBy: computeGroupBy(dateRange),
  };

  return (
    <AppShell>
      <Tabs defaultValue="overview" className="space-y-0">
        <div className="flex items-center justify-between gap-4 mb-6">
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

          <div className="flex items-center gap-2 shrink-0">
            <Select value={selectedCampusId} onValueChange={setSelectedCampusId}>
              <SelectTrigger className="h-9 text-[13px] bg-card">
                <SelectValue placeholder="All Campuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campuses</SelectItem>
                {campuses?.map((campus) => (
                  <SelectItem key={campus.id} value={campus.id}>
                    {campus.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        <TabsContent value="overview" className="mt-0">
          <OverviewTab filters={filters} />
        </TabsContent>
        <TabsContent value="leads" className="mt-0">
          <LeadsTab filters={filters} />
        </TabsContent>
        <TabsContent value="applications" className="mt-0">
          <ApplicationsTab filters={filters} />
        </TabsContent>
        <TabsContent value="colleges" className="mt-0">
          <CollegesTab filters={filters} selectedCampusId={selectedCampusId} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
