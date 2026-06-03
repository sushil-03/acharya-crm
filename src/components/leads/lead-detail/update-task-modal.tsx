import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/form-fields/select-field";
import { TextareaField } from "@/components/ui/form-fields/textarea-field";
import { DatePickerWithYearField } from "@/components/ui/form-fields/date-picker-with-year-field";
import { useUpdateTask } from "../hook/mutation/use-update-task";
import { Task } from "../hook/query/use-get-task";
import { useEffect } from "react";

const updateTaskSchema = z.object({
  action: z.enum(["completed", "reschedule"]),
  dueDate: z.date().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof updateTaskSchema>;

interface UpdateTaskModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateTaskModal({ task, open, onOpenChange }: UpdateTaskModalProps) {
  const { mutate, isPending } = useUpdateTask();

  const form = useForm<FormValues>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      action: "completed",
      dueDate: undefined,
      notes: "",
    },
  });

  const selectedAction = form.watch("action");

  useEffect(() => {
    if (task && open) {
      form.reset({
        action: task.taskStatus === "completed" ? "completed" : "reschedule",
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        notes: task.notes || "",
      });
    }
  }, [task, open, form]);

  const onSubmit = (data: FormValues) => {
    if (!task) return;

    mutate(
      {
        id: task.id,
        payload: {
          action: data.action,
          ...(data.action === "reschedule" && data.dueDate
            ? { dueDate: data.dueDate.toISOString() }
            : {}),
          notes: data.notes || undefined,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <SelectField
              control={form.control}
              name="action"
              label="Action"
              options={[
                { label: "Mark Completed", value: "completed" },
                { label: "Reschedule", value: "reschedule" },
              ]}
            />

            {selectedAction === "reschedule" && (
              <DatePickerWithYearField
                control={form.control}
                name="dueDate"
                label="New Due Date"
                includeTime
              />
            )}

            <TextareaField control={form.control} name="notes" label="Additional Notes" />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
