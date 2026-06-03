import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface Offer {
  id: string;
  applicationId: string;
  studentId: string;
  programId: string;
  campusId: string;
  offerType: string;
  status: string;
  totalFee: string;
  scholarshipAmount: string;
  netFeePayable: string;
  conditions: string[];
  conditionsFulfilled: boolean;
  validityDate: string | null;
  releasedAt: string | null;
  acceptedAt: string | null;
  offerLetterUrl: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
  scholarships: {
    id: string;
    scholarshipType: string;
    amountValue: string;
    approvalStatus: string;
  }[];
}

export interface GetOffersParams {
  status?: string;
}

export const useGetAllOffer = (params?: GetOffersParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ALL_OFFER, params],
    queryFn: async () => {
      const { data } = await Axios.get<Offer[]>("/api/v1/offers", { params });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
