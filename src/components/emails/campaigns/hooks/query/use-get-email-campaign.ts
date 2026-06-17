import { useQuery } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { Campaign } from "../../types";

export const useGetEmailCampaign = (id: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_EMAIL_CAMPAIGN, id],
    queryFn: async () => {
      const { data } = await Axios.get<Campaign>(`/api/v1/email-campaigns/${id}`);
      return data;
    },
    enabled: !!id,
  });
};
