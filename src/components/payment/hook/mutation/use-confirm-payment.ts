import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ConfirmPaymentPayload {
  referenceNumber: string;
  notes: string;
}

interface ConfirmPaymentVariables {
  id: string;
  payload: ConfirmPaymentPayload;
}

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: ConfirmPaymentVariables) => {
      const { data } = await Axios.post(`/api/v1/payments/${id}/confirm`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_OFFER_DETAIL] });

      toast.success("Payment confirmed successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to confirm payment");
    },
  });
};
