import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SelectField } from "@/components/ui/form-fields/select-field";
import { InputField } from "@/components/ui/form-fields/input-field";
import { TextareaField } from "@/components/ui/form-fields/textarea-field";
import { SCHOLARSHIP_TYPES } from "@/lib/constant";
import { useAttachScholarship } from "./hook/mutation/use-attach-scholarship";

const formSchema = z.object({
  scholarshipType: z.string().min(1, "Scholarship Type is required"),
  amountType: z.string().min(1, "Amount Type is required"),
  amountValue: z.union([z.string(), z.number()]).transform((v) => Number(v) || 0),
  reason: z.string().optional(),
});

type FormValues = z.input<typeof formSchema>;

export function AttachScholarshipModal({
  offerId,
  open,
  onOpenChange,
}: {
  offerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate: attachScholarship, isPending } = useAttachScholarship(offerId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scholarshipType: "",
      amountType: "",
      amountValue: "",
      reason: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    attachScholarship(
      {
        scholarshipType: values.scholarshipType,
        amountType: values.amountType,
        amountValue: Number(values.amountValue),
        reason: values.reason,
        criteriaMet: {},
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Scholarship</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            onKeyDown={(e) => {
              if (e.key !== "Tab" && e.key !== "Escape") {
                e.stopPropagation();
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <SelectField
              control={form.control}
              name="scholarshipType"
              label="Scholarship Type"
              options={SCHOLARSHIP_TYPES}
              placeholder="Select Type"
            />
            <SelectField
              control={form.control}
              name="amountType"
              label="Amount Type"
              options={[
                { label: "Percentage", value: "percentage" },
                { label: "Fixed Amount", value: "fixed" },
              ]}
              placeholder="Select Amount Type"
            />
            <InputField
              control={form.control}
              name="amountValue"
              label="Amount Value"
              type="number"
              placeholder="Enter amount"
            />
            <TextareaField
              control={form.control}
              name="reason"
              label="Reason (Optional)"
              placeholder="Enter reason"
              rows={3}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding..." : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
