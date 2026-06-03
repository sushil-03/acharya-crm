import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { LeadDetail } from "@/types/lead";
import { useQuery } from "@tanstack/react-query";

export interface GetLeadsParams {
  status?: string;
  sourceChannel?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// export interface LeadItem {
//   id: string;
//   name: string;
//   mobile: string;
//   email: string;
//   status: string;
//   sourceChannel: string;
//   campusId: string;
//   leadScore: number;
//   courseInterest: string;
//   city: string;
//   createdAt: string;
//   lastContactedAt: string | null;
//   assignments: any[];
// }

export interface GetLeadsResponse {
  data: LeadDetail[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export const useGetLeads = (params: GetLeadsParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_LEADS, params],
    queryFn: async () => {
      const { data } = await Axios.get<GetLeadsResponse>("/api/v1/leads", {
        params,
      });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
