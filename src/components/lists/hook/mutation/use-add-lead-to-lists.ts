import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAddLeadToLists = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId, listIds }: { leadId: string; listIds: string[] }) => {
      const { data } = await Axios.post(`/api/v1/leads/${leadId}/lists`, { listIds });
      return { ...data, leadId };
    },
    onSuccess: (data) => {
      toast.success("Lead added to lists");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEAD_LISTS, data.leadId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LISTS] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add lead to lists");
    },
  });
};
