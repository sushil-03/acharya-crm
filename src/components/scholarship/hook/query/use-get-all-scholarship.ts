import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface Scholarship {
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
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  updatedAt: string;
}

export interface GetAllScholarshipParams {
  approvalStatus?: string;
}

export const useGetAllScholarship = (params?: GetAllScholarshipParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ALL_SCHOLARSHIP, params],
    queryFn: async () => {
      const { data } = await Axios.get<Scholarship[]>("/api/v1/scholarships", {
        params,
      });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
