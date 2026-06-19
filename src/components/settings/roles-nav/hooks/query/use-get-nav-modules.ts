import { useQuery } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { NavModuleFull } from "@/types/nav";

export const useGetNavModules = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_NAV_MODULES],
    queryFn: async () => {
      const { data } = await Axios.get<NavModuleFull[]>("/api/v1/nav/modules");
      return data;
    },
  });
};
