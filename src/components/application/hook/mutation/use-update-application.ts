import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface UpdateApplicationParams {
  id: string;
  status: string;
}

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await Axios.post(`/api/v1/applications/${id}/submit`);
      return response.data;
    },
    onSuccess: (data, id) => {
      toast.success(data?.message || "Application submitted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS_BY_ID, data.leadId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_APPLICATIONS] });

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_APPLICATION_BY_ID, id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to submit application";
      toast.error(errorMessage);
    },
  });
};

export const useApproveApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await Axios.post(`/api/v1/applications/${id}/approve`);
      return response.data;
    },
    onSuccess: (data, id) => {
      toast.success(data?.message || "Application approved successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS_BY_ID, data.leadId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_APPLICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_APPLICATION_BY_ID, id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to approve application";
      toast.error(errorMessage);
    },
  });
};

export interface RejectApplicationPayload {
  reason?: string;
}

export const useRejectApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload?: RejectApplicationPayload }) => {
      const response = await Axios.post(`/api/v1/applications/${id}/reject`, payload);
      return response.data;
    },
    onSuccess: (data, { id }) => {
      toast.success(data?.message || "Application rejected successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS_BY_ID, data.leadId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_APPLICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_APPLICATION_BY_ID, id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to reject application";
      toast.error(errorMessage);
    },
  });
};
