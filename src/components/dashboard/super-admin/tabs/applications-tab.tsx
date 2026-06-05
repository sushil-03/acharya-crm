import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { FileText, Send, CheckCircle, TrendingUp } from "lucide-react";
import { StatCard, Card } from "@/components/ui-kit";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAnalyticsOverview,
  useGetFunnelApplicationToEnrollment,
  type AnalyticsFilters,
} from "@/components/dashboard/hook/query/use-get-analytics";
import { getChartColors } from "@/lib/chart-colors";

const STAGE_LABELS: Record<string, string> = {
  applicationsCreated: "Created",
  submitted: "Submitted",
  verified: "Verified",
  approved: "Approved",
  offerReleased: "Offer Released",
  feePaid: "Fee Paid",
  enrolled: "Enrolled",
};

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
  return isNaN(d.getTime()) ? period : d.toLocaleDateString("default", { month: "short", day: "numeric" });
}

interface ApplicationsTabProps {
  filters: AnalyticsFilters;
}

export function ApplicationsTab({ filters }: ApplicationsTabProps) {
  const c = getChartColors();
  const { data: overview, isLoading: overviewLoading } = useGetAnalyticsOverview(filters);
  const { data: appFunnel, isLoading: funnelLoading } = useGetFunnelApplicationToEnrollment(filters);

  const kpis = overview?.kpis;
  const series = (appFunnel?.series || []).map((s) => ({
    ...s,
    period: formatPeriod(s.period, appFunnel?.groupBy),
  }));

  // Aggregate totals across all periods for the stage breakdown panel
  const stageTotals = series.reduce(
    (acc, s) => {
      Object.keys(STAGE_LABELS).forEach((key) => {
        acc[key] = (acc[key] || 0) + ((s as any)[key] || 0);
      });
      return acc;
    },
    {} as Record<string, number>,
  );
  const maxStageVal = Math.max(...Object.values(stageTotals), 1);

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[88px] rounded-xl" />)
        ) : (
          <>
            <StatCard
              label="Total Applications"
              value={kpis?.totalApplications?.toLocaleString() ?? "0"}
              icon={<FileText className="size-4" />}
              accent="primary"
            />
            <StatCard
              label="Submitted"
              value={kpis?.submittedApplications?.toLocaleString() ?? "0"}
              icon={<Send className="size-4" />}
              accent="info"
            />
            <StatCard
              label="Approved"
              value={kpis?.approvedApplications?.toLocaleString() ?? "0"}
              icon={<CheckCircle className="size-4" />}
              accent="success"
            />
            <StatCard
              label="Submit Rate"
              value={kpis?.applicationSubmitRate ? `${kpis.applicationSubmitRate}%` : "0%"}
              icon={<TrendingUp className="size-4" />}
              accent="warning"
            />
          </>
        )}
      </div>

      {/* Application funnel trend + stage breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-[15px]">Application → Enrollment Trend</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Stage-wise progression from application creation to enrollment
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
                    {Object.entries(c.appStage).map(([key, color]) => (
                      <linearGradient key={key} id={`ag-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip {...c.tt} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  {Object.entries(STAGE_LABELS).map(([key, label]) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={label}
                      stroke={c.appStage[key]}
                      strokeWidth={1.5}
                      fill={`url(#ag-${key})`}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Stage Breakdown */}
        <Card className="p-5">
          <h3 className="font-display font-semibold text-[15px] mb-1">Stage Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Cumulative totals for the period</p>
          {funnelLoading ? (
            <Skeleton className="h-52 w-full rounded-lg" />
          ) : (
            <div className="space-y-3">
              {Object.entries(STAGE_LABELS).map(([key, label]) => {
                const val = stageTotals[key] || 0;
                const pct = Math.round((val / maxStageVal) * 100);
                return (
                  <div key={key}>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold tabular-nums">{val.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: c.appStage[key] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}
