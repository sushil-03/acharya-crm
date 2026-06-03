import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface StartApplicationPayload {
  studentId: string;
  programId: string;
  formData: Record<string, any>;
}

export const useStartApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StartApplicationPayload) => {
      const { data: res } = await Axios.post<any>(`/api/v1/applications`, data);
      return res;
    },
    onSuccess: (res) => {
      console.log(res);
      toast.success(res?.message || "Application started successfully");
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_LEADS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_APPLICATIONS],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS_BY_ID, res.leadId] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to start application";
      toast.error(errorMessage);
    },
  });
};
