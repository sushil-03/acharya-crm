import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

interface GetCounsellorsParams {
  isActive?: boolean;
  isAvailable?: boolean;
}

export interface Counsellor {
  id: string;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  specialization: string[];
  languageProficiency: string[];
  campusId: string;
  dailyCallTarget: number;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    leadAssignments: number;
  };
}

export const useGetCounsellors = (params?: GetCounsellorsParams) => {
  return useQuery<Counsellor[]>({
    queryKey: ["counsellors", params],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/counsellors", { params });
      return data;
    },
    retry: 2,
    staleTime: 1000 * 60 * 5,
  });
};
