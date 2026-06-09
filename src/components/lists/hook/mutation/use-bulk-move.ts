import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBulkMoveLeads = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fromListId,
      toListId,
      leadIds,
    }: {
      fromListId: string;
      toListId: string;
      leadIds: string[];
    }) => {
      const { data } = await Axios.post("/api/v1/lists/bulk/move", { fromListId, toListId, leadIds });
      return data;
    },
    onSuccess: (data) => {
      toast.success(`${data.moved} lead(s) moved`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LIST_BY_ID, data.fromListId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LIST_BY_ID, data.toListId] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to move leads");
    },
  });
};
