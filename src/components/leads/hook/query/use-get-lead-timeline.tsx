import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { LeadTimelineResponse } from "@/types/lead";
import { useQuery } from "@tanstack/react-query";

export const useGetLeadTimeline = (leadId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_LEAD_TIMELINE, leadId],
    queryFn: async () => {
      const { data } = await Axios.get<LeadTimelineResponse>(
        `/api/v1/analytics/lead-timeline/${leadId}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: !!leadId,
  });
};
