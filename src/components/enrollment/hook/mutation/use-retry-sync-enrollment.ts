import Axios from "@/lib/axios-config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRetrySyncEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Axios.post(`/api/v1/enrollments/${id}/retry-sync`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments", id] });
    },
  });
};
