import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateCounsellorPayload {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  campusId: string;
  specialization: string[];
  languageProficiency: string[];
  dailyCallTarget: number;
}

export const useCreateCounsellor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCounsellorPayload) => {
      const { data } = await Axios.post("/api/v1/counsellors", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_COUNCELLOR] });
      toast.success("Counsellor created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create counsellor");
    },
  });
};
