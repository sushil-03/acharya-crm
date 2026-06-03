import Axios, { ApiError, AxiosPublic } from "@/lib/axios-config";
import { LoginRequest, LoginResponse } from "@/types/user";
import { useMutation } from "@tanstack/react-query";

export const useLogin = () => {
  const mutation = useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: async ({ username, password }) => {
      const endpoint = "/api/v1/auth/login";

      const payload = {
        email: username,
        password,
      };

      const response = await Axios.post(endpoint, payload);
      return response.data as LoginResponse;
    },
  });

  return {
    signin: mutation.mutate,
    isPending: mutation.isPending,
  };
};
