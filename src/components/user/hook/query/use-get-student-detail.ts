import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface StudentLeadAssignment {
  assignedAt: string;
  counsellor: {
    id: string;
    name: string;
  };
}

export interface StudentLeadDetail {
  id: string;
  sourceChannel: string;
  status: string;
  campusId: string;
  leadScore: number;
  lastContactedAt: string;
  assignments: StudentLeadAssignment[];
}

export interface StudentApplicationDetail {
  id: string;
  status: string;
  programId: string;
  campusId: string;
  createdAt: string;
}

export interface StudentOfferDetail {
  id: string;
  status: string;
  netFeePayable: string;
  createdAt: string;
}

export interface StudentPaymentDetail {
  id: string;
  paymentType: string;
  paymentStatus: string;
  amount: string;
  gatewayOrderId?: string;
  paidAt: string;
}

export interface StudentEnrollmentDetail {
  id: string;
  enrollmentStatus: string;
  studentIdGenerated: string;
  confirmedAt: string;
}

export interface StudentDetailResponse {
  id: string;
  leadId: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  passportNumber: string | null;
  nationality: string | null;
  address: string | null;
  city: string;
  state: string;
  country: string;
  academicBoard: string | null;
  academicPercent: string | null;
  enrollmentStatus: string;
  createdAt: string;
  updatedAt: string;
  lead: StudentLeadDetail;
  applications: StudentApplicationDetail[];
  offers: StudentOfferDetail[];
  payments: StudentPaymentDetail[];
  enrollments: StudentEnrollmentDetail[];
}

export const useGetStudentDetail = (id: string) => {
  return useQuery<StudentDetailResponse>({
    queryKey: [QUERY_KEYS.GET_STUDENT_DETAIL, id],
    queryFn: async () => {
      const { data } = await Axios.get(`/api/v1/students/${id}`);
      return data;
    },
    enabled: !!id,
  });
};
