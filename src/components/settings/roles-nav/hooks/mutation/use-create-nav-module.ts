import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface NavModulePayload {
  name: string;
  shortName: string;
  icon: string;
  position: number;
}

export const useCreateNavModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NavModulePayload) => {
      const { data } = await Axios.post("/api/v1/nav/modules", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_NAV_MODULES] });
    },
  });
};
