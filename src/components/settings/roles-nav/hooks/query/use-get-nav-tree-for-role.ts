import { useQuery } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { NavModule } from "@/types/nav";

export const useGetNavTreeForRole = (roleId: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_NAV_TREE_FOR_ROLE, roleId],
    queryFn: async () => {
      const { data } = await Axios.get<NavModule[]>(`/api/v1/nav/tree/${roleId}`);
      return data;
    },
    enabled: roleId !== null,
  });
};
