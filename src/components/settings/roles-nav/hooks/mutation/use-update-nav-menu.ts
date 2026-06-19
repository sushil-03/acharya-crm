import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { NavMenuPayload } from "./use-create-nav-menu";

export const useUpdateNavMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<NavMenuPayload> }) => {
      const { data } = await Axios.patch(`/api/v1/nav/menus/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_NAV_MODULES] });
    },
  });
};
