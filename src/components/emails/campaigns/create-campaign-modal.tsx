import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ChevronRight, ChevronLeft, Users, FileText, CalendarClock, Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { InputField } from "@/components/ui/form-fields/input-field";
import { SelectField } from "@/components/ui/form-fields/select-field";
import { AutocompleteField } from "@/components/ui/form-fields/autocomplete-field";
import { MultiSelectTagsField } from "@/components/ui/form-fields/multi-select-tags-field";
import { DatePickerWithYearField } from "@/components/ui/form-fields/date-picker-with-year-field";

import { useGetEmailTemplates } from "@/components/emails/hooks/query/use-get-email-templates";
import { useGetCampuses } from "@/components/global/hooks/use-get-campuses";
import { useGetLists } from "@/components/lists/hook/query/use-get-lists";

import { useCreateEmailCampaign } from "./hooks/mutation/use-create-email-campaign";
import { useUpdateEmailCampaign } from "./hooks/mutation/use-update-email-campaign";
import { useScheduleEmailCampaign } from "./hooks/mutation/use-schedule-email-campaign";
import { usePreviewRecipients } from "./hooks/query/use-preview-recipients";

import type { Campaign, RecipientFilterType, LeadStatus } from "./types";

// ── Schema ──────────────────────────────────────────────────────────────────

const schema = z
  .object({
    name: z.string().min(1, "Campaign name is required"),
    category: z.string().min(1, "Category is required"),
    emailTemplateId: z.string().min(1, "Please select a template"),
    filterType: z.enum(["all_leads", "by_status", "by_campus", "by_list"]),
    statuses: z.array(z.string()).optional(),
    campusIds: z.array(z.string()).optional(),
    listIds: z.array(z.string()).optional(),
    sendMode: z.enum(["now", "scheduled"]),
    scheduledAt: z.date().nullable().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.filterType === "by_status" && (!val.statuses || val.statuses.length === 0)) {
      ctx.addIssue({ code: "custom", path: ["statuses"], message: "Select at least one status" });
    }
    if (val.filterType === "by_campus" && (!val.campusIds || val.campusIds.length === 0)) {
      ctx.addIssue({ code: "custom", path: ["campusIds"], message: "Select at least one campus" });
    }
    if (val.filterType === "by_list" && (!val.listIds || val.listIds.length === 0)) {
      ctx.addIssue({ code: "custom", path: ["listIds"], message: "Select at least one list" });
    }
    if (val.sendMode === "scheduled" && !val.scheduledAt) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledAt"],
        message: "Please pick a date and time",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

// ── Props ────────────────────────────────────────────────────────────────────

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCampaign?: Campaign | null;
}

// ── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { label: "Details", icon: FileText },
  { label: "Recipients", icon: Users },
  { label: "Schedule", icon: CalendarClock },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = idx < current;
        const active = idx === current;
        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors",
                  done && "bg-primary border-primary text-white",
                  active && "border-primary text-primary bg-primary/10",
                  !done && !active && "border-border text-muted-foreground bg-background",
                )}
              >
                {done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-1 font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mb-5 mx-1 transition-colors",
                  idx < current ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Lead status options ──────────────────────────────────────────────────────

const LEAD_STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "assigned", label: "Assigned" },
  { value: "contacted", label: "Contacted" },
  { value: "nurturing", label: "Nurturing" },
];

const CATEGORY_OPTIONS = [
  "Admissions",
  "Scholarships",
  "Events",
  "Finance",
  "General",
].map((c) => ({ value: c, label: c }));

// ── Component ────────────────────────────────────────────────────────────────

