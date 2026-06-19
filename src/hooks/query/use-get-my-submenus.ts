import { useQuery } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { NavModule } from "@/types/nav";

export const useGetMySubmenus = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_MY_SUBMENUS],
    queryFn: async () => {
      const { data } = await Axios.get<NavModule[]>("/api/v1/auth/me/submenus");
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};
