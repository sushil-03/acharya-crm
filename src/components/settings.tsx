import { Card, PageHeader, Badge } from "@/components/ui-kit";
import { Shield, Users, Bell, Building2, Lock } from "lucide-react";
import { AppShell } from "./app-shell";
import { Button } from "./ui/button";

export function SettingsContent() {
  return (
    <AppShell>
      <PageHeader
        breadcrumb="Workspace"
        title="Settings & Roles"
        subtitle="Permissions, audit logs, integrations and compliance."
      />
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
        <Card className="p-3 h-fit">
          {[
            { i: Users, l: "Roles & Permissions", a: true },
            { i: Building2, l: "Campuses & Programs" },
            { i: Bell, l: "Notifications" },
            { i: Lock, l: "Authentication / SSO" },
            { i: Shield, l: "Audit & Compliance" },
          ].map((s, i) => (
            <Button
              key={i}
              variant={s.a ? "default" : "outline"}
              className={`w-full flex justify-start shadow-none gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium border-none`}
            >
              <s.i className="size-4" /> {s.l}
            </Button>
          ))}
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-semibold text-[15px] mb-4">Roles</h3>
          <table className="w-full text-[13px]">
            <thead className="text-muted-foreground">
              <tr className="text-left">
                {["Role", "Users", "Modules", "Data Scope", "Status"].map((h) => (
                  <th key={h} className="py-2 font-semibold text-[11px] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { r: "Super Admin", u: 3, m: "All", s: "All campuses" },
                { r: "Chairman", u: 1, m: "Read-only", s: "All campuses" },
                { r: "Admissions Director", u: 4, m: "Admissions, Finance", s: "All campuses" },
                { r: "Marketing", u: 12, m: "Marketing, Leads", s: "All campuses" },
                { r: "Counsellor", u: 48, m: "CRM, Apps", s: "Assigned only" },
                { r: "Verification Team", u: 14, m: "Verification", s: "All campuses" },
                { r: "Finance", u: 8, m: "Finance, Refunds", s: "All campuses" },
                { r: "International Desk", u: 6, m: "Intl, Visa", s: "Intl leads" },
                { r: "Channel Partner", u: 142, m: "Partner Portal", s: "Own leads" },
                { r: "Student", u: 8240, m: "Student Portal", s: "Self" },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-muted/40">
                  <td className="py-3 font-semibold">{r.r}</td>
                  <td className="py-3 tabular-nums">{r.u}</td>
                  <td className="py-3 text-[12px]">{r.m}</td>
                  <td className="py-3 text-[12px]">{r.s}</td>
                  <td className="py-3">
                    <Badge tone="success">Active</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AppShell>
  );
}
