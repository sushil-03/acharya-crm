import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface Application {
  id: string;
  leadId: string;
  studentId: string;
  programId: string;
  campusId: string;
  status: string;
  completionPercent: number;
  formData: Record<string, any>;
  eligibilityStatus: string | null;
  rejectionReason: string | null;
  assignedReviewerId: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  program: {
    id: string;
    name: string;
    code: string;
  };
  _count: {
    documents: number;
  };
  offers: {
    id: string;
    status: string;
    totalFee: string;
    netFeePayable: string;
    createdAt: string;
  }[];
}

export interface GetApplicationsParams {
  campusId?: string;
  status?: string;
  search?: string;
}

export const useGetApplications = (params?: GetApplicationsParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_APPLICATIONS, params],
    queryFn: async () => {
      const { data } = await Axios.get<Application[]>("/api/v1/applications", {
        params,
      });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
