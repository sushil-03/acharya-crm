import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface SourceAttribution {
  source: string;
  spend: number;
  leads: number;
  cpl: number;
  apps: number;
  enrolled: number;
  revenue: number;
  revenueFormatted: string;
  roi: number | null;
}

export interface SourceAttributionResponse {
  sources: SourceAttribution[];
}

export const useGetSourceAttribution = (campusId?: string | number) => {
  return useQuery<SourceAttributionResponse>({
    queryKey: ["source-attribution", campusId],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/analytics/source-attribution", {
        params: { ...(campusId && { campusId }) },
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};
