import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface UpdateCouponPayload {
  description?: string;
  discountValue?: number;
  maxDiscountAmt?: number | null;
  assignedToStudentId?: string | null;
  validUntil?: string | null;
  maxUses?: number | null;
  isActive?: boolean;
}

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateCouponPayload }) => {
      const response = await Axios.patch(`/api/v1/coupons/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Coupon updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COUPONS] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update coupon");
    },
  });
};
