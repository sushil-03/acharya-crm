import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useStarLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data } = await Axios.post(`/api/v1/leads/${leadId}/star`);
      return { ...data, leadId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEAD_LISTS, data.leadId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LISTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS_BY_ID, data.leadId] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to star lead");
    },
  });
};

export const useUnstarLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data } = await Axios.delete(`/api/v1/leads/${leadId}/star`);
      return { ...data, leadId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEAD_LISTS, data.leadId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LISTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS_BY_ID, data.leadId] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to unstar lead");
    },
  });
};
