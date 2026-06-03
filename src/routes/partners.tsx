import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, Badge, StatCard } from "@/components/ui-kit";
import { Handshake, Users, IndianRupee, Plus } from "lucide-react";

export const Route = createFileRoute("/partners")({
  component: () => (
    <AppShell>
      <PageHeader
        breadcrumb="Growth"
        title="Channel Partner Portal"
        subtitle="Agent onboarding, lead submissions and commission reconciliation."
        actions={
          <button className="rounded-lg bg-primary text-primary-foreground px-3 h-9 text-[13px] font-semibold flex items-center gap-1.5">
            <Plus className="size-4" /> Onboard Partner
          </button>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active Partners"
          value="142"
          delta="+12"
          icon={<Handshake className="size-4" />}
        />
        <StatCard
          label="Partner Leads"
          value="2,840"
          delta="+24%"
          icon={<Users className="size-4" />}
          accent="info"
        />
        <StatCard
          label="Commission Paid"
          value="₹84.2L"
          icon={<IndianRupee className="size-4" />}
          accent="gold"
        />
        <StatCard label="Pending Payouts" value="₹18.6L" accent="warning" />
      </div>
      <Card className="p-5">
        <h3 className="font-display font-semibold text-[15px] mb-3">Top Partners</h3>
        <table className="w-full text-[13px]">
          <thead className="text-muted-foreground">
            <tr className="text-left">
              {["Partner", "Region", "Leads", "Enrolled", "Commission", "Status"].map((h) => (
                <th key={h} className="py-2 font-semibold text-[11px] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              { p: "EduConnect Pvt Ltd", r: "Karnataka", l: 412, e: 84, c: 1240000, s: "Verified" },
              {
                p: "GlobalEdge Counsels",
                r: "Middle East",
                l: 286,
                e: 64,
                c: 980000,
                s: "Verified",
              },
              {
                p: "BrightFuture Advisors",
                r: "Maharashtra",
                l: 248,
                e: 42,
                c: 620000,
                s: "Verified",
              },
              {
                p: "CampusMate Network",
                r: "Tamil Nadu",
                l: 184,
                e: 38,
                c: 540000,
                s: "Pending KYC",
              },
              {
                p: "EduWings International",
                r: "Singapore",
                l: 142,
                e: 28,
                c: 720000,
                s: "Verified",
              },
            ].map((r, i) => (
              <tr key={i} className="hover:bg-muted/40">
                <td className="py-3 font-semibold">{r.p}</td>
                <td className="py-3 text-muted-foreground">{r.r}</td>
                <td className="py-3 tabular-nums">{r.l}</td>
                <td className="py-3 font-bold tabular-nums">{r.e}</td>
                <td className="py-3 font-semibold tabular-nums">₹{(r.c / 100000).toFixed(1)}L</td>
                <td className="py-3">
                  <Badge tone={r.s === "Verified" ? "success" : "warning"}>{r.s}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  ),
});
