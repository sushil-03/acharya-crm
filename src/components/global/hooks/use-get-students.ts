import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  city: string;
  enrollmentStatus: "enrolled" | "cancelled" | null;
  createdAt: string;
  lead: {
    id: string;
    sourceChannel: string;
    status: string;
  };
  _count: {
    applications: number;
    payments: number;
  };
}

export interface GetStudentsParams {
  search?: string;
  enrollmentStatus?: "enrolled" | "cancelled";
}

export const useGetStudents = (params?: GetStudentsParams) => {
  return useQuery({
    queryKey: ["students", params],
    queryFn: async () => {
      const { data } = await Axios.get<Student[]>("/api/v1/students", {
        params,
      });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
