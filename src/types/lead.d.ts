export interface LeadInteraction {
  id: string;
  leadId: string;
  counsellorId: string | null;
  interactionType: string;
  outcome: string;
  durationSeconds: number | null;
  notes: string | null;
  followUpDate: string | null;
  callRecordingId: string | null;
  createdAt: string;
}

export interface LeadAssignment {
  id: string;
  leadId: string;
  counsellorId: string | null;
  assignedBy: string | null;
  reason: string;
  isActive: boolean;
  assignedAt: string;
}

export interface LeadDetail {
  id: string;
  name: string;
  mobile: string;
  email: string;
  dob: string;
  gender: string;
  courseInterest: string;
  campusInterest: string;
  campusId: string;
  sourceChannel: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  country: string;
  state: string;
  city: string;
  languagePreference: string;
  leadScore: number;
  status: string;
  isDuplicate: boolean;
  duplicateOfId: string | null;
  lastContactedAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  tasks: any[];
  interactions: LeadInteraction[];
  assignments: LeadAssignment[];
  student: {
    id: string;
    enrollmentStatus: string;
  };
  applications: {
    id: string;
    status: string;
  }[];
}

export interface CounsellorDetail {
  id: string;
  name: string;
  email: string;
  campusId: string;
}

export interface ActiveAssignment {
  id: string;
  leadId: string;
  counsellorId: string;
  assignedBy: string | null;
  reason: string;
  isActive: boolean;
  assignedAt: string;
  counsellor: CounsellorDetail;
}

export interface LeadAssignmentData {
  leadId: string;
  active: ActiveAssignment | null;
  history: any[];
}

export interface LeadTimelineEvent {
  timestamp: string;
  type:
    | "lead_created"
    | "lead_assigned"
    | "interaction"
    | "task_created"
    | "lead_converted"
    | "application_created"
    | "application_fee_initiated"
    | "application_fee_paid"
    | "application_submitted"
    | "application_under_review"
    | "document_uploaded"
    | "document_verified"
    | "application_approved"
    | "offer_created"
    | "offer_released"
    | "scholarship_approved"
    | "scholarship_added"
    | "offer_accepted"
    | "payment_created"
    | "payment"
    | "payment_completed"
    | "payment_confirmed"
    | "enrollment"
    | "enrollment_created"
    | "enrollment_confirmed"
    | string;
  title: string;
  description: string;
  actor?: string | null;
  data?: {
    source?: string;
    leadScore?: number;
    counsellorId?: string;
    counsellorName?: string;
    isActive?: boolean;
    interactionType?: string;
    outcome?: string;
    durationSeconds?: number;
    taskId?: string;
    taskType?: string;
    dueDate?: string;
    studentId?: string;
    applicationId?: string;
    programId?: string;
    programName?: string;
    paymentId?: string;
    amount?: string;
    status?: string;
    documentId?: string;
    documentType?: string;
    offerId?: string;
    offerType?: string;
    totalFee?: string;
    netFeePayable?: string;
    scholarshipId?: string;
    amountType?: string;
    amountValue?: string;
  } & Record<string, any>;
}

export interface LeadTimelineResponse {
  leadId: string;
  leadName: string;
  studentId: string | null;
  currentStatus: string;
  totalEvents: number;
  timeline: LeadTimelineEvent[];
}

