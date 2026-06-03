import Axios from "@/lib/axios-config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateTaskPayload {
  action: "completed" | "reschedule";
  dueDate?: string;
  notes?: string;
}

interface UpdateTaskVariables {
  id: string;
  payload: UpdateTaskPayload;
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateTaskVariables) => {
      const { data } = await Axios.patch(`/api/v1/tasks/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update task");
    },
  });
};
