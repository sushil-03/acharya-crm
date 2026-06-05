import { useQuery } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { EmailTemplateBackend } from "../../types";

export const useGetEmailTemplateDetails = (id?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_EMAIL_TEMPLATE_DETAILS, id],
    queryFn: async () => {
      const { data } = await Axios.get<EmailTemplateBackend>(`/api/v1/email-templates/${id}`);
      return data;
    },
    enabled: !!id,
  });
};
