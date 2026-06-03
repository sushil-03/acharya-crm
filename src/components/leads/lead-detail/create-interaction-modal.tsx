import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/form-fields/select-field";
import { InputField } from "@/components/ui/form-fields/input-field";
import { TextareaField } from "@/components/ui/form-fields/textarea-field";
import { DatePickerWithYearField } from "@/components/ui/form-fields/date-picker-with-year-field";
import { useCreateInteraction } from "../hook/mutation/use-create-interaction";
import { useState } from "react";
import { Plus } from "lucide-react";
import { LeadDetail } from "@/types/lead";

const interactionSchema = z.object({
  interactionType: z.string().min(1, "Interaction type is required"),
  outcome: z.string().optional(),
  durationSeconds: z.coerce.number().optional(),
  notes: z.string().optional(),
  followUpDate: z.date().optional(),
});

type FormValues = z.infer<typeof interactionSchema>;

export function CreateInteractionModal({ lead }: { lead: LeadDetail }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateInteraction();

  const form = useForm<FormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      interactionType: "",
      outcome: "",
      durationSeconds: 0,
      notes: "",
      followUpDate: undefined,
    },
  });

  const interactionType = form.watch("interactionType");

  const onSubmit = (data: FormValues) => {
    mutate(
      {
        id: lead.id,
        payload: {
          ...data,
          followUpDate: data.followUpDate ? data.followUpDate.toISOString() : undefined,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-sm">
          <Plus className="size-3.5" /> Log Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Interaction</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <SelectField
              control={form.control}
              name="interactionType"
              label="Interaction Type"
              options={[
                { label: "Call", value: "call" },
                { label: "Email", value: "email" },
                { label: "WhatsApp", value: "whatsapp" },
                { label: "SMS", value: "sms" },
                { label: "Visit", value: "visit" },
              ]}
            />

            <SelectField
              control={form.control}
              name="outcome"
              label="Outcome"
              options={[
                { label: "Connected", value: "connected" },
                ...(interactionType !== "email"
                  ? [{ label: "Not Answered", value: "not_answered" }]
                  : []),
                { label: "Callback Requested", value: "callback_requested" },
                { label: "Interested", value: "interested" },
                { label: "Not Interested", value: "not_interested" },
                { label: "Converted", value: "converted" },
              ]}
            />

            {interactionType === "call" && (
              <InputField
                control={form.control}
                name="durationSeconds"
                label="Duration (seconds)"
                type="number"
              />
            )}

            <DatePickerWithYearField
              control={form.control}
              name="followUpDate"
              label="Follow Up Date"
              includeTime
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />

            <TextareaField control={form.control} name="notes" label="Notes" />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
