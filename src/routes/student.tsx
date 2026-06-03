import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui-kit";
import {
  GraduationCap,
  FileText,
  Wallet,
  Bell,
  CheckCircle2,
  Upload,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/student")({
  component: () => (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <Card className="p-6 bg-gradient-aurora text-white mb-5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <Badge tone="warning">Application APP-2025002</Badge>
            <h1 className="font-display text-2xl font-bold mt-2">Welcome back, Aarav 👋</h1>
            <p className="opacity-85 text-sm mt-1">
              B.Tech Computer Science · Bengaluru Main · Cohort 2025–29
            </p>
            <div className="mt-4">
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="opacity-90">Application progress</span>
                <span className="font-semibold">75%</span>
              </div>
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full bg-gradient-gold" style={{ width: "75%" }} />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { i: FileText, l: "Application", v: "Submitted" },
            { i: Upload, l: "Documents", v: "5/7" },
            { i: GraduationCap, l: "Offer", v: "Issued" },
            { i: Wallet, l: "Fees", v: "₹1.2L paid" },
          ].map((c, i) => (
            <Card key={i} className="p-4 text-center">
              <c.i className="size-5 text-primary mx-auto mb-1" />
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                {c.l}
              </div>
              <div className="font-bold text-[14px]">{c.v}</div>
            </Card>
          ))}
        </div>

        <Card className="p-5 mb-4">
          <h3 className="font-display font-semibold text-[15px] mb-3">Your Journey</h3>
          <div className="space-y-3">
            {[
              ["Application submitted", true],
              ["Documents verified", true],
              ["Offer letter issued", true],
              ["First fee installment paid", true],
              ["Visa documents (if international)", false],
              ["Orientation booked", false],
              ["Enrolled", false],
            ].map(([s, done]: any, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`size-7 rounded-full grid place-items-center text-[11px] ${done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground border border-border"}`}
                >
                  {done ? <CheckCircle2 className="size-4" /> : i + 1}
                </div>
                <div
                  className={`text-[13px] flex-1 ${done ? "font-semibold" : "text-muted-foreground"}`}
                >
                  {s}
                </div>
                {done && <Badge tone="success">Done</Badge>}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-card to-primary-soft/40">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-4 text-primary" />
            <h3 className="font-display font-semibold text-[14px]">Acharya Assistant</h3>
          </div>
          <p className="text-[13px] text-muted-foreground">
            "Aarav, you're missing your Aadhaar copy. Upload it to keep your offer active. Tap below
            to upload — takes 30 seconds."
          </p>
          <button className="mt-3 rounded-lg bg-primary text-primary-foreground px-3 h-9 text-[12px] font-semibold flex items-center gap-1.5">
            <Upload className="size-3.5" /> Upload Aadhaar
          </button>
        </Card>
      </div>
    </AppShell>
  ),
});
