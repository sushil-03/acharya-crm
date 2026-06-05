import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";

export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await Axios.delete(`/api/v1/email-templates/${id}`);
      return response.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_TEMPLATES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_TEMPLATE_DETAILS, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_EMAIL_TEMPLATE_CATEGORIES] });
    },
  });
};
