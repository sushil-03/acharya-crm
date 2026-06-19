import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";

export const useDeleteCrmRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roleId: number) => {
      await Axios.delete(`/api/v1/roles/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CRM_ROLES] });
    },
  });
};