export function CreateCampaignModal({ open, onOpenChange, editCampaign }: CreateCampaignModalProps) {
  const [step, setStep] = useState(0);
  const [draftId, setDraftId] = useState<string | null>(editCampaign?.id ?? null);

  const isEditing = !!editCampaign;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editCampaign?.name ?? "",
      category: editCampaign?.category ?? "",
      emailTemplateId: editCampaign?.emailTemplateId ?? "",
      filterType: (editCampaign?.recipientFilter?.type as RecipientFilterType) ?? "all_leads",
      statuses: (editCampaign?.recipientFilter?.statuses as string[]) ?? [],
      campusIds: editCampaign?.recipientFilter?.campusIds ?? [],
      listIds: editCampaign?.recipientFilter?.listIds ?? [],
      sendMode: "now",
      scheduledAt: null,
    },
  });

  const filterType = form.watch("filterType");
  const sendMode = form.watch("sendMode");

  // Data fetching
  const { data: templatesData, isLoading: isLoadingTemplates } = useGetEmailTemplates({
    isActive: true,
    pageSize: 100,
  });
  const { data: campuses, isLoading: isLoadingCampuses } = useGetCampuses({ isActive: true });
  const { data: lists, isLoading: isLoadingLists } = useGetLists();

  // Mutations
  const { mutateAsync: createCampaign, isPending: isCreating } = useCreateEmailCampaign();
  const { mutateAsync: updateCampaign, isPending: isUpdating } = useUpdateEmailCampaign();
  const { mutateAsync: scheduleCampaign, isPending: isScheduling } = useScheduleEmailCampaign();

  // Preview recipients (step 3 only)
  const { data: preview, isLoading: isLoadingPreview } = usePreviewRecipients(
    step === 2 ? (draftId ?? undefined) : undefined,
  );

  const templateOptions = (templatesData?.data ?? []).map((t) => ({
    value: t.id,
    label: t.name,
    selectedLabel: t.name,
    searchKeys: [t.name, t.subject],
  }));

  const campusOptions = (campuses ?? []).map((c) => ({ value: c.id, label: c.name }));
  const listOptions = (lists ?? []).map((l) => ({ value: l.id, label: l.name }));

  const buildFilter = (values: FormValues) => {
    switch (values.filterType) {
      case "by_status":
        return { type: "by_status" as const, statuses: values.statuses as LeadStatus[] };
      case "by_campus":
        return { type: "by_campus" as const, campusIds: values.campusIds };
      case "by_list":
        return { type: "by_list" as const, listIds: values.listIds };
      default:
        return { type: "all_leads" as const };
    }
  };

  const handleClose = () => {
    form.reset();
    setStep(0);
    setDraftId(editCampaign?.id ?? null);
    onOpenChange(false);
  };

  // Step 1 → 2: validate details fields
  const handleNextFromStep1 = async () => {
    const valid = await form.trigger(["name", "category", "emailTemplateId"]);
    if (valid) setStep(1);
  };

  // Step 2 → 3: save draft (create or update), then move to schedule step
  const handleNextFromStep2 = async () => {
    const valid = await form.trigger(["filterType", "statuses", "campusIds", "listIds"]);
    if (!valid) return;

    const values = form.getValues();
    const filter = buildFilter(values);

    try {
      if (!draftId) {
        const campaign = await createCampaign({
          name: values.name,
          category: values.category,
          emailTemplateId: values.emailTemplateId,
          recipientFilter: filter,
        });
        setDraftId(campaign.id);
      } else {
        await updateCampaign({
          id: draftId,
          payload: {
            name: values.name,
            category: values.category,
            emailTemplateId: values.emailTemplateId,
            recipientFilter: filter,
          },
        });
      }
      setStep(2);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save campaign");
    }
  };

  // Final submit: schedule the campaign
  const handleSchedule = async () => {
    const valid = await form.trigger(["sendMode", "scheduledAt"]);
    if (!valid || !draftId) return;

    const values = form.getValues();

    try {
      const payload =
        values.sendMode === "scheduled" && values.scheduledAt
          ? { scheduledAt: values.scheduledAt.toISOString() }
          : {};

      await scheduleCampaign({ id: draftId, payload });
      toast.success(
        values.sendMode === "now"
          ? "Campaign is being sent!"
          : "Campaign scheduled successfully",
      );
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule campaign");
    }
  };

  const isBusy = isCreating || isUpdating || isScheduling;

  return (
    <Dialog open={open} onOpenChange={(o) => !isBusy && (o ? undefined : handleClose())}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Campaign" : "Create Email Campaign"}</DialogTitle>
        </DialogHeader>

        <StepIndicator current={step} />

        <Form {...form}>
          <form className="space-y-4">
            {/* ── Step 1: Details ── */}
            {step === 0 && (
              <>
                <InputField
                  control={form.control}
                  name="name"
                  label="Campaign Name"
                  placeholder="e.g. June Admissions Outreach"
                />
                <SelectField
                  control={form.control}
                  name="category"
                  label="Category"
                  options={CATEGORY_OPTIONS}
                  placeholder="Select category"
                />
                <AutocompleteField
                  control={form.control}
                  name="emailTemplateId"
                  label="Email Template"
                  options={templateOptions}
                  placeholder={isLoadingTemplates ? "Loading templates…" : "Select a template"}
                  isLoading={isLoadingTemplates}
                />
              </>
            )}

            {/* ── Step 2: Recipients ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm mb-2 block">Recipient Filter</Label>
                  <RadioGroup
                    value={filterType}
                    onValueChange={(v) => form.setValue("filterType", v as RecipientFilterType)}
                    className="space-y-2"
                  >
                    {(
                      [
                        { value: "all_leads", label: "All Leads (with email)" },
                        { value: "by_status", label: "By Lead Status" },
                        { value: "by_campus", label: "By Campus" },
                        { value: "by_list", label: "By Lead List" },
                      ] as const
                    ).map((opt) => (
                      <div key={opt.value} className="flex items-center gap-2">
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <Label htmlFor={opt.value} className="font-normal cursor-pointer text-sm">
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {filterType === "by_status" && (
                  <MultiSelectTagsField
                    control={form.control}
                    name="statuses"
                    label="Lead Statuses"
                    options={LEAD_STATUS_OPTIONS}
                    placeholder="Select statuses…"
                  />
                )}

                {filterType === "by_campus" && (
                  <MultiSelectTagsField
                    control={form.control}
                    name="campusIds"
                    label="Campuses"
                    options={campusOptions}
                    placeholder={isLoadingCampuses ? "Loading campuses…" : "Select campuses…"}
                    isLoading={isLoadingCampuses}
                  />
                )}

                {filterType === "by_list" && (
                  <MultiSelectTagsField
                    control={form.control}
                    name="listIds"
                    label="Lead Lists"
                    options={listOptions}
                    placeholder={isLoadingLists ? "Loading lists…" : "Select lists…"}
                    isLoading={isLoadingLists}
                  />
                )}
              </div>
            )}

            {/* ── Step 3: Schedule ── */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Preview count */}
                <div className="rounded-lg bg-info/10 border border-info/20 px-4 py-3 text-sm">
                  {isLoadingPreview ? (
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Loader2 className="size-3.5 animate-spin" /> Calculating recipients…
                    </span>
                  ) : preview ? (
                    <span>
                      This campaign will be sent to{" "}
                      <strong className="text-info">{preview.estimatedRecipients}</strong> leads.
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Could not estimate recipients.</span>
                  )}
                </div>

                {/* Send mode */}
                <div>
                  <Label className="text-sm mb-2 block">When to send</Label>
                  <RadioGroup
                    value={sendMode}
                    onValueChange={(v) => form.setValue("sendMode", v as "now" | "scheduled")}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="now" id="send-now" />
                      <Label htmlFor="send-now" className="font-normal cursor-pointer text-sm">
                        Send immediately
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="scheduled" id="send-later" />
                      <Label htmlFor="send-later" className="font-normal cursor-pointer text-sm">
                        Schedule for a specific time
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {sendMode === "scheduled" && (
                  <DatePickerWithYearField
                    control={form.control}
                    name="scheduledAt"
                    label="Schedule Date & Time (IST)"
                    includeTime
                    disabled={(d) => d < new Date()}
                    placeholder="Pick a date and time"
                  />
                )}

                <p className="text-xs text-muted-foreground">
                  This action cannot be undone once the campaign starts sending.
                </p>
              </div>
            )}
          </form>
        </Form>

        <DialogFooter className="gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isBusy}>
              <ChevronLeft className="size-3.5 mr-1" /> Back
            </Button>
          )}

          {step === 0 && (
            <Button onClick={handleNextFromStep1}>
              Next <ChevronRight className="size-3.5 ml-1" />
            </Button>
          )}

          {step === 1 && (
            <Button onClick={handleNextFromStep2} disabled={isBusy}>
              {isBusy ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : (
                <ChevronRight className="size-3.5 ml-1" />
              )}
              {isBusy ? "Saving…" : "Next"}
            </Button>
          )}

          {step === 2 && (
            <Button onClick={handleSchedule} disabled={isBusy || isLoadingPreview}>
              {isScheduling ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : null}
              {sendMode === "now" ? "Send Now" : "Schedule Campaign"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
