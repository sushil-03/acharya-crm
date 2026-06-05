import { StatCard, Card } from "@/components/ui-kit";
import { Users, Target, TrendingUp } from "lucide-react";
import type { CounsellorAnalytics } from "@/components/dashboard/hook/query/use-get-counsellor-analytics";

interface LeadsTabProps {
  analytics?: CounsellorAnalytics;
}

export function LeadsTab({ analytics }: LeadsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Open Leads"
          value={analytics?.openLeads?.toLocaleString() || "0"}
          icon={<Users className="size-4" />}
          accent="primary"
        />
        <StatCard
          label="Conversion Rate"
          value={analytics?.conversionRate ? `${analytics.conversionRate}%` : "0%"}
          icon={<Target className="size-4" />}
          accent="success"
        />
        <StatCard
          label="My Pipeline"
          value={analytics?.openLeads?.toLocaleString() || "0"}
          icon={<TrendingUp className="size-4" />}
          accent="info"
        />
      </div>

      <Card className="p-5 flex items-center justify-center min-h-[200px]">
        <p className="text-[13px] text-muted-foreground">
          Detailed lead charts coming soon.
        </p>
      </Card>
    </div>
  );
}
