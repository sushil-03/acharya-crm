import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { CrmRole } from "@/types/nav";

export interface CreateCrmRolePayload {
  roleName: string;
  description?: string;
}

export const useCreateCrmRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCrmRolePayload) => {
      const { data } = await Axios.post<CrmRole>("/api/v1/roles", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CRM_ROLES] });
    },
  });
};
