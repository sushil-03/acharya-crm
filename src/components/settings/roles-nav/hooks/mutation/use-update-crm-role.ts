import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { CrmRole } from "@/types/nav";

export interface UpdateCrmRolePayload {
  description?: string;
  isActive?: boolean;
}

export const useUpdateCrmRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, payload }: { roleId: number; payload: UpdateCrmRolePayload }) => {
      const { data } = await Axios.patch<CrmRole>(`/api/v1/roles/${roleId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CRM_ROLES] });
    },
  });
};
