import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface ErpRole {
  id: string;
  crmStatus: string;
  crmRole: string;
  label: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const useGetErpRoles = () => {
  return useQuery<ErpRole[]>({
    queryKey: [QUERY_KEYS.GET_ERP_ROLES],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/auth/erp-roles");
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};
