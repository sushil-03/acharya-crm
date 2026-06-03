import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";

export interface CreateProgramPayload {
  name: string;
  code: string;
  type: string;
  campusId: string;
  discipline: string;
  specialization?: string | null;
  intakeCapacity: number;
  durationYears: number;
  totalFee: number | string;
  applicationFee: number | string;
  eligibilityCriteria?: {
    minPercent?: number;
    boards?: string[];
    entranceRequired?: boolean;
  } | null;
}

export const useCreateProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProgramPayload) => {
      const response = await Axios.post("/api/v1/programs", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });
};
