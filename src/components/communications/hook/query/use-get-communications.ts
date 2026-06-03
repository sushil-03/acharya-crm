import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface GetCommunicationsParams {
  leadId?: string;
  studentId?: string;
  channel?: "whatsapp" | "email" | "sms" | "push" | string;
  status?: string;
}

export interface CommunicationLog {
  id: string;
  leadId: string;
  studentId: string | null;
  channel: string;
  templateKey: string;
  renderedMessage: string;
  status: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  gatewayMessageId: string | null;
  errorMessage: string | null;
  triggeredBy: string | null;
  createdAt: string;
}

export const useGetCommunications = (params: GetCommunicationsParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_COMMUNICATION, params],
    queryFn: async () => {
      const { data } = await Axios.get<CommunicationLog[]>("/api/v1/communications", {
        params,
      });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: !!params.leadId || !!params.studentId, // Ensure it only runs if there's an ID to fetch for
  });
};
