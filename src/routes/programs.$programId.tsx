import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card } from "@/components/ui-kit";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/form-fields/input-field";
import { SelectField } from "@/components/ui/form-fields/select-field";
import { Button } from "@/components/ui/button";
import { useUpdateProgram } from "@/components/program/hook/mutation/use-update-program";
import { useGetProgramById } from "@/components/program/hook/query/use-get-program-by-id";
import { useGetCampuses } from "@/components/global/hooks/use-get-campuses";
import { toast } from "sonner";
import React, { useEffect } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import AutocompleteField from "@/components/ui/form-fields/autocomplete-field";

export const Route = createFileRoute("/programs/$programId")({
  component: EditProgramPage,
});

const updateProgramSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  campusId: z.string().optional(),
  discipline: z.string().min(1, "Discipline is required"),
  specialization: z.string().optional().nullable(),
  intakeCapacity: z.coerce.number().min(1, "Intake capacity must be at least 1"),
  durationYears: z.coerce.number().min(1, "Duration must be at least 1"),
  totalFee: z.coerce.number().min(0, "Total fee is required"),
  applicationFee: z.coerce.number().min(0, "Application fee is required"),
  isActiveStatus: z.string(), // We use string for SelectField
});

type UpdateProgramFormValues = z.infer<typeof updateProgramSchema>;

function EditProgramPage() {
  const navigate = useNavigate();
  const { programId } = useParams({ from: "/programs/$programId" });

  const { data: program, isLoading: isLoadingProgram } = useGetProgramById(programId);
  const { data: campuses, isLoading: isLoadingCampuses } = useGetCampuses();
  const { mutate: updateProgram, isPending } = useUpdateProgram(programId);

  const form = useForm<UpdateProgramFormValues>({
    resolver: zodResolver(updateProgramSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "undergraduate",
      campusId: "",
      discipline: "",
      specialization: "",
      intakeCapacity: 60,
      durationYears: 3,
      totalFee: 0,
      applicationFee: 1000,
      isActiveStatus: "true",
    },
  });

  useEffect(() => {
    if (program) {
      form.reset({
        name: program.name,
        code: program.code,
        type: program.type,
        campusId: program.campusId || program.campus?.id || "",
        discipline: program.discipline,
        specialization: program.specialization || "",
        intakeCapacity: program.intakeCapacity,
        durationYears: program.durationYears,
        totalFee: Number(program.totalFee) || 0,
        applicationFee: 1000, // This is not in the GET schema mock but might be in real one, default to 1000
        isActiveStatus: program.isActive ? "true" : "false",
      });
    }
  }, [program, form]);

  const onSubmit = (data: UpdateProgramFormValues) => {
    // Exclude code and campusId from payload
    const payload = {
      name: data.name,
      type: data.type,
      discipline: data.discipline,
      specialization: data.specialization || null,
      intakeCapacity: data.intakeCapacity,
      durationYears: data.durationYears,
      totalFee: data.totalFee,
      applicationFee: data.applicationFee,
      isActive: data.isActiveStatus === "true",
    };

    updateProgram(payload, {
      onSuccess: () => {
        toast.success("Program updated successfully");
        navigate({ to: "/programs" });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update program");
      },
    });
  };

  const campusOptions = campuses?.map((c) => ({ label: c.name, value: c.id })) || [];

  return (
    <AppShell>
      <PageHeader
        title="Edit Program"
        subtitle="Update academic program details."
        breadcrumb="Programs · Edit"
        // actions={
        //   <Button variant="outline" size="sm" onClick={() => navigate({ to: "/programs" })}>
        //     <ArrowLeft className="size-4 mr-1.5" /> Back
        //   </Button>
        // }
      />
      <div className="max-w-3xl ">
        <Card className="p-6">
          {isLoadingProgram || isLoadingCampuses ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-muted-foreground size-8" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    control={form.control}
                    name="name"
                    label="Program Name"
                    placeholder="e.g. Bachelor of Technology"
                  />
                  <InputField control={form.control} name="code" label="Program Code" disabled />
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
                  <AutocompleteField
                    control={form.control}
                    name="campusId"
                    label="Campus"
                    placeholder=""
                    options={campusOptions}
                    disabled
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
                  <SelectField
                    control={form.control}
                    name="isActiveStatus"
                    label="Status"
                    options={[
                      { label: "Active", value: "true" },
                      { label: "Inactive", value: "false" },
                    ]}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: "/programs" })}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={isPending}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
