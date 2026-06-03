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
import { TextareaField } from "@/components/ui/form-fields/textarea-field";
import { DatePickerWithYearField } from "@/components/ui/form-fields/date-picker-with-year-field";
import { useCreateTask } from "../hook/mutation/use-create-task";
import { useState } from "react";
import { Plus } from "lucide-react";
import { LeadDetail } from "@/types/lead";
import { TASK_TYPES } from "@/lib/constant";

const taskSchema = z.object({
  taskType: z.enum([
    "follow_up",
    "call_back",
    "send_documents",
    "application_reminder",
    "payment_reminder",
    "others",
  ]),
  dueDate: z.date({ required_error: "Due date is required" }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof taskSchema>;

export function CreateTaskModal({ lead }: { lead: LeadDetail }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateTask();

  const form = useForm<FormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      taskType: "follow_up",
      dueDate: new Date(),
      notes: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    mutate(
      {
        leadId: lead.id,
        taskType: data.taskType,
        dueDate: data.dueDate.toISOString(),
        notes: data.notes || "",
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-sm">
          <Plus className="size-3.5 mr-1" /> Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <SelectField
              control={form.control}
              name="taskType"
              label="Task Type"
              options={TASK_TYPES}
            />

            <DatePickerWithYearField
              control={form.control}
              name="dueDate"
              label="Due Date"
              includeTime
            />

            <TextareaField control={form.control} name="notes" label="Notes" />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
