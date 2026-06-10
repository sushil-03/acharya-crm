import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface LeadListMembership {
  id: string;
  listId: string;
  leadId: string;
  addedBy: string;
  note: string | null;
  addedAt: string;
  list: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    isSystem: boolean;
  };
}

export const useGetLeadLists = (leadId: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_LEAD_LISTS, leadId],
    queryFn: async () => {
      const { data } = await Axios.get<LeadListMembership[]>(`/api/v1/leads/${leadId}/lists`);
      return data;
    },
    enabled: !!leadId,
    staleTime: 1000 * 60 * 2,
  });
};
