import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, StatCard, Badge } from "@/components/ui-kit";
import {
  Users,
  GraduationCap,
  Wallet,
  TrendingUp,
  PhoneCall,
  Clock,
  Target,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import { useGetFunnel } from "@/components/dashboard/hook/query/use-get-funnel";
import { useGetSourceAttribution } from "@/components/dashboard/hook/query/use-get-source-attribution";
import { useGetCampusAnalytics } from "@/components/dashboard/hook/query/use-get-campus-analytics";
import { useGetCounsellorAnalytics } from "@/components/dashboard/hook/query/use-get-counsellor-analytics";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { useGetMyDetail } from "@/components/user/hook/query/use-get-my-detail";

// Extracted chart components
import { CampusOverviewChart } from "@/components/dashboard/chart/campus-overview-chart";
import { SourceMixChart } from "@/components/dashboard/chart/source-mix-chart";
import { AdmissionsFunnelChart } from "@/components/dashboard/chart/admissions-funnel-chart";
import { LiveActivityList } from "@/components/dashboard/chart/live-activity-list";
import { USER_ROLES } from "@/lib/constant";
import { PendingRoleDashboard } from "@/components/dashboard/pending-role-dashboard";
import { useGetCampuses } from "@/components/global/hooks/use-get-campuses";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard")({
  component: DashboardRoute,
  head: () => ({ meta: [{ title: "Executive Dashboard — Acharya One" }] }),
});

function DashboardRoute() {
  const { user, setCounsellor, setStudentId } = useUserStore();
  console.log("user", user);

  const { data: myDetail, isLoading: isDetailLoading } = useGetMyDetail();

  useEffect(() => {
    if (myDetail?.counsellorId) {
      setCounsellor(myDetail.counsellorId);
    }
    if (myDetail?.studentId) {
      setStudentId(myDetail.studentId);
    }
  }, [myDetail, setCounsellor, setStudentId]);

  if (!user || isDetailLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user.role === "student") {
    return <StudentDashboard />;
  }
  if (user.role === "counsellor") {
    return <CounsellorDashboard />;
  }
  if (user.role === "super_admin") {
    return <SuperAdminDashboard />;
  }

  return <PendingRoleDashboard />;
}

function CounsellorDashboard() {
  const { user } = useUserStore();
  const { data: analytics, isLoading } = useGetCounsellorAnalytics(user?.id);

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Workspace · Today"
        title="Counsellor Dashboard"
        subtitle="Here is an overview of your active leads and tasks."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          accent="warning" // or 'danger' if supported
        />
        <StatCard
          label="Conversion Rate"
          value={analytics?.conversionRate ? `${analytics.conversionRate}%` : "0%"}
          icon={<Target className="size-4" />}
          accent="success"
        />
      </div>
    </AppShell>
  );
}

