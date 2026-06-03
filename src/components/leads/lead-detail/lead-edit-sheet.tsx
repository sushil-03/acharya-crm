import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { SelectField } from "@/components/ui/form-fields/select-field";
import { InputField } from "@/components/ui/form-fields/input-field";
import { TextareaField } from "@/components/ui/form-fields/textarea-field";
import { DatePickerWithYearField } from "@/components/ui/form-fields/date-picker-with-year-field";
import { useUpdateLead, UpdateLeadPayload } from "../hook/mutation/use-update-lead";
import { LEAD_STATUS, LANGUAGE_OPTIONS } from "@/lib/constant";

export function LeadEditSheet({ lead, open, onOpenChange, children }: any) {
  const { mutate: updateLead, isPending } = useUpdateLead();

  const form = useForm<any>({
    defaultValues: {
      status: lead.status || lead.stage || "new",
      lostReason: lead.lostReason || "",
      notes: lead.notes || "",
      courseInterest: lead.courseInterest || lead.program || "",
      campusInterest: lead.campusInterest || "",
      languagePreference: lead.languagePreference || "",
      lastContactedAt: lead.lastContactedAt ? new Date(lead.lastContactedAt) : undefined,
    },
  });

  useEffect(() => {
    form.reset({
      status: lead.status || lead.stage || "new",
      lostReason: lead.lostReason || "",
      notes: lead.notes || "",
      courseInterest: lead.courseInterest || lead.program || "",
      campusInterest: lead.campusInterest || "",
      languagePreference: lead.languagePreference || "",
      lastContactedAt: lead.lastContactedAt ? new Date(lead.lastContactedAt) : undefined,
    });
  }, [lead, form]);

  const onSubmit = (data: any) => {
    const payload: UpdateLeadPayload = {
      ...data,
      lastContactedAt: data.lastContactedAt ? data.lastContactedAt.toISOString() : undefined,
    };

    // Remove empty strings so we don't send useless data
    Object.keys(payload).forEach((key) => {
      if ((payload as any)[key] === "") {
        delete (payload as any)[key];
      }
    });

    updateLead(
      { id: lead.id, payload },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Lead Details</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <SelectField
                control={form.control}
                name="status"
                label="Lead Status"
                options={LEAD_STATUS}
              />
              <InputField
                control={form.control}
                name="lostReason"
                label="Lost Reason"
                placeholder="Enter reason if lost"
              />
              <InputField
                control={form.control}
                name="courseInterest"
                label="Course Interest"
                placeholder="e.g. B.Tech Computer Science"
              />
              <InputField
                control={form.control}
                name="campusInterest"
                label="Campus Interest"
                placeholder="e.g. Bangalore"
              />
              <SelectField
                control={form.control}
                name="languagePreference"
                label="Language Preference"
                options={LANGUAGE_OPTIONS}
                placeholder="Select language"
              />
              <DatePickerWithYearField
                control={form.control}
                name="lastContactedAt"
                label="Last Contacted At"
                includeTime={true}
              />
              <TextareaField
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Add any additional notes here"
                className="min-h-[100px]"
              />
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
