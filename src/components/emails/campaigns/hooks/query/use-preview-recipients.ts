import { useQuery } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { PreviewRecipientsResponse } from "../../types";

export const usePreviewRecipients = (id: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_PREVIEW_RECIPIENTS, id],
    queryFn: async () => {
      const { data } = await Axios.get<PreviewRecipientsResponse>(
        `/api/v1/email-campaigns/${id}/preview-recipients`,
      );
      return data;
    },
    enabled: !!id,
    staleTime: 0,
  });
};
