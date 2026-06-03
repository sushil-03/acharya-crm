import Axios from "@/lib/axios-config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CancelEnrollmentPayload {
  reason: string;
}

export const useCancelEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CancelEnrollmentPayload }) => {
      const { data } = await Axios.post(`/api/v1/enrollments/${id}/cancel`, payload);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments", id] });
    },
  });
};
