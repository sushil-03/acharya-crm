import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Building2 } from "lucide-react";
import { Card } from "@/components/ui-kit";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useGetLeadsSourceByCampus,
  useGetLeadsSourceByProgram,
  type AnalyticsFilters,
} from "@/components/dashboard/hook/query/use-get-analytics";
import { getChartColors, formatSourceName } from "@/lib/chart-colors";

interface CollegesTabProps {
  filters: AnalyticsFilters;
  selectedCampusId: string;
}

export function CollegesTab({ filters, selectedCampusId }: CollegesTabProps) {
  const { palette, tt } = getChartColors();

  const { data: byCampus, isLoading: campusLoading } = useGetLeadsSourceByCampus(filters);
  const { data: byProgram, isLoading: programLoading } = useGetLeadsSourceByProgram(filters);

  const campusSources = byCampus?.sources || [];
  const programSources = byProgram?.sources || [];

  // Campus grouped chart data: one row per campus, one key per source
  const campusChartData = (byCampus?.campuses || []).map((campus) => {
    const row: Record<string, string | number> = { campus: campus.name };
    let total = 0;
    campusSources.forEach((src) => {
      const n = byCampus?.data.find((d) => d.campusId === campus.id && d.source === src)?.count ?? 0;
      row[src] = n;
      total += n;
    });
    row._total = total;
    return row;
  }).filter((r) => (r._total as number) > 0);

  // Source totals across all campuses
  const sourceTotals = campusSources
    .map((src) => ({
      src,
      total: (byCampus?.data || []).filter((d) => d.source === src).reduce((s, d) => s + d.count, 0),
    }))
    .sort((a, b) => b.total - a.total);

  const grandTotal = sourceTotals.reduce((s, x) => s + x.total, 0);

  // Program leaderboard: per-program total + top source
  const programRows = (byProgram?.programs || [])
    .map((prog) => {
      let total = 0;
      let topSrc = "";
      let topCount = 0;
      programSources.forEach((src) => {
        const n = byProgram?.data.find((d) => d.programId === prog.id && d.source === src)?.count ?? 0;
        total += n;
        if (n > topCount) { topCount = n; topSrc = src; }
      });
      return { ...prog, total, topSrc, topCount };
    })
    .filter((p) => p.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 12);

  const maxProgramTotal = programRows[0]?.total ?? 1;

  return (
    <div className="space-y-4">
      {selectedCampusId === "all" && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/60 border border-border text-[13px] text-muted-foreground">
          <Building2 className="size-4 shrink-0" />
          Showing all campuses. Select a specific campus for focused metrics.
        </div>
      )}

      {/* ── Campus Section ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Grouped bar chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-5">
            <h3 className="font-display font-semibold text-[15px]">Source Performance by Campus</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lead volume per acquisition channel across each campus
            </p>
          </div>
          {campusLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : campusChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[13px] text-muted-foreground">
              No campus data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={campusChartData}
                barGap={3}
                barCategoryGap="28%"
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="campus" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip {...tt} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                {campusSources.map((src, i) => (
                  <Bar
                    key={src}
                    dataKey={src}
                    name={formatSourceName(src)}
                    fill={palette[i % palette.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Source breakdown summary */}
        <Card className="p-5">
          <h3 className="font-display font-semibold text-[15px] mb-1">Channel Mix</h3>
          <p className="text-xs text-muted-foreground mb-4">Total leads by source across all campuses</p>
          {campusLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 rounded" />)}
            </div>
          ) : sourceTotals.length === 0 ? (
            <div className="text-[13px] text-muted-foreground text-center py-6">No data</div>
          ) : (
            <div className="space-y-3">
              {sourceTotals.map(({ src, total }, i) => {
                const pct = grandTotal ? Math.round((total / grandTotal) * 100) : 0;
                return (
                  <div key={src}>
                    <div className="flex items-center justify-between text-[13px] mb-1.5">
                      <span className="flex items-center gap-2 font-medium">
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ background: palette[i % palette.length] }}
                        />
                        {formatSourceName(src)}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {total.toLocaleString()}
                        <span className="text-[11px] ml-1.5">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: palette[i % palette.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Program Leaderboard ──────────────────────────────────────── */}
      <Card className="p-5">
        <div className="mb-5">
          <h3 className="font-display font-semibold text-[15px]">Program Lead Leaderboard</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Top programs by total lead volume with dominant acquisition channel
          </p>
        </div>
        {programLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
          </div>
        ) : programRows.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-[13px] text-muted-foreground">
            No program data available
          </div>
        ) : (
          <div className="space-y-0">
            {programRows.map((prog, rank) => {
              const pct = Math.round((prog.total / maxProgramTotal) * 100);
              const sourceIdx = programSources.indexOf(prog.topSrc);
              const sourceColor = palette[sourceIdx % palette.length];
              return (
                <div
                  key={prog.id}
                  className="flex items-center gap-4 py-3 border-b border-border last:border-0 group"
                >
                  {/* Rank */}
                  <span
                    className={cn(
                      "text-[12px] font-bold tabular-nums w-5 shrink-0 text-center",
                      rank === 0
                        ? "text-amber-500"
                        : rank === 1
                          ? "text-slate-400"
                          : rank === 2
                            ? "text-orange-400"
                            : "text-muted-foreground/50",
                    )}
                  >
                    {rank + 1}
                  </span>

                  {/* Program info + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="min-w-0 mr-3">
                        <span className="text-[13px] font-semibold">{prog.code}</span>
                        <span className="text-[12px] text-muted-foreground ml-2 truncate hidden sm:inline">
                          {prog.name}
                        </span>
                      </div>
                      <span className="text-[13px] font-semibold tabular-nums shrink-0">
                        {prog.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: palette[0] }}
                      />
                    </div>
                  </div>

                  {/* Top source badge */}
                  {prog.topSrc && (
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 hidden md:inline"
                      style={{
                        background: `color-mix(in srgb, ${sourceColor} 12%, transparent)`,
                        color: sourceColor,
                      }}
                    >
                      {formatSourceName(prog.topSrc)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
