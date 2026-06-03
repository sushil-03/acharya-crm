import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface CreateOfferPayload {
  applicationId: string;
  offerType: string;
  totalFee: number;
  conditions: string[];
}

export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOfferPayload) => {
      const response = await Axios.post("/api/v1/offers", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Offer created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_OFFER] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_APPLICATIONS] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to create offer";
      toast.error(errorMessage);
    },
  });
};
