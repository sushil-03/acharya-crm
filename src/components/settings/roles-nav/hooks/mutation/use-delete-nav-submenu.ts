import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";

export const useDeleteNavSubmenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await Axios.delete(`/api/v1/nav/submenus/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_NAV_MODULES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_MY_SUBMENUS] });
    },
  });
};
