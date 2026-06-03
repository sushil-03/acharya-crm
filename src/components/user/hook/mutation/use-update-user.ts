import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UpdateUserPayload {
  role?: string;
  campusId?: string | null;
  username?: string | null;
  isActive?: boolean;
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateUserPayload }) => {
      const response = await Axios.patch(`/api/v1/auth/users/${id}`, payload);
      return response;
    },
    onSuccess: () => {
      // Refetches the users list to reflect the updated data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER] });
    },
  });
};
