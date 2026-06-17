import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface CreateCouponPayload {
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maxDiscountAmt?: number | null;
  campaignId?: string | null;
  assignedToStudentId?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  maxUses?: number | null;
  isActive?: boolean;
}

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCouponPayload) => {
      const response = await Axios.post("/api/v1/coupons", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Coupon created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COUPONS] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create coupon");
    },
  });
};
