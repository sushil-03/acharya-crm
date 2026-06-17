import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { ScheduleCampaignPayload } from "../../types";

interface ScheduleResponse {
  scheduled: boolean;
  scheduledAt: string | null;
  willSendIn: string | null;
}

export const useScheduleEmailCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ScheduleCampaignPayload }) => {
      const { data } = await Axios.post<ScheduleResponse>(
        `/api/v1/email-campaigns/${id}/schedule`,
        payload,
      );
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_CAMPAIGNS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_CAMPAIGN, id] });
    },
  });
};
