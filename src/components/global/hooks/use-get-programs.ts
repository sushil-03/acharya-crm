import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface Program {
  id: string;
  name: string;
  code: string;
  type: string;
  discipline: string;
  specialization: string | null;
  intakeCapacity: number;
  durationYears: number;
  eligibilityCriteria: string | null;
  totalFee: string;
  campusId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  campus: {
    id: string;
    name: string;
    code: string;
  };
  _count: {
    applications: number;
  };
}

export interface GetProgramsParams {
  campusId?: string;
  type?: "undergraduate" | "postgraduate" | "diploma" | "certificate" | "doctoral";
  discipline?: string;
  isActive?: boolean;
}

export const useGetPrograms = (params?: GetProgramsParams) => {
  return useQuery({
    queryKey: ["programs", params],
    queryFn: async () => {
      const { data } = await Axios.get<Program[]>("/api/v1/programs", {
        params,
      });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
