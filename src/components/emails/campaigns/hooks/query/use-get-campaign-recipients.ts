import { useQuery } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { CampaignRecipientsResponse, CampaignRecipientStatus } from "../../types";

interface Params {
  page?: number;
  pageSize?: number;
  status?: CampaignRecipientStatus;
  search?: string;
}

export const useGetCampaignRecipients = (id: string | undefined, params?: Params) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CAMPAIGN_RECIPIENTS, id, params],
    queryFn: async () => {
      const { data } = await Axios.get<CampaignRecipientsResponse>(
        `/api/v1/email-campaigns/${id}/recipients`,
        { params },
      );
      return data;
    },
    enabled: !!id,
  });
};
