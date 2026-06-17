import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { Campaign, UpdateCampaignPayload } from "../../types";

export const useUpdateEmailCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateCampaignPayload }) => {
      const { data } = await Axios.patch<Campaign>(`/api/v1/email-campaigns/${id}`, payload);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_CAMPAIGNS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_CAMPAIGN, id] });
    },
  });
};
