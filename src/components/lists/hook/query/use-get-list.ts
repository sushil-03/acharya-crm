import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface ListLead {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  status: string;
  sourceChannel: string;
  campusId: string | null;
  leadScore: number;
  courseInterest: string | null;
  city: string | null;
  createdAt: string;
  lastContactedAt: string | null;
  assignments: { counsellorId: string; assignedAt: string }[];
  addedAt: string;
  note: string | null;
}

export interface ListDetail {
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
  leads: ListLead[];
  meta: { total: number; page: number; pageSize: number };
}

export const useGetList = (listId: string | undefined, page = 1, pageSize = 50) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_LIST_BY_ID, listId, page, pageSize],
    queryFn: async () => {
      const { data } = await Axios.get<ListDetail>(`/api/v1/lists/${listId}`, {
        params: { page, pageSize },
      });
      return data;
    },
    enabled: !!listId,
    staleTime: 1000 * 60 * 2,
  });
};
