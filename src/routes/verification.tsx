import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, StatCard, Badge } from "@/components/ui-kit";
import { documents } from "@/lib/mock-data";
import {
  ShieldCheck,
  ScanLine,
  AlertTriangle,
  FileWarning,
  Eye,
  RotateCw,
  Check,
  X,
} from "lucide-react";

export const Route = createFileRoute("/verification")({
  component: VerificationPage,
  head: () => ({ meta: [{ title: "Document Verification — Acharya One" }] }),
});

function VerificationPage() {
  return (
    <AppShell>
      <PageHeader
        breadcrumb="Admissions Pipeline"
        title="Document Verification Engine"
        subtitle="OCR-powered intake, fraud detection and reviewer workflow."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="In Verification Queue"
          value="412"
          icon={<ScanLine className="size-4" />}
          accent="info"
        />
        <StatCard
          label="Verified Today"
          value="186"
          delta="+24%"
          icon={<ShieldCheck className="size-4" />}
          accent="success"
        />
        <StatCard
          label="Mismatches"
          value="34"
          icon={<AlertTriangle className="size-4" />}
          accent="warning"
        />
        <StatCard
          label="Fraud Flags"
          value="7"
          icon={<FileWarning className="size-4" />}
          accent="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">
        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-display font-semibold text-[15px]">Verification Queue</h3>
            <div className="flex bg-muted rounded-lg p-0.5">
              {["All", "Pending", "Mismatch", "Fraud"].map((t, i) => (
                <button
                  key={t}
                  className={`px-2.5 h-7 rounded-md text-[11px] font-semibold ${i === 0 ? "bg-card shadow-elev-1" : "text-muted-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr className="text-left">
                {["ID", "Student", "Document", "Status", "OCR Confidence", "Action"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 font-semibold text-[11px] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map((d) => (
                <tr key={d.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-mono text-[12px]">{d.id}</td>
                  <td className="px-4 py-3 font-semibold">{d.student}</td>
                  <td className="px-4 py-3">{d.type}</td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        d.status === "Verified"
                          ? "success"
                          : d.status === "Pending"
                            ? "warning"
                            : d.status === "Mismatch"
                              ? "info"
                              : "danger"
                      }
                    >
                      {d.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${d.confidence > 80 ? "bg-success" : d.confidence > 50 ? "bg-warning" : "bg-danger"}`}
                          style={{ width: `${d.confidence}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold tabular-nums">
                        {d.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="size-7 grid place-items-center rounded-md hover:bg-muted border border-border">
                        <Eye className="size-3.5" />
                      </button>
                      <button className="size-7 grid place-items-center rounded-md hover:bg-success/10 hover:text-success border border-border">
                        <Check className="size-3.5" />
                      </button>
                      <button className="size-7 grid place-items-center rounded-md hover:bg-danger/10 hover:text-danger border border-border">
                        <X className="size-3.5" />
                      </button>
                      <button className="size-7 grid place-items-center rounded-md hover:bg-muted border border-border">
                        <RotateCw className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-[15px]">OCR Preview</h3>
            <Badge tone="success">98% confidence</Badge>
          </div>
          <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-muted to-background border border-border overflow-hidden relative grid-bg">
            <div className="absolute inset-4 bg-card rounded-lg shadow-elev-2 p-4">
              <div className="text-[10px] text-muted-foreground mb-1">KARNATAKA STATE BOARD</div>
              <div className="font-display font-bold text-sm mb-2">10TH STANDARD MARKSHEET</div>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-semibold">Aarav Sharma</span>
                </div>
                <div className="flex justify-between">
                  <span>Roll No:</span>
                  <span className="font-semibold">KAR-2024-118934</span>
                </div>
                <div className="flex justify-between">
                  <span>DOB:</span>
                  <span className="font-semibold">12-08-2007</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1 text-[10px]">
                {["English 92", "Math 96", "Science 94", "Social 88", "Kannada 90", "Hindi 86"].map(
                  (s) => (
                    <div key={s} className="bg-muted/50 rounded px-1.5 py-0.5">
                      {s}
                    </div>
                  ),
                )}
              </div>
              <div className="absolute bottom-3 right-3 text-[8px] font-mono opacity-50">
                ID: 1184ZX9
              </div>
            </div>
            <div className="absolute top-2 left-2 size-3 rounded-full bg-success animate-pulse" />
          </div>
          <div className="mt-3 space-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name match</span>
              <Badge tone="success">100%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">DOB match</span>
              <Badge tone="success">100%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tampering check</span>
              <Badge tone="success">Clean</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cross-reference</span>
              <Badge tone="info">Board API ✓</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button className="rounded-lg border border-border h-9 text-[12px] font-semibold hover:bg-muted">
              Request Re-upload
            </button>
            <button className="rounded-lg bg-success text-success-foreground h-9 text-[12px] font-semibold">
              Approve
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
