import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Axios.delete(`/api/v1/lists/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("List deleted");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LISTS] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete list");
    },
  });
};
