import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface OfferDetail {
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
  application: {
    id: string;
    status: string;
    programId: string;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  scholarships: {
    id: string;
    studentId: string;
    offerId: string;
    applicationId: string;
    scholarshipType: string;
    criteriaMet: {
      reason: string;
    };
    amountType: string;
    amountValue: string;
    approvalStatus: string;
    approvedBy: string | null;
    approvedAt: string | null;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  payments: {
    id: string;
    paymentStatus: string;
    amount: string;
    createdAt: string;
  }[];
}

export const useGetOfferDetail = (offerId: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_OFFER_DETAIL, offerId],
    queryFn: async () => {
      const { data } = await Axios.get<OfferDetail>(`/api/v1/offers/${offerId}`);
      return data;
    },
    enabled: !!offerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
