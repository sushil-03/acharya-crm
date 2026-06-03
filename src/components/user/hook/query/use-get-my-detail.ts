import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface MyDetailResponse {
  id: string;
  email: string;
  username: string;
  role: string;
  campusId: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  counsellorId: string;
  studentId: string;
}

export const useGetMyDetail = () => {
  return useQuery<MyDetailResponse>({
    queryKey: ["my-detail"],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/auth/me");
      return data;
    },
  });
};
