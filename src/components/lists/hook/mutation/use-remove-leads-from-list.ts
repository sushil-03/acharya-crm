import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useRemoveLeadsFromList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, leadIds }: { listId: string; leadIds: string[] }) => {
      const { data } = await Axios.delete(`/api/v1/lists/${listId}/leads`, { data: { leadIds } });
      return { ...data, listId };
    },
    onSuccess: (data) => {
      toast.success(`${data.removed} lead(s) removed from list`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LIST_BY_ID, data.listId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEAD_LISTS] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to remove leads");
    },
  });
};
