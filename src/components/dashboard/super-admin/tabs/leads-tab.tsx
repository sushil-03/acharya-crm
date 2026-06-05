import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Sector,
  Cell,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, Percent, TrendingUp, Star, BarChart2, List } from "lucide-react";
import { StatCard, Card } from "@/components/ui-kit";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useGetAnalyticsOverview,
  useGetFunnelLeadToEnrollment,
  useGetLeadsBySource,
  useGetLeadsByCourse,
  useGetLeadsBySourceAndStage,
  useGetLeadsByProgram,
  useGetLeadsSourceByCampus,
  type AnalyticsFilters,
} from "@/components/dashboard/hook/query/use-get-analytics";
import { getChartColors, formatSourceName } from "@/lib/chart-colors";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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

function ViewToggle({
  value,
  onChange,
}: {
  value: "chart" | "table";
  onChange: (v: "chart" | "table") => void;
}) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden h-7">
      {(["chart", "table"] as const).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "px-2.5 text-[12px] flex items-center gap-1.5 transition-colors",
            value === v
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground",
          )}
        >
          {v === "chart" ? <BarChart2 className="size-3" /> : <List className="size-3" />}
          {v === "chart" ? "Chart" : "Table"}
        </button>
      ))}
    </div>
  );
}


interface LeadsTabProps {
  filters: AnalyticsFilters;
}

