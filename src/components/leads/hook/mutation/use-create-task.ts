import Axios from "@/lib/axios-config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateTaskPayload {
  taskType:
    | "follow_up"
    | "call_back"
    | "send_documents"
    | "application_reminder"
    | "payment_reminder"
    | "others";
  dueDate: string;
  notes: string;
  leadId: string;
}

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const { data } = await Axios.post("/api/v1/tasks", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
    },
    onError: (error: any) => {
      console.log("error", error);
      toast.error(error?.message || "Failed to create task");
    },
  });
};
