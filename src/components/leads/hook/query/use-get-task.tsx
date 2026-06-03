import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

interface GetTasksParams {
  counsellorId?: string;
  leadId?: string;
  taskStatus?: "pending" | "completed" | "overdue";
  dueDateFrom?: string;
  dueDateTo?: string;
}
export interface TaskResponse {
  data: Task[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}
export interface Task {
  id: string;
  counsellorId: string;
  leadId: string;
  taskType: string;
  taskStatus: string;
  dueDate: string;
  completedAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  lead?: {
    id: string;
    name: string;
    mobile: string;
    status: string;
  };
  counsellor?: {
    id: string;
    name: string;
  };
}

export const useGetTasks = (params?: GetTasksParams) => {
  return useQuery<TaskResponse["data"]>({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/tasks", { params });
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
