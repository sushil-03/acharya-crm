import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface TraceStudent {
  id: string;
  name: string;
  email: string;
  mobile: string;
  userId: string | null;
  enrollmentStatus: string | null;
}

export interface TraceLead {
  id: string;
  status: string;
  source: string;
  utm: {
    source: string;
    medium: string;
    campaign: string;
  };
  leadScore: number;
  courseInterest: string;
  notes: string;
  capturedAt: string;
  lastContactedAt: string | null;
  assignments: any[];
  interactions: any[];
  tasks: any[];
}

export interface TraceApplication {
  id: string;
  status: string;
  completionPercent: number;
  program: {
    id: string;
    name: string;
    code: string;
    type: string;
  };
  submittedAt: string | null;
  reviewedAt: string | null;
  decidedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  documents: any[];
  offers: any[];
}

export interface StudentTraceSummary {
  totalInteractions: number;
  totalTasks: number;
  tasksCompleted: number;
  totalPaid: number;
  adSpendCpl: number;
  roi: number | null;
}

export interface StudentTraceResponse {
  student: TraceStudent;
  lead: TraceLead;
  applications: TraceApplication[];
  payments: any[];
  enrollments: any[];
  summary: StudentTraceSummary;
}

export const useGetStudentTrace = (studentId?: string) => {
  return useQuery<StudentTraceResponse>({
    queryKey: ["student-trace", studentId],
    queryFn: async () => {
      const { data } = await Axios.get(`/api/v1/analytics/student-trace/${studentId}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!studentId,
  });
};
