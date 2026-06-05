import { useQuery } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { EmailTemplatesListResponse, GetEmailTemplatesParams } from "../../types";

export const useGetEmailTemplates = (params?: GetEmailTemplatesParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_EMAIL_TEMPLATES, params],
    queryFn: async () => {
      const { data } = await Axios.get<EmailTemplatesListResponse>("/api/v1/email-templates", {
        params,
      });
      return data;
    },
  });
};
