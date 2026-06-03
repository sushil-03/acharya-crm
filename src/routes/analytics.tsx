import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, StatCard, Badge } from "@/components/ui-kit";
import { funnelData, monthlyTrend, campusPerf, sourceMix } from "@/lib/mock-data";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { BarChart3, TrendingUp, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: Analytics,
  head: () => ({ meta: [{ title: "Analytics & BI — Acharya One" }] }),
});

const cohort = monthlyTrend.map((m) => ({ ...m, retention: 80 + Math.random() * 15 }));
const radarData = [
  { k: "Lead Quality", BLR: 88, MYR: 72, HYD: 80 },
  { k: "Conversion", BLR: 78, MYR: 64, HYD: 71 },
  { k: "Speed", BLR: 92, MYR: 68, HYD: 74 },
  { k: "Yield", BLR: 84, MYR: 70, HYD: 76 },
  { k: "Quality Score", BLR: 90, MYR: 76, HYD: 82 },
];

function Analytics() {
  return (
    <AppShell>
      <PageHeader
        breadcrumb="Intelligence"
        title="Analytics & Business Intelligence"
        subtitle="Funnel, cohort, attribution, predictive — across every campus."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Funnel Conv (E2E)"
          value="9.94%"
          delta="+1.2pp"
          icon={<TrendingUp className="size-4" />}
        />
        <StatCard
          label="Avg Lead Age"
          value="8.4 days"
          delta="-1.2d"
          icon={<BarChart3 className="size-4" />}
          accent="info"
        />
        <StatCard
          label="CAC"
          value="₹2,840"
          delta="-12%"
          icon={<Users className="size-4" />}
          accent="success"
        />
        <StatCard
          label="Predicted Enroll"
          value="1,460"
          icon={<Sparkles className="size-4" />}
          accent="gold"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <h3 className="font-display font-semibold text-[15px] mb-3">Cohort Retention</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={cohort}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="m"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    fontSize: 12,
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--card-foreground)",
                  }}
                />
                <Line
                  dataKey="retention"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold text-[15px] mb-3">Campus Quality Radar</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="k"
                  fontSize={10}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <PolarRadiusAxis
                  fontSize={9}
                  tick={{ fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Radar
                  dataKey="BLR"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.3}
                />
                <Radar
                  dataKey="MYR"
                  stroke="var(--chart-2)"
                  fill="var(--chart-2)"
                  fillOpacity={0.3}
                />
                <Radar
                  dataKey="HYD"
                  stroke="var(--chart-3)"
                  fill="var(--chart-3)"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    fontSize: 12,
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--card-foreground)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5 mb-6">
        <h3 className="font-display font-semibold text-[15px] mb-3">
          Geographic Lead Distribution
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { c: "Karnataka", l: 4820, color: "bg-primary" },
            { c: "Maharashtra", l: 1840, color: "bg-secondary" },
            { c: "Tamil Nadu", l: 1620, color: "bg-info" },
            { c: "Telangana", l: 1280, color: "bg-success" },
            { c: "Delhi NCR", l: 980, color: "bg-gold" },
            { c: "UAE", l: 412, color: "bg-chart-5" },
            { c: "Singapore", l: 184, color: "bg-chart-2" },
            { c: "Canada", l: 142, color: "bg-chart-3" },
            { c: "USA", l: 98, color: "bg-chart-4" },
            { c: "Others", l: 1104, color: "bg-muted-foreground" },
          ].map((g) => (
            <div key={g.c} className="p-3 rounded-lg bg-muted/40">
              <div className="text-[12px] text-muted-foreground">{g.c}</div>
              <div className="font-display font-bold text-xl tabular-nums">
                {g.l.toLocaleString()}
              </div>
              <div className="h-1 mt-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full ${g.color}`} style={{ width: `${(g.l / 4820) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 bg-gradient-to-br from-card to-primary-soft/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="size-7 rounded-md bg-gradient-aurora grid place-items-center">
            <Sparkles className="size-4 text-white" />
          </div>
          <h3 className="font-display font-semibold text-[15px]">
            Predictive Forecast — AY 2025–26
          </h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart
              data={[
                ...monthlyTrend,
                { m: "May*", leads: 4480, applications: 1580, enrolled: 580 },
                { m: "Jun*", leads: 4720, applications: 1720, enrolled: 640 },
              ]}
            >
              <defs>
                <linearGradient id="pf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="m"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)" }}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  fontSize: 12,
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--card)",
                  color: "var(--card-foreground)",
                }}
              />
              <Area dataKey="enrolled" stroke="var(--primary)" strokeWidth={2.5} fill="url(#pf)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="text-[11px] text-muted-foreground">
          * AI-predicted with 92% confidence based on YoY seasonality, channel mix and current
          pipeline velocity.
        </div>
      </Card>
    </AppShell>
  );
}
