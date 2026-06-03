import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface FunnelSummary {
  totalLeads: number;
  inquiryToApplication: number;
  offerAcceptanceRate: number;
  enrollmentYield: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversion: number | null;
}

export interface FunnelResponse {
  summary: FunnelSummary;
  stages: FunnelStage[];
  biggestLeak: string;
}

export const useGetFunnel = (campusId?: string | number) => {
  return useQuery<FunnelResponse>({
    queryKey: ["funnel", campusId],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/analytics/funnel", {
        params: { ...(campusId && { campusId }) },
      });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
