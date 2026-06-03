import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface SendCommunicationPayload {
  channel: "whatsapp" | "email" | "sms" | "push" | string;
  templateKey: string;
  to: string;
  leadId: string;
  studentId?: string | null;
  params?: Record<string, any>;
}

export const useSendCommunication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendCommunicationPayload) => {
      const { data } = await Axios.post("/api/v1/communications/send", payload);
      return data;
    },
    onSuccess: (_, { leadId }) => {
      console.log("leadId", leadId);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COMMUNICATION] });
    },
  });
};
