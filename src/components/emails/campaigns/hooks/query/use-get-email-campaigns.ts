import { useQuery } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { CampaignListResponse, GetCampaignsParams } from "../../types";

export const useGetEmailCampaigns = (params?: GetCampaignsParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_EMAIL_CAMPAIGNS, params],
    queryFn: async () => {
      const { data } = await Axios.get<CampaignListResponse>("/api/v1/email-campaigns", { params });
      return data;
    },
  });
};
