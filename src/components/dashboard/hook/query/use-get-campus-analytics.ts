import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface CampusAnalytics {
  campusId: string;
  campusName: string;
  totalLeads: number;
  enrolled: number;
  occupancyPct: number;
  revenueCollected: number;
}

export const useGetCampusAnalytics = (campusId?: string | number) => {
  return useQuery<CampusAnalytics>({
    queryKey: ["campus-analytics", campusId],
    queryFn: async () => {
      const { data } = await Axios.get(`/api/v1/analytics/campus/${campusId}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!campusId,
  });
};
