import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface CreatePaymentPayload {
  amount?: number;
  paymentMethod?: string;
  notes?: string;
  [key: string]: any;
}

interface CreatePaymentVariables {
  id: string;
  payload?: CreatePaymentPayload;
}

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: CreatePaymentVariables) => {
      const { data } = await Axios.post(`/api/v1/payments/${id}/initiate`, payload || {});
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_OFFER_DETAIL] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_STUDENT_DETAIL] });
      toast.success("Payment initiated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to initiate payment");
    },
  });
};
