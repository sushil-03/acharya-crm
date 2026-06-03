import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface Campus {
  id: string;
  name: string;
  code: string;
  address: string | null;
  city: string;
  state: string;
  country: string;
  timezone: string;
  currency: string;
  isInternational: boolean;
  intakeCapacity: number;
  directorId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    programs: number;
    leads: number;
  };
}
export interface CampusResponse{
    data: Campus[],
    meta: {
        total: number,
        page: number,
        pageSize: number
    }
}
export interface GetCampusesParams {
  isActive?: boolean;
}

export const useGetCampuses = (params?: GetCampusesParams) => {
  return useQuery({
    queryKey: ["campuses", params],
    queryFn: async () => {
      const response = await Axios.get<CampusResponse>("/api/v1/campuses", {
        params,
      });
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
