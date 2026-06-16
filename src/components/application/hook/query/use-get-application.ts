import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface IApplicationDetails {
  id: string;
  leadId: string;
  studentId: string;
  programId?: string;
  campusId: string | null;
  erpSchoolId?: number;
  erpGraduationId?: number;
  erpCoreId?: number;
  erpProgramAssignmentId?: number;
  erpProgramId?: number;
  erpSpecializationId?: number;
  erpAcademicYearId?: number;
  programName?: string;
  specializationName?: string;
  schoolName?: string;
  graduationName?: string;
  coreName?: string;
  academicYearName?: string;
  status: string;
  completionPercent: number;
  formData: Record<string, any>;
  eligibilityStatus: string | null;
  rejectionReason: string | null;
  assignedReviewerId: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  decidedAt: string | null;
  declarationConsent?: boolean;
  declarationPlace?: string | null;
  declarationSignedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    userId?: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  program?: {
    id: string;
    name: string;
    code: string;
    type: string;
    totalFee: string;
  };
  documents: {
    id: string;
    documentType: string;
    fileName: string;
    verificationStatus: string;
    createdAt: string;
  }[];
  offers: {
    id: string;
    status: string;
    totalFee: string;
    netFeePayable: string;
    createdAt: string;
  }[];
  payments?: {
    id: string;
    paymentType: string;
    paymentStatus: string;
    amount: string;
    gatewayOrderId?: string;
  }[];
}

export const useGetApplication = (id?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_APPLICATION_BY_ID, id],
    queryFn: async () => {
      const { data } = await Axios.get<IApplicationDetails>(`/api/v1/applications/${id}`);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: !!id,
  });
};
