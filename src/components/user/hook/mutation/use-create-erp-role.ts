import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface CreateErpRolePayload {
  crmStatus: string;
  crmRole: string;
  label: string;
}

export const useCreateErpRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateErpRolePayload) => {
      const response = await Axios.post("/api/v1/auth/erp-roles", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("ERP role created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ERP_ROLES] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create ERP role");
    },
  });
};
