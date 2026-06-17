import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DatePickerWithYearField } from "@/components/ui/form-fields/date-picker-with-year-field";

import { useScheduleEmailCampaign } from "./hooks/mutation/use-schedule-email-campaign";
import { usePreviewRecipients } from "./hooks/query/use-preview-recipients";
import type { Campaign } from "./types";

const schema = z
  .object({
    sendMode: z.enum(["now", "scheduled"]),
    scheduledAt: z.date().nullable().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.sendMode === "scheduled" && !val.scheduledAt) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledAt"],
        message: "Please pick a date and time",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

interface ScheduleCampaignModalProps {
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleCampaignModal({ campaign, open, onOpenChange }: ScheduleCampaignModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { sendMode: "now", scheduledAt: null },
  });

  const sendMode = form.watch("sendMode");

  const { mutateAsync: scheduleCampaign, isPending } = useScheduleEmailCampaign();
  const { data: preview, isLoading: isLoadingPreview } = usePreviewRecipients(
    open ? (campaign?.id ?? undefined) : undefined,
  );

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleSubmit = async (values: FormValues) => {
    if (!campaign) return;
    try {
      const payload =
        values.sendMode === "scheduled" && values.scheduledAt
          ? { scheduledAt: values.scheduledAt.toISOString() }
          : {};
      await scheduleCampaign({ id: campaign.id, payload });
      toast.success(
        values.sendMode === "now" ? "Campaign is being sent!" : "Campaign scheduled successfully",
      );
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule campaign");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && (o ? undefined : handleClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Campaign</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            <strong className="text-foreground">{campaign?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Recipient preview */}
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <Label className="text-sm mb-2 block">When to send</Label>
              <RadioGroup
                value={sendMode}
                onValueChange={(v) => form.setValue("sendMode", v as "now" | "scheduled")}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="now" id="sched-now" />
                  <Label htmlFor="sched-now" className="font-normal cursor-pointer text-sm">
                    Send immediately
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="scheduled" id="sched-later" />
                  <Label htmlFor="sched-later" className="font-normal cursor-pointer text-sm">
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

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || isLoadingPreview}>
                {isPending && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
                {sendMode === "now" ? "Send Now" : "Schedule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
