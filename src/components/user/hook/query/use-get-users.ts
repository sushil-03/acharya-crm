import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface UserCampus {
  name: string;
  code: string;
}

export interface Counsellor {
  id: string;
  name: string;
  isActive: boolean;
  isAvailable: boolean;
  specialization: string[];
}

export interface User {
  id: string;
  email: string;
  username: string | null;
  role: string;
  campusId: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  campus: UserCampus | null;
  counsellor?: Counsellor | null;
}

export const useGetUsers = () => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/auth/users");
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
