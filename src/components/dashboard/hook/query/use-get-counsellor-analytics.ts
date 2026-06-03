import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface CounsellorAnalytics {
  counsellorId: string;
  openLeads: number;
  callsToday: number;
  overdueTasks: number;
  conversionRate: number;
}

export const useGetCounsellorAnalytics = (id?: string) => {
  return useQuery<CounsellorAnalytics>({
    queryKey: ["counsellor-analytics", id],
    queryFn: async () => {
      const { data } = await Axios.get(`/api/v1/analytics/counsellor/${id}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!id,
  });
};
