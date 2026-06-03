import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, Badge, StatCard } from "@/components/ui-kit";
import { GraduationCap, CheckCircle2, Calendar, Users } from "lucide-react";
import { applications } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admissions")({
  component: () => (
    <AppShell>
      <PageHeader
        breadcrumb="Admissions Pipeline"
        title="Admission Decision Engine"
        subtitle="Eligibility matrix, interview panels and committee approvals."
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Pending Decisions"
          value="124"
          icon={<GraduationCap className="size-4" />}
          accent="warning"
        />
        <StatCard
          label="Approved Today"
          value="42"
          icon={<CheckCircle2 className="size-4" />}
          accent="success"
        />
        <StatCard
          label="Interviews Today"
          value="18"
          icon={<Calendar className="size-4" />}
          accent="info"
        />
        <StatCard label="Committee Reviewers" value="12" icon={<Users className="size-4" />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-display font-semibold text-[15px] mb-3">Decision Queue</h3>
          <div className="space-y-2">
            {applications.slice(0, 6).map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/40"
              >
                <div className="size-9 rounded-full bg-gradient-brand grid place-items-center text-white text-[11px] font-bold">
                  {a.student
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13px]">{a.student}</div>
                  <div className="text-[11px] text-muted-foreground">{a.program}</div>
                </div>
                <Badge tone="success-light">Eligible</Badge>
                <Button>Approve</Button>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-semibold text-[15px] mb-3">Interview Schedule</h3>
          <div className="space-y-2">
            {[
              { t: "10:00", n: "Aarav Sharma", p: "B.Tech CSE", panel: "Dr. Mehta + Prof. Rao" },
              { t: "10:30", n: "Diya Patel", p: "MBA Analytics", panel: "Dr. Iyer + Prof. Joshi" },
              { t: "11:00", n: "Vihaan Reddy", p: "B.Arch", panel: "Prof. Singh + Prof. Bhat" },
              { t: "11:30", n: "Saanvi Khan", p: "Pharm.D", panel: "Dr. Kapoor" },
              { t: "12:00", n: "Arjun Singh", p: "MBBS", panel: "Dr. Nair + Dr. Reddy" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                <div className="text-[12px] font-bold text-primary tabular-nums w-12">{s.t}</div>
                <div className="flex-1">
                  <div className="font-semibold text-[13px]">{s.n}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {s.p} · Panel: {s.panel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  ),
});
