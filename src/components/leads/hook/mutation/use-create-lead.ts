import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface CreateLeadPayload {
  name: string;
  mobile: string;
  email: string;
  dob: string;
  gender: string;
  courseInterest: string;
  campusInterest: string;
  campusId: string;
  sourceChannel: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  country: string;
  state: string;
  city: string;
  languagePreference: string;
  notes: string;
}

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLeadPayload) => {
      const response = await Axios.post("/api/v1/leads", payload);
      return response;
    },
    onSuccess: () => {
      toast.success("Lead created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS] });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to create lead";
      toast.error(errorMessage);
    },
  });
};
