import { useQuery } from "@tanstack/react-query";
import Axios from "@/lib/axios-config";
import { Program } from "@/components/global/hooks/use-get-programs";

export const useGetProgramById = (id: string) => {
  return useQuery({
    queryKey: ["program", id],
    queryFn: async () => {
      const { data } = await Axios.get<Program>(`/api/v1/programs/${id}`);
      return data;
    },
    enabled: !!id,
  });
};
