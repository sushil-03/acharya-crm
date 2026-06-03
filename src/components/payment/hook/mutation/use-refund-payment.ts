import Axios from "@/lib/axios-config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface RefundPaymentPayload {
  reason: string;
}

interface RefundPaymentVariables {
  id: string;
  payload: RefundPaymentPayload;
}

export const useRefundPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: RefundPaymentVariables) => {
      const { data } = await Axios.post(`/api/v1/payments/${id}/refund`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("Payment refunded successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to refund payment");
    },
  });
};
