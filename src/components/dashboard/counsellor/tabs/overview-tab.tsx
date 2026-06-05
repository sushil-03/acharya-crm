import { StatCard } from "@/components/ui-kit";
import { Users, PhoneCall, Clock, Target } from "lucide-react";
import type { CounsellorAnalytics } from "@/components/dashboard/hook/query/use-get-counsellor-analytics";

interface OverviewTabProps {
  analytics?: CounsellorAnalytics;
}

export function OverviewTab({ analytics }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Open Leads"
        value={analytics?.openLeads?.toLocaleString() || "0"}
        icon={<Users className="size-4" />}
        accent="primary"
      />
      <StatCard
        label="Calls Today"
        value={analytics?.callsToday?.toLocaleString() || "0"}
        icon={<PhoneCall className="size-4" />}
        accent="info"
      />
      <StatCard
        label="Overdue Tasks"
        value={analytics?.overdueTasks?.toLocaleString() || "0"}
        icon={<Clock className="size-4" />}
        accent="warning"
      />
      <StatCard
        label="Conversion Rate"
        value={analytics?.conversionRate ? `${analytics.conversionRate}%` : "0%"}
        icon={<Target className="size-4" />}
        accent="success"
      />
    </div>
  );
}
