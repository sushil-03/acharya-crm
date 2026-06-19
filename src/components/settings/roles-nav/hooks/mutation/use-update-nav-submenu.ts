import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { NavSubmenuPayload } from "./use-create-nav-submenu";

export const useUpdateNavSubmenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<NavSubmenuPayload> }) => {
      const { data } = await Axios.patch(`/api/v1/nav/submenus/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_NAV_MODULES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_MY_SUBMENUS] });
    },
  });
};
