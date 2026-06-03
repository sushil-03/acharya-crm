import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { TextareaField } from "@/components/ui/form-fields/textarea-field";
import { Button } from "@/components/ui/button";
import { useRejectScholarship } from "./hook/mutation/use-update-scholarship";

const rejectSchema = z.object({
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

type RejectFormValues = z.infer<typeof rejectSchema>;

interface RejectScholarshipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scholarshipId: string;
}

export function RejectScholarshipModal({ open, onOpenChange, scholarshipId }: RejectScholarshipModalProps) {
  const { mutate: rejectScholarship, isPending } = useRejectScholarship();

  const form = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      reason: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = (data: RejectFormValues) => {
    rejectScholarship(
      {
        id: scholarshipId,
        payload: { reason: data.reason },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md"
        onKeyDown={(e) => {
          if (e.key !== "Tab" && e.key !== "Escape") {
            e.stopPropagation();
          }
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Reject Scholarship</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TextareaField
              control={form.control}
              name="reason"
              label="Rejection Reason"
              placeholder="Please provide a reason for rejecting this scholarship..."
              rows={4}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? "Rejecting..." : "Reject Scholarship"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
