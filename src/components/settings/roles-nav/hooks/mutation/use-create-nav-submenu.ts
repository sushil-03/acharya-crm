import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface NavSubmenuPayload {
  name: string;
  path: string;
  icon: string;
  position: number;
}

export const useCreateNavSubmenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ menuId, payload }: { menuId: number; payload: NavSubmenuPayload }) => {
      const { data } = await Axios.post(`/api/v1/nav/menus/${menuId}/submenus`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_NAV_MODULES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_MY_SUBMENUS] });
    },
  });
};
