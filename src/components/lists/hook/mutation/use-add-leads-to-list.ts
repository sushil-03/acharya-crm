import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAddLeadsToList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, leadIds, note }: { listId: string; leadIds: string[]; note?: string }) => {
      const { data } = await Axios.post(`/api/v1/lists/${listId}/leads`, { leadIds, note });
      return data;
    },
    onSuccess: (data) => {
      toast.success(`${data.added} lead(s) added to list`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LIST_BY_ID, data.listId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEAD_LISTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS_BY_ID] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add leads");
    },
  });
};
