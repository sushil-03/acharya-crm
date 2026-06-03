import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";

export interface UpdateProgramPayload {
  name?: string;
  type?: string;
  discipline?: string;
  specialization?: string | null;
  intakeCapacity?: number;
  durationYears?: number;
  totalFee?: number | string;
  applicationFee?: number | string;
  isActive?: boolean;
  eligibilityCriteria?: {
    minPercent?: number;
    boards?: string[];
    entranceRequired?: boolean;
  } | null;
}

export const useUpdateProgram = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProgramPayload) => {
      const response = await Axios.patch(`/api/v1/programs/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["program", id] });
    },
  });
};
