import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { CreateEmailTemplatePayload, EmailTemplateBackend } from "../../types";

export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEmailTemplatePayload) => {
      const response = await Axios.post<EmailTemplateBackend>("/api/v1/email-templates", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_TEMPLATES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_TEMPLATE_CATEGORIES] });
    },
  });
};
