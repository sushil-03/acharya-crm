import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface LeadList {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  position: number;
  isSystem: boolean;
  createdBy: string;
  campusId: string | null;
  createdAt: string;
  updatedAt: string;
  leadCount: number;
}

export const useGetLists = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_LISTS],
    queryFn: async () => {
      const { data } = await Axios.get<LeadList[]>("/api/v1/lists");
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
};
