import { useMutation } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { PreviewEmailTemplatePayload, PreviewEmailTemplateResponse } from "../../types";

export interface PreviewEmailTemplateVariables {
  id: string;
  data: PreviewEmailTemplatePayload;
}

export const usePreviewEmailTemplate = () => {
  return useMutation({
    mutationFn: async ({ id, data }: PreviewEmailTemplateVariables) => {
      const response = await Axios.post<PreviewEmailTemplateResponse>(
        `/api/v1/email-templates/${id}/preview`,
        data
      );
      return response.data;
    },
  });
};
