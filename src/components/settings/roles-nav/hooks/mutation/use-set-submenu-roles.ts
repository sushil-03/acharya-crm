import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";

export const useSetSubmenuRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ submenuId, roleIds }: { submenuId: number; roleIds: number[] }) => {
      const { data } = await Axios.put(`/api/v1/nav/submenus/${submenuId}/roles`, { roleIds });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_NAV_MODULES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_MY_SUBMENUS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_NAV_TREE_FOR_ROLE] });
    },
  });
};
