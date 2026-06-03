import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SelectField } from "@/components/ui/form-fields/select-field";
import { InputField } from "@/components/ui/form-fields/input-field";
import { useCreateOffer } from "@/components/offer/hook/mutation/use-create-offer";
import { Button } from "../ui/button";
import { useNavigate } from "@tanstack/react-router";

const offerSchema = z.object({
  offerType: z.enum(["standard", "conditional", "waitlist"], {
    required_error: "Offer type is required",
  }),
  totalFee: z.coerce.number().min(0, "Total fee must be positive"),
  conditions: z
    .array(
      z.object({
        value: z.string().min(1, "Condition cannot be empty"),
      }),
    )
    .optional(),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface CreateOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
}

export function CreateOfferModal({ open, onOpenChange, applicationId }: CreateOfferModalProps) {
  const { mutate: createOffer, isPending } = useCreateOffer();
  const navigate = useNavigate();
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      offerType: "standard",
      totalFee: 0,
      conditions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "conditions",
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        offerType: "standard",
        totalFee: 0,
        conditions: [],
      });
    }
  }, [open, form]);

  const onSubmit = (data: OfferFormValues) => {
    const conditionsArray = data.conditions
      ? data.conditions.map((c) => c.value).filter(Boolean)
      : [];

    createOffer(
      {
        applicationId,
        offerType: data.offerType,
        totalFee: data.totalFee,
        conditions: conditionsArray,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          navigate({ to: "/offer" });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        onKeyDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Create Offer</DialogTitle>
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
              name="offerType"
              label="Offer Type"
              options={[
                { label: "Standard", value: "standard" },
                { label: "Conditional", value: "conditional" },
                { label: "Waitlist", value: "waitlist" },
              ]}
            />
            <InputField control={form.control} name="totalFee" label="Total Fee" type="number" />

            {/* <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conditions</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ value: "" })}
                  className="h-8 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Condition
                </Button>
              </div>

              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <InputField
                        control={form.control}
                        name={`conditions.${index}.value`}
                        label=""
                        placeholder="Enter condition..."
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="mt-6 h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {fields.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4 border rounded-md border-dashed">
                    No conditions added.
                  </p>
                )}
              </div>
            </div> */}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Offer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
