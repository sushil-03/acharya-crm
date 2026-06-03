import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card } from "@/components/ui-kit";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/form-fields/input-field";
import { SelectField } from "@/components/ui/form-fields/select-field";
import { Button } from "@/components/ui/button";
import { useCreateProgram } from "@/components/program/hook/mutation/use-create-program";
import { useGetCampuses } from "@/components/global/hooks/use-get-campuses";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/programs/new")({
  component: CreateProgramPage,
});

const programSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  type: z.string().min(1, "Type is required"),
  campusId: z.string().min(1, "Campus ID is required"),
  discipline: z.string().min(1, "Discipline is required"),
  specialization: z.string().optional().nullable(),
  intakeCapacity: z.coerce.number().min(1, "Intake capacity must be at least 1"),
  durationYears: z.coerce.number().min(1, "Duration must be at least 1"),
  totalFee: z.coerce.number().min(0, "Total fee is required"),
  applicationFee: z.coerce.number().min(0, "Application fee is required"),
});

type ProgramFormValues = z.infer<typeof programSchema>;

function CreateProgramPage() {
  const navigate = useNavigate();
  const { mutate: createProgram, isPending } = useCreateProgram();
  const { data: campuses, isLoading: isCampusesLoading } = useGetCampuses();

  const campusOptions = campuses?.map(c => ({
    label: c.name,
    value: c.id
  })) || [];

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "",
      campusId: "", // Default empty
      discipline: "",
      specialization: "",
      intakeCapacity: "" as any,
      durationYears: "" as any,
      totalFee: "" as any,
      applicationFee: "" as any,
    },
  });

  const onSubmit = (data: ProgramFormValues) => {
    createProgram(data, {
      onSuccess: () => {
        toast.success("Program created successfully");
        navigate({ to: "/programs" });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create program");
      },
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Create Program"
        subtitle="Add a new academic program to the system."
        breadcrumb="Programs · New"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/programs" })}>
            <ArrowLeft className="size-4 mr-1.5" /> Back
          </Button>
        }
      />
      <div className="max-w-3xl mt-6 pb-20">
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  control={form.control}
                  name="name"
                  label="Program Name"
                  placeholder="e.g. Bachelor of Technology"
                />
                <InputField
                  control={form.control}
                  name="code"
                  label="Program Code"
                  placeholder="e.g. BTECH"
                />
                <SelectField
                  control={form.control}
                  name="type"
                  label="Program Type"
                  options={[
                    { label: "Undergraduate", value: "undergraduate" },
                    { label: "Postgraduate", value: "postgraduate" },
                    { label: "Diploma", value: "diploma" },
                    { label: "Certificate", value: "certificate" },
                    { label: "Doctoral", value: "doctoral" },
                  ]}
                />
                <InputField
                  control={form.control}
                  name="discipline"
                  label="Discipline"
                  placeholder="e.g. Engineering"
                />
                <InputField
                  control={form.control}
                  name="specialization"
                  label="Specialization (Optional)"
                  placeholder="e.g. Computer Science"
                />
                <SelectField
                  control={form.control}
                  name="campusId"
                  label="Campus"
                  options={campusOptions}
                  isLoading={isCampusesLoading}
                  placeholder="Select a campus"
                />
                <InputField
                  control={form.control}
                  name="intakeCapacity"
                  label="Intake Capacity"
                  type="number"
                />
                <InputField
                  control={form.control}
                  name="durationYears"
                  label="Duration (Years)"
                  type="number"
                />
                <InputField
                  control={form.control}
                  name="totalFee"
                  label="Total Fee"
                  type="number"
                />
                <InputField
                  control={form.control}
                  name="applicationFee"
                  label="Application Fee"
                  type="number"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => navigate({ to: "/programs" })}>
                  Cancel
                </Button>
                <Button type="submit" loading={isPending}>
                  Create Program
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </AppShell>
  );
}
