import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface UpdateListPayload {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  position?: number;
}

export const useUpdateList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateListPayload }) => {
      const { data } = await Axios.patch(`/api/v1/lists/${id}`, payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success("List updated");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LISTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LIST_BY_ID, data.id] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update list");
    },
  });
};
