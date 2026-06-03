import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { data: res } = await Axios.delete<any>(`/api/v1/documents/${documentId}`);
      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Document deleted successfully");
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_APPLICATION_BY_ID],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_LEADS],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to delete document";
      toast.error(errorMessage);
    },
  });
};
