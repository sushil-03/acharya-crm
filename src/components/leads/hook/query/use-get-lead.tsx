import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { LeadAssignmentData, LeadDetail } from "@/types/lead";
import { useQuery } from "@tanstack/react-query";

export const useGetLeadAssignment = (leadId: string) => {
  return useQuery({
    queryKey: ["lead-assignments", leadId],
    queryFn: async () => {
      const { data } = await Axios.get<LeadAssignmentData>(`/api/v1/lead-assignments/${leadId}`);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: !!leadId,
  });
};

export const useGetLead = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_LEADS_BY_ID, id],
    queryFn: async () => {
      const { data } = await Axios.get<LeadDetail>(`/api/v1/leads/${id}`);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: !!id,
  });
};
