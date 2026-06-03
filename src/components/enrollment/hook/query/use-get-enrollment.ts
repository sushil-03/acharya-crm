import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface EnrollmentStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  applicationId: string;
  programId: string;
  campusId: string;
  enrollmentStatus: string;
  studentIdGenerated: string;
  erpSyncStatus: string;
  erpSyncAt: string | null;
  erpStudentRef: string | null;
  orientationAt: string | null;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
  student: EnrollmentStudent;
}

export interface GetEnrollmentsParams {
  campusId?: string | number;
  enrollmentStatus?: string;
}

export const useGetEnrollments = (params?: GetEnrollmentsParams) => {
  return useQuery<Enrollment[]>({
    queryKey: ["enrollments", params],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/enrollments", { params });
      return data;
    },
  });
};

export const useGetEnrollment = (id: string) => {
  return useQuery<Enrollment>({
    queryKey: ["enrollments", id],
    queryFn: async () => {
      const { data } = await Axios.get(`/api/v1/enrollments/${id}`);
      return data;
    },
    enabled: !!id,
  });
};
