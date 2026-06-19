import { useQuery } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { CrmRole } from "@/types/nav";

export const useGetCrmRoles = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CRM_ROLES],
    queryFn: async () => {
      const { data } = await Axios.get<CrmRole[]>("/api/v1/roles");
      return data;
    },
  });
};
