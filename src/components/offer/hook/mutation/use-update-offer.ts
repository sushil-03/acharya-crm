import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useReleaseOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await Axios.post(`/api/v1/offers/${id}/release`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Offer released successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_OFFER] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to release offer";
      toast.error(errorMessage);
    },
  });
};

export const useAcceptOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await Axios.post(`/api/v1/offers/${id}/accept`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Offer accepted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_OFFER] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_OFFER_DETAIL] });

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_STUDENT_DETAIL] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to accept offer";
      toast.error(errorMessage);
    },
  });
};

export const useRejectOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await Axios.post(`/api/v1/offers/${id}/reject`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Offer rejected successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_OFFER] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_STUDENT_DETAIL] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_OFFER_DETAIL] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to reject offer";
      toast.error(errorMessage);
    },
  });
};
