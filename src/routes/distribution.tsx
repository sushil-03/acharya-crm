import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, StatCard, Badge } from "@/components/ui-kit";
import { GitBranch, Clock, Users, AlertTriangle, ArrowRight, Plus } from "lucide-react";
import { counsellors } from "@/lib/mock-data";

export const Route = createFileRoute("/distribution")({
  component: () => (
    <AppShell>
      <PageHeader
        breadcrumb="Admissions Pipeline"
        title="Lead Distribution Engine"
        subtitle="Routing rules, SLA monitoring and counsellor allocation."
        actions={
          <button className="rounded-lg bg-primary text-primary-foreground px-3 h-9 text-[13px] font-semibold flex items-center gap-1.5">
            <Plus className="size-4" /> New Rule
          </button>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Rules" value="14" icon={<GitBranch className="size-4" />} />
        <StatCard
          label="Avg Assign Time"
          value="42s"
          delta="-18s"
          icon={<Clock className="size-4" />}
          accent="success"
        />
        <StatCard
          label="SLA Breaches"
          value="6"
          icon={<AlertTriangle className="size-4" />}
          accent="warning"
        />
        <StatCard
          label="Active Counsellors"
          value="48"
          icon={<Users className="size-4" />}
          accent="info"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-display font-semibold text-[15px] mb-4">Routing Rules</h3>
          <div className="space-y-2">
            {[
              { c: "Source = Google Ads AND Score > 75", r: "→ Senior counsellors (Round Robin)" },
              { c: "Country ≠ India", r: "→ International desk" },
              { c: "Program contains 'MBA'", r: "→ MBA specialists" },
              { c: "Score < 40", r: "→ Telecaller pool" },
              { c: "Re-engagement (>30 days)", r: "→ Win-back team" },
            ].map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/40 border border-border">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                  If
                </div>
                <div className="text-[13px] font-medium font-mono">{r.c}</div>
                <div className="flex items-center gap-2 mt-2 text-[13px] text-primary font-semibold">
                  <ArrowRight className="size-3.5" />
                  {r.r}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-semibold text-[15px] mb-4">Counsellor Load Balance</h3>
          <div className="space-y-3">
            {counsellors.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-gradient-brand grid place-items-center text-white text-[11px] font-bold">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-muted-foreground">{c.load}/60</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden mt-1">
                    <div
                      className={`h-full ${c.load > 50 ? "bg-warning" : "bg-success"}`}
                      style={{ width: `${(c.load / 60) * 100}%` }}
                    />
                  </div>
                </div>
                <Badge tone={c.load > 50 ? "warning" : "success"}>
                  {c.load > 50 ? "High" : "OK"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  ),
});
