import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface CounsellorKpi {
  counsellorId: string;
  name: string;
  assigned: number;
  callsToday: number;
  connectPct: number;
  followUpPct: number;
  conversions: number;
  enrolledValueLakhs: number;
  slaBreached: boolean;
}

export interface CounsellorKpisResponse {
  counsellors: CounsellorKpi[];
  date: string;
}

export const useGetCounsellorKpis = (campusId?: string | number) => {
  return useQuery<CounsellorKpisResponse>({
    queryKey: ["counsellor-kpis", campusId],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/analytics/counsellor-kpis", {
        params: { ...(campusId && { campusId }) },
      });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
