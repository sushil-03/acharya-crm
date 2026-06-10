import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface CreateListPayload {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  position?: number;
}

export const useCreateList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateListPayload) => {
      const { data } = await Axios.post("/api/v1/lists", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("List created");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LISTS] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create list");
    },
  });
};
