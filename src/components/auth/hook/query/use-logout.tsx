import { LOCAL_STORAGE_KEY } from "@/lib/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Axios from "@/lib/axios-config";
import { useUserStore } from "@/store/use-user-store";
const clearAllStores = () => {
  useUserStore.getState().logout();
};
export const clearAppData = () => {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(LOCAL_STORAGE_KEY.STORAGE_KEY);
  sessionStorage.removeItem(LOCAL_STORAGE_KEY.AUTH_TOKEN);
  clearAllStores();
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        await Axios.post("/api/v1/auth/logout");
      } catch (error) {
        console.error("Logout API failed", error);
      } finally {
        clearAppData();
        queryClient.clear();
      }
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Successfully logged out");
      window.location.href = "/login";
    },
    onError: (error) => {
      toast.error("Failed to logout");
    },
  });

  return { logout: mutation.mutate, isPending: mutation.isPending };
};
