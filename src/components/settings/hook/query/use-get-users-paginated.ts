import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface UserCampus {
  name: string;
  code: string;
}

export interface UserCounsellor {
  id: string;
  name: string;
  isActive: boolean;
  isAvailable: boolean;
  specialization: string[];
}

export interface PaginatedUser {
  id: string;
  email: string;
  username: string | null;
  role: string;
  campusId: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  campus: UserCampus | null;
  counsellor?: UserCounsellor | null;
  mobile?: string | null;
  phone?: string | null;
}

export interface GetUsersParams {
  role?: string;
  search?: string;
  campusId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedUsersResponse {
  data: PaginatedUser[];
  meta: { total: number; page: number; pageSize: number };
}

export const useGetUsersPaginated = (params: GetUsersParams = {}) => {
  return useQuery<PaginatedUsersResponse>({
    queryKey: ["users-paginated", params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params.role) query.set("role", params.role);
      if (params.search) query.set("search", params.search);
      if (params.campusId) query.set("campusId", params.campusId);
      if (params.isActive !== undefined) query.set("isActive", String(params.isActive));
      if (params.page) query.set("page", String(params.page));
      if (params.pageSize) query.set("pageSize", String(params.pageSize));
      const { data } = await Axios.get(`/api/v1/auth/users?${query.toString()}`);
      return data;
    },
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
};
