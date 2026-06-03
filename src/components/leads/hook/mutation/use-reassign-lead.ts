import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useReassignLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await Axios.post(`/api/v1/leads/${id}/reassign`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Lead reassigned");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to reassign lead";
      toast.error(errorMessage);
    },
  });
};

export const useRetryAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await Axios.post(`/api/v1/lead-assignments/retry/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Lead reassigned");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to reassign lead";
      toast.error(errorMessage);
    },
  });
};
