import { useQuery } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";

export const useGetEmailTemplateCategories = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_EMAIL_TEMPLATE_CATEGORIES],
    queryFn: async () => {
      const { data } = await Axios.get<string[]>("/api/v1/email-templates/categories");
      return data;
    },
  });
};