export function LeadsTab({ filters }: LeadsTabProps) {
  const c = getChartColors();
  const [sourceView, setSourceView] = useState<"chart" | "table">("chart");
  const [stageView, setStageView] = useState<"chart" | "table">("chart");
  const [programView, setProgramView] = useState<"chart" | "table">("chart");
  const [hoveredCampus, setHoveredCampus] = useState<{ name: string; total: number } | null>(null);

  const { data: overview, isLoading: overviewLoading } = useGetAnalyticsOverview(filters);
  const { data: funnel, isLoading: funnelLoading } = useGetFunnelLeadToEnrollment(filters);
  const { data: bySource, isLoading: sourceLoading } = useGetLeadsBySource(filters);
  const { data: byCourse, isLoading: courseLoading } = useGetLeadsByCourse(filters);
  const { data: bySourceStage, isLoading: stageLoading } = useGetLeadsBySourceAndStage(filters);
  const { data: byProgram, isLoading: programLoading } = useGetLeadsByProgram(filters);
  const { data: byCampus, isLoading: campusLoading } = useGetLeadsSourceByCampus(filters);

  const kpis = overview?.kpis;

  // Campus pie data mapped from live API response
  const campusPieData = (byCampus?.campuses || []).map((campus, ci) => {
    const campusData = (byCampus?.data || []).filter((d) => d.campusId === campus.id);
    const srcBreakdown = campusData
      .map((d) => {
        const sourceIdx = byCampus?.sources ? byCampus.sources.indexOf(d.source) : 0;
        return {
          source: d.source,
          count: d.count,
          color: c.palette[sourceIdx % c.palette.length] || c.palette[0]
        };
      })
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count);
    const total = srcBreakdown.reduce((sum, s) => sum + s.count, 0);
    return { id: campus.id, name: campus.name, total, srcBreakdown, fill: c.palette[ci % c.palette.length] };
  }).filter((entry) => entry.total > 0);

  const grandTotalLeads = campusPieData.reduce((sum, d) => sum + d.total, 0);
  const series = (funnel?.series || []).map((s) => ({
    ...s,
    period: formatPeriod(s.period, funnel?.groupBy),
  }));
  const sources = bySource?.sources || [];
  const sourcesSorted = [...sources].sort((a, b) => b.leads - a.leads);
  const courses = (byCourse?.courses || []).slice(0, 12);
  const stages = bySourceStage?.stages || [];
  const sourcesWithStages = bySourceStage?.sources || [];
  const programs = byProgram?.programs || [];

  const maxCourseLeads = Math.max(...courses.map((c) => c.leads), 1);

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Total Leads"
              value={kpis?.totalLeads?.toLocaleString() ?? "0"}
              icon={<Users className="size-4" />}
              accent="primary"
            />
            <StatCard
              label="Qualified Leads"
              value={kpis?.qualifiedLeads?.toLocaleString() ?? "0"}
              icon={<Star className="size-4" />}
              accent="info"
            />
            <StatCard
              label="Qualification Rate"
              value={kpis?.leadQualificationRate ? `${kpis.leadQualificationRate}%` : "0%"}
              icon={<Percent className="size-4" />}
              accent="warning"
            />
            <StatCard
              label="Conversion Rate"
              value={kpis?.leadConversionRate ? `${kpis.leadConversionRate}%` : "0%"}
              icon={<TrendingUp className="size-4" />}
              accent="success"
            />
          </>
        )}
      </div>

      {/* Pipeline Trend + Course Interest */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-[15px]">Lead Pipeline Trend</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Leads progressing through the pipeline over time
            </p>
          </div>
          {funnelLoading ? (
            <Skeleton className="h-60 w-full rounded-lg" />
          ) : series.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-[13px] text-muted-foreground">
              No data for this period
            </div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    {[
                      ["leadsCreated", c.pipeline.leadsCreated],
                      ["applicationsStarted", c.pipeline.applicationsStarted],
                      ["submitted", c.pipeline.submitted],
                      ["enrolled", c.pipeline.enrolled],
                    ].map(([key, color]) => (
                      <linearGradient key={key} id={`lg-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.06)"
                    vertical={false}
                  />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip {...c.tt} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  {(
                    [
                      ["leadsCreated",        "Leads",      c.pipeline.leadsCreated],
                      ["applicationsStarted", "Applications Started", c.pipeline.applicationsStarted],
                      ["submitted",           "Submitted",  c.pipeline.submitted],
                      ["enrolled",            "Enrolled",   c.pipeline.enrolled],
                    ] as [string, string, string][]
                  ).map(([key, name, color]) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={name}
                      stroke={color}
                      strokeWidth={2}
                      fill={`url(#lg-${key})`}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Course Interest — horizontal ranked bars */}
        <Card className="p-5">
          <h3 className="font-display font-semibold text-[15px] mb-1">Course Interest</h3>
          <p className="text-xs text-muted-foreground mb-4">Top courses by lead volume</p>
          {courseLoading ? (
            <Skeleton className="h-60 w-full rounded-lg" />
          ) : courses.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-[13px] text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-60 pr-1">
              {courses.map((course, i) => {
                const pct = Math.round((course.leads / maxCourseLeads) * 100);
                return (
                  <div key={course.courseInterest}>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="truncate max-w-[140px] font-medium" title={course.courseInterest}>
                        {course.courseInterest}
                      </span>
                      <span className="tabular-nums text-muted-foreground shrink-0 ml-2">
                        {course.leads.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: c.palette[i % c.palette.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Leads by Source (2/3) + Leads by Campus (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leads by Source */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-[15px]">Leads by Source</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Leads, applications and enrollments per acquisition channel
              </p>
            </div>
            <ViewToggle value={sourceView} onChange={setSourceView} />
          </div>
          {sourceLoading ? (
            <Skeleton className="h-56 w-full rounded-lg" />
          ) : sources.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-[13px] text-muted-foreground">
              No source data available
            </div>
          ) : sourceView === "chart" ? (
            <ResponsiveContainer width="100%" height={Math.max(220, sourcesSorted.length * 46)}>
              <BarChart
                data={sourcesSorted}
                layout="vertical"
                barSize={20}
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="source"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={88}
                  tickFormatter={formatSourceName}
                />
                <Tooltip
                  {...c.tt}
                  labelFormatter={formatSourceName}
                  formatter={(_value, _name, props) => {
                    const p = props.payload;
                    return [
                      `${p.leads?.toLocaleString()} leads · ${p.applications?.toLocaleString()} applications · ${p.enrolled?.toLocaleString()} enrolled · ${p.conversionRate?.toFixed(1)}% conv.`,
                      formatSourceName(p.source),
                    ];
                  }}
                />
                <Bar dataKey="leads" name="Lead Volume" radius={[0, 4, 4, 0]}>
                  {sourcesSorted.map((entry, i) => (
                    <Cell key={entry.source} fill={c.palette[i % c.palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-2 font-medium text-muted-foreground">Source</th>
                  <th className="text-right pb-2 font-medium text-muted-foreground">Leads</th>
                  <th className="text-right pb-2 font-medium text-muted-foreground">Applications</th>
                  <th className="text-right pb-2 font-medium text-muted-foreground">Enrolled</th>
                  <th className="text-right pb-2 font-medium text-muted-foreground">Conv %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sources.map((s, i) => (
                  <tr key={s.source} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 flex items-center gap-2">
                      <span className="size-2 rounded-full shrink-0" style={{ background: c.palette[i % c.palette.length] }} />
                      {formatSourceName(s.source)}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{s.leads.toLocaleString()}</td>
                    <td className="py-2.5 text-right tabular-nums">{s.applications.toLocaleString()}</td>
                    <td className="py-2.5 text-right tabular-nums">{s.enrolled.toLocaleString()}</td>
                    <td className="py-2.5 text-right tabular-nums">
                      <span className={s.conversionRate >= 10 ? "text-success font-medium" : "text-muted-foreground"}>
                        {s.conversionRate?.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Leads by Campus — donut only, full breakdown in tooltip */}
        <Card className="p-5">
          <h3 className="font-display font-semibold text-[15px] mb-1">Leads by Campus</h3>
          <p className="text-xs text-muted-foreground mb-3">Hover a slice for source breakdown</p>
          {campusLoading ? (
            <Skeleton className="h-56 w-full rounded-lg" />
          ) : campusPieData.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-[13px] text-muted-foreground">
              No campus data available
            </div>
          ) : (
            <div className="relative h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={campusPieData}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={0}
                    onMouseEnter={(_, index) => {
                      setHoveredCampus({ name: campusPieData[index].name, total: campusPieData[index].total });
                    }}
                    onMouseLeave={() => {
                      setHoveredCampus(null);
                    }}
                  >
                    {campusPieData.map((entry) => (
                      <Cell key={entry.id} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    wrapperStyle={{ zIndex: 50 }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const campus = payload[0].payload;
                      const grandTotal = campusPieData.reduce((s, d) => s + d.total, 0);
                      const pct = grandTotal ? ((campus.total / grandTotal) * 100).toFixed(1) : "0";
                      return (
                        <div className="rounded-lg bg-card border border-border shadow-lg p-3 text-[12px] min-w-[200px] max-w-[240px] relative z-50">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="size-2.5 rounded-full shrink-0" style={{ background: campus.fill }} />
                            <span className="font-semibold text-[13px]">{campus.name}</span>
                            <span className="ml-auto text-muted-foreground tabular-nums">{pct}%</span>
                          </div>
                          <div className="font-bold text-[15px] tabular-nums mb-2.5">
                            {campus.total.toLocaleString()} <span className="text-[12px] font-normal text-muted-foreground">leads</span>
                          </div>
                          <div className="border-t border-border pt-2 space-y-1.5">
                            {campus.srcBreakdown.map((s: { source: string; count: number; color: string }) => (
                              <div key={s.source} className="flex items-center gap-2">
                                <span className="size-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                                <span className="flex-1 text-muted-foreground">{formatSourceName(s.source)}</span>
                                <span className="font-medium tabular-nums">{s.count.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider text-center truncate max-w-[120px]" title={hoveredCampus ? hoveredCampus.name : "Total Leads"}>
                  {hoveredCampus ? hoveredCampus.name : "Total Leads"}
                </span>
                <span className="text-[20px] font-bold font-display leading-tight mt-0.5">
                  {(hoveredCampus ? hoveredCampus.total : grandTotalLeads).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Source × Stage breakdown */}
      <Card className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-[15px]">Source × Stage Breakdown</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lead stage distribution per acquisition channel
            </p>
          </div>
          <ViewToggle value={stageView} onChange={setStageView} />
        </div>
        {stageLoading ? (
          <Skeleton className="h-56 w-full rounded-lg" />
        ) : sourcesWithStages.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-[13px] text-muted-foreground">
            No stage data available
          </div>
        ) : stageView === "chart" ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sourcesWithStages.map((s) => ({ source: s.source, ...s.stages }))}
                margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.06)"
                  vertical={false}
                />
                <XAxis dataKey="source" tickLine={false} axisLine={false} fontSize={11} tickFormatter={formatSourceName} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip {...c.tt} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} formatter={cap} />
                {stages.map((stage, i) => (
                  <Bar
                    key={stage}
                    dataKey={stage}
                    name={cap(stage)}
                    stackId="stage"
                    fill={c.stageColor(stage, i)}
                    radius={i === stages.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-2 font-medium text-muted-foreground">Source</th>
                  <th className="text-right pb-2 font-medium text-muted-foreground">Total</th>
                  {stages.map((s) => (
                    <th
                      key={s}
                      className="text-right pb-2 font-medium text-muted-foreground capitalize"
                    >
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sourcesWithStages.map((s) => (
                  <tr key={s.source} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 font-medium">{formatSourceName(s.source)}</td>
                    <td className="py-2.5 text-right tabular-nums font-semibold">
                      {s.total.toLocaleString()}
                    </td>
                    {stages.map((stage) => (
                      <td
                        key={stage}
                        className="py-2.5 text-right tabular-nums text-muted-foreground"
                      >
                        {(s.stages[stage] ?? 0).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Leads by Program */}
      <Card className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-[15px]">Leads by Program</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lead volume, enrollments and enrollment rate per program
            </p>
          </div>
          <ViewToggle value={programView} onChange={setProgramView} />
        </div>
        {programLoading ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : programs.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-[13px] text-muted-foreground">
            No program data available
          </div>
        ) : programView === "chart" ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={programs.slice(0, 10)}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis type="category" dataKey="programCode" tickLine={false} axisLine={false} fontSize={11} width={64} />
                <Tooltip {...c.tt} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="leads" name="Leads" fill={c.palette[1]} radius={[0, 4, 4, 0]} />
                <Bar dataKey="enrolled" name="Enrolled" fill={c.palette[3]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-2 font-medium text-muted-foreground">Program</th>
                <th className="text-right pb-2 font-medium text-muted-foreground">Leads</th>
                <th className="text-right pb-2 font-medium text-muted-foreground">Enrolled</th>
                <th className="text-right pb-2 font-medium text-muted-foreground">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {programs.map((p) => (
                <tr key={p.programId} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5">
                    <div className="font-medium leading-tight">{p.programCode}</div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">{p.programName}</div>
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{p.leads.toLocaleString()}</td>
                  <td className="py-2.5 text-right tabular-nums">{p.enrolled.toLocaleString()}</td>
                  <td className="py-2.5 text-right tabular-nums">
                    <span className={p.enrollmentRate >= 15 ? "text-success font-medium" : "text-muted-foreground"}>
                      {p.enrollmentRate?.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
