import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface CreateInteractionPayload {
  interactionType: string;
  outcome?: string;
  durationSeconds?: number;
  notes?: string;
  followUpDate?: string;
}

export const useCreateInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CreateInteractionPayload }) => {
      const response = await Axios.post(`/api/v1/leads/${id}/interactions`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Interaction created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS_BY_ID, data?.leadId] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to create interaction";
      toast.error(errorMessage);
    },
  });
};
