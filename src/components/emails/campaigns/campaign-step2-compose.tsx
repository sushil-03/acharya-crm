import React, { useEffect } from "react";
import { Mail, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCampaignCreationStore } from "@/store/use-campaign-creation-store";
import { useGetEmailTemplateDetails } from "@/components/emails/hooks/query/use-get-email-template-details";
import { CampaignNavBar } from "./campaign-nav-bar";
import { toast } from "sonner";

export function CampaignStep2Compose() {
  const {
    selectedTemplateId,
    selectedTemplateName,
    name: campaignName,
    subject, setSubject,
    previewText, setPreviewText,
    fromName, setFromName,
    replyTo, setReplyTo,
    setStep,
  } = useCampaignCreationStore();

  const { data: template, isLoading, isError } = useGetEmailTemplateDetails(
    selectedTemplateId || undefined,
  );

  // Auto-fill subject from template on first load
  useEffect(() => {
    if (template?.subject && !subject) {
      setSubject(template.subject);
    }
  }, [template?.subject]);

  const canProceed = !!subject.trim();

  const handleNext = () => {
    if (!subject.trim()) { toast.error("Please enter a subject line"); return; }
    setStep(3);
  };

  const statusText = canProceed
    ? `Subject: "${subject}"`
    : "Enter a subject line to continue";

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left — Email preview */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden border-r border-border bg-muted/20">
        <div className="shrink-0 border-b border-border bg-background px-4 py-2.5 flex items-center gap-2">
          <Mail className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {selectedTemplateName || "Email Preview"}
          </span>
          {template && (
            <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {template.category || "No category"}
            </span>
          )}
        </div>

        <div className="flex-1 min-h-0 relative">
          {!selectedTemplateId && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Mail className="size-10 opacity-20" />
              <p className="text-sm font-medium">No template selected</p>
              <p className="text-xs opacity-70">Building from scratch — your content will appear here</p>
            </div>
          )}

          {selectedTemplateId && isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}

          {selectedTemplateId && isError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <AlertCircle className="size-8 opacity-30" />
              <p className="text-sm">Could not load preview</p>
            </div>
          )}

          {selectedTemplateId && template?.htmlBody && (
            <iframe
              srcDoc={template.htmlBody}
              sandbox="allow-same-origin"
              className="w-full h-full border-0"
              title="Email preview"
            />
          )}
        </div>
      </div>

      {/* Right — Compose settings */}
      <div className="w-96 shrink-0 flex flex-col overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold mb-0.5">Compose Message</h2>
            <p className="text-xs text-muted-foreground">Configure how this email will appear to recipients.</p>
          </div>

          <Divider label="Email Content" />

          <Field label="Subject Line" required hint="What recipients see in their inbox">
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Your Application Update — Batch 2027"
              className={cn("h-8 text-sm", !subject.trim() && "border-amber-400/60 focus-visible:ring-amber-400/30")}
            />
          </Field>

          <Field label="Preview Text" hint="Short summary shown after the subject in most email clients">
            <Input
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="e.g. Here's what you need to know about your admission…"
              className="h-8 text-sm"
            />
          </Field>

          <Divider label="Sender Details" />

          <Field label="From Name" hint="The name displayed as the sender">
            <Input
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="e.g. Acharya Admissions Team"
              className="h-8 text-sm"
            />
          </Field>

          <Field label="Reply-To Email" hint="Where replies will be sent">
            <Input
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="e.g. admissions@acharya.ac.in"
              className="h-8 text-sm"
            />
          </Field>

          <Divider label="Campaign" />

          <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 space-y-1.5">
            <Row label="Campaign" value={campaignName} />
            <Row label="Template" value={selectedTemplateName || "None (building from scratch)"} />
          </div>
        </div>

        <CampaignNavBar
          statusText={statusText}
          onNext={handleNext}
          canNext={canProceed}
          nextLabel="Select Recipients"
        />
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-foreground">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground leading-relaxed">{hint}</p>}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="font-medium truncate">{value || "—"}</span>
    </div>
  );
}
