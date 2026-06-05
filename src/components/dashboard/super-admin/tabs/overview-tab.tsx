import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, GraduationCap, Wallet, TrendingUp } from "lucide-react";
import { StatCard, Card } from "@/components/ui-kit";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAnalyticsOverview,
  useGetFunnelLeadToEnrollment,
  type AnalyticsFilters,
} from "@/components/dashboard/hook/query/use-get-analytics";
import { getChartColors } from "@/lib/chart-colors";

function formatPeriod(period: string, groupBy?: string | null): string {
  if (!period) return period;
  if (groupBy === "month" && period.length === 7) {
    const [y, m] = period.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleString("default", {
      month: "short",
      year: "2-digit",
    });
  }
  const d = new Date(period);
  return isNaN(d.getTime())
    ? period
    : d.toLocaleDateString("default", { month: "short", day: "numeric" });
}

interface OverviewTabProps {
  filters: AnalyticsFilters;
}

export function OverviewTab({ filters }: OverviewTabProps) {
  const c = getChartColors();
  const { data: overview, isLoading: overviewLoading } = useGetAnalyticsOverview(filters);
  const { data: funnel, isLoading: funnelLoading } = useGetFunnelLeadToEnrollment(filters);

  const kpis = overview?.kpis;
  const series = (funnel?.series || []).map((s) => ({
    ...s,
    period: formatPeriod(s.period, funnel?.groupBy),
  }));

  const pipelineEntries = [
    ["leadsCreated",        "Leads Created",  c.pipeline.leadsCreated],
    ["applicationsStarted", "Applications Started", c.pipeline.applicationsStarted],
    ["submitted",           "Submitted",      c.pipeline.submitted],
    ["enrolled",            "Enrolled",       c.pipeline.enrolled],
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-xl" />
          ))
        ) : (
          <>
            <StatCard label="Total Leads"         value={kpis?.totalLeads?.toLocaleString() ?? "0"} icon={<Users className="size-4" />}        accent="primary" />
            <StatCard label="Total Enrollments"   value={kpis?.totalEnrollments?.toLocaleString() ?? "0"} icon={<GraduationCap className="size-4" />} accent="success" />
            <StatCard label="Revenue Collected"   value={kpis?.revenueCollected ? `₹${(kpis.revenueCollected / 10000000).toFixed(1)} Cr` : "₹0"} icon={<Wallet className="size-4" />} accent="gold" />
            <StatCard label="Enrollment Yield"    value={kpis?.enrollmentYield ? `${kpis.enrollmentYield}%` : "0%"} icon={<TrendingUp className="size-4" />} accent="info" />
          </>
        )}
      </div>

      <Card className="p-5">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-[15px]">Lead → Enrollment Trend</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Leads created, applications started, submitted and enrolled over time
          </p>
        </div>
        {funnelLoading ? (
          <Skeleton className="h-64 w-full rounded-lg" />
        ) : series.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-[13px] text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {pipelineEntries.map(([key, , color]) => (
                    <linearGradient key={key} id={`grad-ov-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip {...c.tt} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                {pipelineEntries.map(([key, name, color]) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={name}
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#grad-ov-${key})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
