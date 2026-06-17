import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";

export const useCancelEmailCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Axios.post<{ cancelled: boolean }>(
        `/api/v1/email-campaigns/${id}/cancel`,
      );
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_CAMPAIGNS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_CAMPAIGN, id] });
    },
  });
};
