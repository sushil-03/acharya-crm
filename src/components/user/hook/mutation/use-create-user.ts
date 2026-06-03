import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface CreateUserPayload {
  email: string;
  password?: string;
  role: string;
  campusId?: string;
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      const response = await Axios.post("/api/v1/auth/users", payload);
      return response;
    },
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER] });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to create user";
      toast.error(errorMessage);
    },
  });
};
