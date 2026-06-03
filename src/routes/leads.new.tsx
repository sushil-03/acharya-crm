import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateLead } from "@/components/leads/hook/mutation/use-create-lead";
import { InputField } from "@/components/ui/form-fields/input-field";
import SelectField from "@/components/ui/form-fields/select-field";
import { TextareaField } from "@/components/ui/form-fields/textarea-field";
import { DatePickerWithYearField } from "@/components/ui/form-fields/date-picker-with-year-field";
import { format } from "date-fns";
import { PhoneField } from "@/components/ui/form-fields/phone-field";
import { LEAD_SOURCES, LANGUAGE_OPTIONS } from "@/lib/constant";
import { AutocompleteField } from "@/components/ui/form-fields/autocomplete-field";
import { useGetCampuses } from "@/components/global/hooks/use-get-campuses";


const GENDERS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z.string().min(10, "Mobile number is required"),
  email: z.string().email("Invalid email address"),
  dob: z.date({ required_error: "Date of birth is required" }),
  gender: z.string().min(1, "Gender is required"),
  courseInterest: z.string().optional(),
  campusInterest: z.string().optional(),
  campusId: z.string().min(1, "Campus is required"),
  sourceChannel: z.string().min(1, "Source channel is required"),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  languagePreference: z.string().optional(),
  notes: z.string().optional(),
});

export const Route = createFileRoute("/leads/new")({
  component: NewLeadPage,
});

function NewLeadPage() {
  const navigate = useNavigate();
  const { mutate: createLead, isPending } = useCreateLead();
  const { data: campusesData } = useGetCampuses({ isActive: true });

  const campusOptions = useMemo(() => {
    return (campusesData || []).map((c) => ({
      label: c.name,
      value: c.id,
    }));
  }, [campusesData]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      dob: undefined as unknown as Date,
      gender: "",
      courseInterest: "",
      campusInterest: "",
      campusId: "",
      sourceChannel: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmContent: "",
      country: "",
      state: "",
      city: "",
      languagePreference: "",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      dob: format(values.dob, "yyyy-MM-dd"), // format date
      courseInterest: values.courseInterest || "",
      campusInterest: values.campusInterest || "",
      campusId: values.campusId || "",
      sourceChannel: values.sourceChannel || "",
      country: values.country || "",
      state: values.state || "",
      city: values.city || "",
      utmSource: values.utmSource || "",
      utmMedium: values.utmMedium || "",
      utmCampaign: values.utmCampaign || "",
      utmContent: values.utmContent || "",
      languagePreference: values.languagePreference || "",
      notes: values.notes || "",
    };

    createLead(payload, {
      onSuccess: () => {
        form.reset();
        navigate({ to: "/leads" });
      },
    });
  }

  return (
    <AppShell>
      <PageHeader title="Create New Lead" breadcrumb="Leads · New" />

      <div className="max-w-5xl  pb-20">
        <Card className="">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b p-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-3">
                  <InputField control={form.control} name="name" label="Full Name" placeholder="e.g. John Doe" />
                  <PhoneField control={form.control} name="mobile" label="Mobile" placeholder="e.g. 9876543210" />
                  <InputField
                    control={form.control}
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="e.g. john@example.com"
                  />
                  <DatePickerWithYearField
                    control={form.control}
                    name="dob"
                    label="Date of Birth"
                    placeholder="Select DOB"
                  />
                  <SelectField
                    control={form.control}
                    name="gender"
                    label="Gender"
                    options={GENDERS}
                    placeholder="Select gender"
                  />
                  <SelectField
                    control={form.control}
                    name="languagePreference"
                    label="Language Preference"
                    options={LANGUAGE_OPTIONS}
                    placeholder="Select language"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b p-3">Academic Interest</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-3">
                  <InputField
                    control={form.control}
                    name="courseInterest"
                    label="Course Interest"
                    placeholder="e.g. B.Tech Computer Science, MBA"
                  />
                  <InputField
                    control={form.control}
                    name="campusInterest"
                    label="Campus Interest"
                    placeholder="e.g. Bangalore Main Campus"
                  />
                  <AutocompleteField
                    control={form.control}
                    name="campusId"
                    label="Campus"
                    options={campusOptions}
                    placeholder="Select campus"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b p-3">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-3">
                  <InputField
                    control={form.control}
                    name="country"
                    label="Country"
                    placeholder="e.g. India"
                  />
                  <InputField control={form.control} name="state" label="State" placeholder="e.g. Karnataka" />
                  <InputField control={form.control} name="city" label="City" placeholder="e.g. Bangalore" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b p-3">Source & Campaign Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-3">
                  <AutocompleteField
                    control={form.control}
                    name="sourceChannel"
                    label="Source Channel"
                    options={LEAD_SOURCES}
                    placeholder="Select source channel"
                    required
                  />
                  <InputField
                    control={form.control}
                    name="utmSource"
                    label="UTM Source"
                    placeholder="e.g. google"
                  />
                  <InputField
                    control={form.control}
                    name="utmMedium"
                    label="UTM Medium"
                    placeholder="e.g. cpc"
                  />
                  <InputField
                    control={form.control}
                    name="utmCampaign"
                    label="UTM Campaign"
                    placeholder="e.g. summer_admission_2026"
                  />
                  <InputField control={form.control} name="utmContent" label="UTM Content" placeholder="e.g. sidebar_banner" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b p-3">Additional Notes</h3>
                <div className="p-3">
                  <TextareaField control={form.control} name="notes" label="Notes" placeholder="Let us know your goals, academic backgrounds, or any specific query you have..." />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-3 border-t border-border">
                <Button variant="outline" type="button" onClick={() => navigate({ to: "/leads" })}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Lead"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </AppShell>
  );
}
