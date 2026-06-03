import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface AttachScholarshipPayload {
  scholarshipType: string;
  amountType: string;
  amountValue: number;
  reason?: string;
  criteriaMet?: Record<string, any>;
}

export const useAttachScholarship = (offerId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AttachScholarshipPayload) => {
      const response = await Axios.post(`/api/v1/offers/${offerId}/scholarships`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Scholarship attached successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_OFFER] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_SCHOLARSHIP] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to attach scholarship";
      toast.error(errorMessage);
    },
  });
};