function SuperAdminDashboard() {
  const { user } = useUserStore();
  const [selectedCampusId, setSelectedCampusId] = useState(user?.campusId || "all");

  const effectiveCampusId = selectedCampusId === "all" ? "" : selectedCampusId;
  console.log("user", user);

  const { data: campuses } = useGetCampuses({ isActive: true });
  const { data: funnelDataResp } = useGetFunnel(effectiveCampusId);
  const { data: sourceDataResp } = useGetSourceAttribution(effectiveCampusId);
  const { data: campusDataResp } = useGetCampusAnalytics(effectiveCampusId);

  const actualFunnelData = funnelDataResp?.stages || [];
  const actualSourceMix =
    sourceDataResp?.sources.map((s) => ({
      name: s.source,
      value: s.leads,
    })) || [];

  const actualCampusPerf = [
    {
      metric: "Total Leads",
      value: funnelDataResp?.summary?.totalLeads || 0,
      fill: "oklch(0.65 0.18 195)",
    },
    {
      metric: "Enrolled",
      value: campusDataResp?.enrolled || 0,
      fill: "oklch(0.55 0.22 264)",
    },
    {
      metric: "Revenue (₹ Lakhs)",
      value: campusDataResp?.revenueCollected
        ? Math.round(campusDataResp.revenueCollected / 100000)
        : 0,
      fill: "oklch(0.76 0.15 75)",
    },
  ];

  const funnelConversion = funnelDataResp?.summary?.offerAcceptanceRate
    ? `${funnelDataResp.summary.offerAcceptanceRate}% end-to-end`
    : "9.94% end-to-end";

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Dashboard · AY 2025–26"
        title="Dashboard"
        subtitle="Live admissions intelligence across 4 campuses, 12 programs and 6 acquisition channels."
        actions={
          <div className="flex items-center gap-2">
            <Select value={selectedCampusId} onValueChange={setSelectedCampusId}>
              <SelectTrigger className="w-[200px] h-9 text-[13px] bg-card">
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
            <button className="rounded-lg border border-border bg-card hover:bg-muted px-3 h-9 text-[13px] font-medium">
              Last 30 days
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Pipeline"
          value={funnelDataResp?.summary?.totalLeads?.toLocaleString() || "0"}
          // delta="+18.4%"
          icon={<Users className="size-4" />}
          accent="primary"
        />
        <StatCard
          label="Confirmed Enrollments"
          value={campusDataResp?.enrolled?.toLocaleString() || "0"}
          // delta="+22.1%"
          icon={<GraduationCap className="size-4" />}
          accent="success"
        />
        <StatCard
          label="Revenue Booked"
          value={
            campusDataResp?.revenueCollected
              ? `₹${(campusDataResp.revenueCollected / 10000000).toFixed(1)} Cr`
              : "₹0"
          }
          // delta="+14.6%"
          icon={<Wallet className="size-4" />}
          accent="gold"
        />
        <StatCard
          label="Conversion Rate"
          value={
            funnelDataResp?.summary?.enrollmentYield
              ? `${funnelDataResp.summary.enrollmentYield}%`
              : "0%"
          }
          // delta="+1.2pp"
          icon={<TrendingUp className="size-4" />}
          accent="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-display font-semibold text-[15px]">Admissions Velocity</h3>
              <p className="text-xs text-muted-foreground">
                Leads → Applications → Enrollment by month
              </p>
            </div>
            <div className="flex gap-1">
              {["6M", "1Y", "All"].map((t, i) => (
                <button
                  key={t}
                  className={`px-2.5 h-7 rounded-md text-[11px] font-medium ${i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.22 264)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.55 0.22 264)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.70 0.17 145)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.70 0.17 145)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.76 0.15 75)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.76 0.15 75)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 255)"
                  vertical={false}
                />
                <XAxis
                  dataKey="m"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="oklch(0.50 0.03 260)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="oklch(0.50 0.03 260)"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid oklch(0.92 0.01 255)",
                    fontSize: 12,
                  }}
                />
                <Area
                  dataKey="leads"
                  stroke="oklch(0.55 0.22 264)"
                  strokeWidth={2}
                  fill="url(#g1)"
                />
                <Area
                  dataKey="applications"
                  stroke="oklch(0.70 0.17 145)"
                  strokeWidth={2}
                  fill="url(#g2)"
                />
                <Area
                  dataKey="enrolled"
                  stroke="oklch(0.76 0.15 75)"
                  strokeWidth={2.5}
                  fill="url(#g3)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card> */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-[15px]">Campus Overview</h3>
              <p className="text-xs text-muted-foreground">
                Key metrics for {campusDataResp?.campusName || "selected campus"}
              </p>
            </div>
            <Link to="/analytics" className="text-[12px] text-primary font-medium">
              View report →
            </Link>
          </div>
          <CampusOverviewChart data={actualCampusPerf} />
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-[15px]">Source Mix</h3>
            <Badge tone="primary">Live</Badge>
          </div>
          <SourceMixChart data={actualSourceMix} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* <Card className="p-5 bg-gradient-to-br from-card via-card to-primary-soft/40">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-7 rounded-md bg-gradient-aurora grid place-items-center">
              <Sparkles className="size-4 text-white" />
            </div>
            <h3 className="font-display font-semibold text-[15px]">Acharya AI Insights</h3>
          </div>
          <div className="space-y-3">
            {[
              {
                tone: "warning" as const,
                icon: AlertTriangle,
                t: "Lead drop-off risk",
                d: "8 qualified leads inactive 5+ days at HYD-03",
              },
              {
                tone: "success" as const,
                icon: Target,
                t: "Channel ROI signal",
                d: "Meta Ads CPL down 18% — recommend +30% budget",
              },
              {
                tone: "info" as const,
                icon: Globe2,
                t: "International surge",
                d: "UAE inquiries up 42% WoW — staff EMEA desk",
              },
              {
                tone: "primary" as const,
                icon: Building2,
                t: "Capacity alert",
                d: "B.Tech CSE BLR-01 at 94% offer capacity",
              },
            ].map((i, k) => (
              <div key={k} className="flex gap-3 p-3 rounded-lg bg-card border border-border">
                <div
                  className={`mt-0.5 size-7 rounded-md grid place-items-center shrink-0 ${
                    i.tone === "warning"
                      ? "bg-warning/15 text-warning"
                      : i.tone === "success"
                        ? "bg-success/15 text-success"
                        : i.tone === "info"
                          ? "bg-info/15 text-info"
                          : "bg-primary/15 text-primary"
                  }`}
                >
                  <i.icon className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold leading-tight">{i.t}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">{i.d}</div>
                </div>
              </div>
            ))}
          </div>
        </Card> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold text-[15px]">Admissions Funnel</h3>
            <Badge tone="success">{funnelConversion}</Badge>
          </div>
          <AdmissionsFunnelChart data={actualFunnelData} />
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold text-[15px] mb-3">Live Activity</h3>
          <LiveActivityList />
        </Card>
      </div>
    </AppShell>
  );
}
