import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, StatCard, Badge } from "@/components/ui-kit";
import { Globe2, Plane, FileCheck, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/international")({
  component: () => (
    <AppShell>
      <PageHeader
        breadcrumb="Growth"
        title="International Admissions"
        subtitle="Country desks, visa tracking, embassy workflows."
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="International Leads"
          value="836"
          delta="+38%"
          icon={<Globe2 className="size-4" />}
          accent="info"
        />
        <StatCard
          label="Visa In Process"
          value="124"
          icon={<Plane className="size-4" />}
          accent="warning"
        />
        <StatCard
          label="Visa Approved"
          value="284"
          icon={<FileCheck className="size-4" />}
          accent="success"
        />
        <StatCard
          label="Avg Fee (USD)"
          value="$8,450"
          icon={<IndianRupee className="size-4" />}
          accent="gold"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-display font-semibold text-[15px] mb-3">Country Performance</h3>
          <div className="space-y-3">
            {[
              { c: "🇦🇪 UAE", l: 312, conv: 24, color: "bg-primary" },
              { c: "🇸🇬 Singapore", l: 184, conv: 31, color: "bg-secondary" },
              { c: "🇨🇦 Canada", l: 142, conv: 18, color: "bg-info" },
              { c: "🇺🇸 USA", l: 98, conv: 22, color: "bg-success" },
              { c: "🇬🇧 UK", l: 64, conv: 28, color: "bg-gold" },
              { c: "🇦🇺 Australia", l: 36, conv: 19, color: "bg-chart-5" },
            ].map((c) => (
              <div key={c.c}>
                <div className="flex justify-between mb-1 text-[12px]">
                  <span className="font-semibold">{c.c}</span>
                  <span>
                    <span className="font-bold tabular-nums">{c.l}</span> leads ·{" "}
                    <span className="text-success font-semibold">{c.conv}%</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${c.color}`} style={{ width: `${(c.l / 312) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-semibold text-[15px] mb-3">Visa Pipeline</h3>
          <div className="space-y-2">
            {[
              { s: "Documents collection", n: 48, t: "info" as const },
              { s: "Application submitted", n: 36, t: "primary" as const },
              { s: "Embassy interview scheduled", n: 22, t: "warning" as const },
              { s: "Awaiting decision", n: 18, t: "warning" as const },
              { s: "Visa approved", n: 64, t: "success" as const },
              { s: "Visa rejected (re-apply)", n: 6, t: "danger" as const },
            ].map((s) => (
              <div
                key={s.s}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40"
              >
                <span className="text-[13px] font-medium">{s.s}</span>
                <Badge tone={s.t}>{s.n}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  ),
});
