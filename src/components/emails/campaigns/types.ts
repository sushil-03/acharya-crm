export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "running"
  | "complete"
  | "error"
  | "cancelled";

export type RecipientFilterType = "all_leads" | "by_status" | "by_campus" | "by_list";

export type LeadStatus = "new" | "qualified" | "assigned" | "contacted" | "nurturing";

export interface RecipientFilter {
  type: RecipientFilterType;
  statuses?: LeadStatus[];
  campusIds?: string[];
  listIds?: string[];
}

export interface CampaignEmailTemplate {
  id: string;
  name: string;
  subject: string;
}

export interface Campaign {
  id: string;
  name: string;
  category: string;
  status: CampaignStatus;
  emailTemplateId: string;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  openCount: number;
  clickCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  emailTemplate: CampaignEmailTemplate | null;
  recipientFilter?: RecipientFilter;
  _count?: { recipients: number };
}

export interface CampaignListMeta {
  total: number;
  page: number;
  pageSize: number;
}

export interface CampaignListResponse {
  data: Campaign[];
  meta: CampaignListMeta;
}

export interface GetCampaignsParams {
  status?: CampaignStatus;
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateCampaignPayload {
  name: string;
  category: string;
  emailTemplateId: string;
  recipientFilter: RecipientFilter;
}

export interface UpdateCampaignPayload {
  name?: string;
  category?: string;
  emailTemplateId?: string;
  recipientFilter?: RecipientFilter;
}

export interface ScheduleCampaignPayload {
  scheduledAt?: string;
}

export interface PreviewRecipientsResponse {
  estimatedRecipients: number;
  filter: RecipientFilter;
}

export type CampaignRecipientStatus = "pending" | "sent" | "failed" | "opened" | "clicked";

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  leadId: string;
  email: string;
  status: CampaignRecipientStatus;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  failReason: string | null;
  lead: {
    id: string;
    name: string;
    mobile: string;
    status: string;
  };
}

export interface CampaignRecipientsResponse {
  data: CampaignRecipient[];
  meta: CampaignListMeta;
}
