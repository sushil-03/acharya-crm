import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface NavMenuPayload {
  name: string;
  icon: string;
  position: number;
}

export const useCreateNavMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ moduleId, payload }: { moduleId: number; payload: NavMenuPayload }) => {
      const { data } = await Axios.post(`/api/v1/nav/modules/${moduleId}/menus`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_NAV_MODULES] });
    },
  });
};
