import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: string;
  maxDiscountAmt: string | null;
  campaignId: string | null;
  assignedToStudentId: string | null;
  validFrom: string | null;
  validUntil: string | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface GetCouponsParams {
  isActive?: boolean;
  search?: string;
  campaignId?: string;
  assignedToStudentId?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedCouponsResponse {
  data: Coupon[];
  meta: { total: number; page: number; pageSize: number };
}

export const useGetCoupons = (params: GetCouponsParams = {}) => {
  return useQuery<PaginatedCouponsResponse>({
    queryKey: [QUERY_KEYS.GET_COUPONS, params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params.isActive !== undefined) query.set("isActive", String(params.isActive));
      if (params.search) query.set("search", params.search);
      if (params.campaignId) query.set("campaignId", params.campaignId);
      if (params.assignedToStudentId) query.set("assignedToStudentId", params.assignedToStudentId);
      if (params.page) query.set("page", String(params.page));
      if (params.pageSize) query.set("pageSize", String(params.pageSize));
      const { data } = await Axios.get(`/api/v1/coupons?${query.toString()}`);
      return data;
    },
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
};
