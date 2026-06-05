import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface AnalyticsFilters {
  from?: string;
  to?: string;
  campusId?: string | number | null;
  groupBy?: "day" | "month" | "week" | null;
}

// 1. Analytics Overview
export interface AnalyticsOverviewPeriod {
  from: string;
  to: string;
  campusId: string | null;
}

export interface AnalyticsOverviewKpis {
  totalLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  leadQualificationRate: number;
  leadConversionRate: number;
  totalApplications: number;
  submittedApplications: number;
  approvedApplications: number;
  applicationSubmitRate: number;
  totalEnrollments: number;
  enrollmentYield: number;
  revenueCollected: number;
}

export interface AnalyticsOverviewResponse {
  period: AnalyticsOverviewPeriod;
  kpis: AnalyticsOverviewKpis;
}

// 2. Funnel Lead-to-Enrollment
export interface FunnelLeadToEnrollmentPeriod {
  from: string;
  to: string;
}

export interface FunnelLeadToEnrollmentSeriesItem {
  period: string;
  leadsCreated: number;
  applicationsStarted: number;
  submitted: number;
  enrolled: number;
}

export interface FunnelLeadToEnrollmentResponse {
  groupBy: string;
  period: FunnelLeadToEnrollmentPeriod;
  description: string;
  series: FunnelLeadToEnrollmentSeriesItem[];
}

// 3. Funnel Application-to-Enrollment
export interface FunnelApplicationToEnrollmentPeriod {
  from: string;
  to: string;
}

export interface FunnelApplicationToEnrollmentSeriesItem {
  period: string;
  applicationsCreated: number;
  submitted: number;
  verified: number;
  approved: number;
  offerReleased: number;
  feePaid: number;
  enrolled: number;
}

export interface FunnelApplicationToEnrollmentResponse {
  groupBy: string;
  period: FunnelApplicationToEnrollmentPeriod;
  series: FunnelApplicationToEnrollmentSeriesItem[];
}

// 4. Leads by Source
export interface LeadsBySourceItem {
  source: string;
  leads: number;
  applications: number;
  enrolled: number;
  conversionRate: number;
}

export interface LeadsBySourceResponse {
  sources: LeadsBySourceItem[];
}

// 5. Leads by Source and Stage
export interface LeadsBySourceAndStageItem {
  source: string;
  total: number;
  stages: Record<string, number>;
}

export interface LeadsBySourceAndStageResponse {
  stages: string[];
  sources: LeadsBySourceAndStageItem[];
}

// 6. Leads by Program
export interface LeadsByProgramItem {
  programId: string;
  programName: string;
  programCode: string;
  leads: number;
  enrolled: number;
  enrollmentRate: number;
}

export interface LeadsByProgramResponse {
  programs: LeadsByProgramItem[];
}

// 7. Leads by Course
export interface LeadsByCourseItem {
  courseInterest: string;
  leads: number;
}

export interface LeadsByCourseResponse {
  courses: LeadsByCourseItem[];
}

// 8. Lead Source by Campus
export interface LeadsSourceByCampusItem {
  source: string;
  campusId: string;
  campusName: string;
  count: number;
}

export interface LeadsSourceByCampusCampus {
  id: string;
  name: string;
}

export interface LeadsSourceByCampusResponse {
  sources: string[];
  campuses: LeadsSourceByCampusCampus[];
  data: LeadsSourceByCampusItem[];
}

// 9. Lead Source by Program
export interface LeadsSourceByProgramItem {
  source: string;
  programId: string;
  programName: string;
  programCode: string;
  count: number;
}

export interface LeadsSourceByProgramProgram {
  id: string;
  name: string;
  code: string;
}

export interface LeadsSourceByProgramResponse {
  sources: string[];
  programs: LeadsSourceByProgramProgram[];
  data: LeadsSourceByProgramItem[];
}

// Helper to clean parameters
const cleanParams = (filters?: AnalyticsFilters) => {
  if (!filters) return {};
  const params: Record<string, any> = {};
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  if (filters.campusId) params.campusId = filters.campusId;
  if (filters.groupBy) params.groupBy = filters.groupBy;
  return params;
};

// Hook Definitions
export const useGetAnalyticsOverview = (filters?: AnalyticsFilters) => {
  return useQuery<AnalyticsOverviewResponse>({
    queryKey: ["analytics-overview", filters],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/analytics/overview", {
        params: cleanParams(filters),
      });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

export const useGetFunnelLeadToEnrollment = (filters?: AnalyticsFilters) => {
  return useQuery<FunnelLeadToEnrollmentResponse>({
    queryKey: ["funnel-lead-to-enrollment", filters],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/analytics/funnel/lead-to-enrollment", {
        params: cleanParams(filters),
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useGetFunnelApplicationToEnrollment = (filters?: AnalyticsFilters) => {
  return useQuery<FunnelApplicationToEnrollmentResponse>({
    queryKey: ["funnel-application-to-enrollment", filters],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/analytics/funnel/application-to-enrollment", {
        params: cleanParams(filters),
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useGetLeadsBySource = (filters?: AnalyticsFilters) => {
  return useQuery<LeadsBySourceResponse>({
    queryKey: ["leads-by-source", filters],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/analytics/leads/by-source", {
        params: cleanParams(filters),
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useGetLeadsBySourceAndStage = (filters?: AnalyticsFilters) => {
  return useQuery<LeadsBySourceAndStageResponse>({
    queryKey: ["leads-by-source-and-stage", filters],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/analytics/leads/by-source-and-stage", {
        params: cleanParams(filters),
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useGetLeadsByProgram = (filters?: AnalyticsFilters) => {
  return useQuery<LeadsByProgramResponse>({
    queryKey: ["leads-by-program", filters],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/analytics/leads/by-program", {
        params: cleanParams(filters),
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useGetLeadsByCourse = (filters?: AnalyticsFilters) => {
  return useQuery<LeadsByCourseResponse>({
    queryKey: ["leads-by-course", filters],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/analytics/leads/by-course", {
        params: cleanParams(filters),
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useGetLeadsSourceByCampus = (filters?: AnalyticsFilters) => {
  return useQuery<LeadsSourceByCampusResponse>({
    queryKey: ["leads-source-by-campus", filters],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/analytics/leads/source-by-campus", {
        params: cleanParams(filters),
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useGetLeadsSourceByProgram = (filters?: AnalyticsFilters) => {
  return useQuery<LeadsSourceByProgramResponse>({
    queryKey: ["leads-source-by-program", filters],
    queryFn: async () => {
      const { data } = await Axios.get("/api/v1/analytics/leads/source-by-program", {
        params: cleanParams(filters),
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};
