import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { UpdateEmailTemplatePayload, EmailTemplateBackend } from "../../types";

export interface UpdateEmailTemplateVariables {
  id: string;
  data: UpdateEmailTemplatePayload;
}

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: UpdateEmailTemplateVariables) => {
      const response = await Axios.patch<EmailTemplateBackend>(`/api/v1/email-templates/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_TEMPLATES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_TEMPLATE_DETAILS, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_TEMPLATE_CATEGORIES] });
    },
  });
};
