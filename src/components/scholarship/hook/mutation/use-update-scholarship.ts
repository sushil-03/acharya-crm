import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useApproveScholarship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await Axios.post(`/api/v1/scholarships/${id}/approve`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Scholarship approved successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_SCHOLARSHIP] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_OFFER] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to approve scholarship";
      toast.error(errorMessage);
    },
  });
};

export interface RejectScholarshipPayload {
  reason: string;
}

export const useRejectScholarship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RejectScholarshipPayload }) => {
      const response = await Axios.post(`/api/v1/scholarships/${id}/reject`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Scholarship rejected successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_SCHOLARSHIP] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_OFFER] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to reject scholarship";
      toast.error(errorMessage);
    },
  });
};
