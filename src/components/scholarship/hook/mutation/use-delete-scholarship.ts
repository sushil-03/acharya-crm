import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteScholarship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await Axios.delete(`/api/v1/scholarships/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Scholarship deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_SCHOLARSHIP] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to delete scholarship";
      toast.error(errorMessage);
    },
  });
};
