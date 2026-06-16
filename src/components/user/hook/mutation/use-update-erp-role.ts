import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface UpdateErpRolePayload {
  label?: string;
  crmRole?: string;
  isActive?: boolean;
}

export const useUpdateErpRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateErpRolePayload }) => {
      const response = await Axios.patch(`/api/v1/auth/erp-roles/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("ERP role updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ERP_ROLES] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update ERP role");
    },
  });
};
