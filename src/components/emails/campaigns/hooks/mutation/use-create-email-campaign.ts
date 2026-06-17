import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { Campaign, CreateCampaignPayload } from "../../types";

export const useCreateEmailCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCampaignPayload) => {
      const { data } = await Axios.post<Campaign>("/api/v1/email-campaigns", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_CAMPAIGNS] });
    },
  });
};
