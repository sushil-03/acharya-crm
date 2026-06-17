import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface RoleSummary {
  role: string;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export const useGetRolesSummary = () => {
  return useQuery<RoleSummary[]>({
    queryKey: [QUERY_KEYS.GET_ROLES_SUMMARY],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/auth/roles/summary");
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};
