import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useConvertLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await Axios.post(`/api/v1/leads/${id}/convert`);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("data", data);
      toast.success(data?.message || "Lead converted to student successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS_BY_ID, data.leadId] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_APPLICATION_BY_ID, data.applicationId],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to convert lead";
      toast.error(errorMessage);
    },
  });
};
export interface UpdateLeadPayload {
  status?: string;
  lostReason?: string;
  notes?: string;
  courseInterest?: string;
  campusInterest?: string;
  languagePreference?: string;
  lastContactedAt?: string;
}

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateLeadPayload }) => {
      const response = await Axios.patch(`/api/v1/leads/${id}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Lead updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS_BY_ID, data.id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to update lead";
      toast.error(errorMessage);
    },
  });
};
