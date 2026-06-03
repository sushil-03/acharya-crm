import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface VerifyDocumentPayload {
  documentId: string;
  status: "verified" | "rejected" | "re_upload_requested";
  rejectionReason?: string;
}

export const useVerifyDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ documentId, ...payload }: VerifyDocumentPayload) => {
      const { data: res } = await Axios.patch<any>(`/api/v1/documents/${documentId}`, payload);
      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Document status updated successfully");
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_APPLICATION_BY_ID],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_APPLICATIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_LEADS],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to update document status";
      toast.error(errorMessage);
    },
  });
};
