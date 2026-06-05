export interface EmailTemplateBackend {
  id: string;
  key: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  editorType: string;
  designJson: Record<string, unknown>;
  variables: string[];
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplateBackendListItem {
  id: string;
  key: string;
  name: string;
  subject: string;
  variables: string[];
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  editorType?: string;
  type?: string;
}

export interface CreateEmailTemplatePayload {
  key: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  editorType: string;
  designJson: Record<string, unknown>;
  variables: string[];
  category: string;
  isActive: boolean;
}

export interface UpdateEmailTemplatePayload {
  key?: string;
  name?: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  editorType?: string;
  designJson?: Record<string, unknown>;
  variables?: string[];
  category?: string;
  isActive?: boolean;
}

export interface GetEmailTemplatesParams {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface EmailTemplatesListResponse {
  data: EmailTemplateBackendListItem[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface PreviewEmailTemplatePayload {
  variables: Record<string, string>;
}

export interface PreviewEmailTemplateResponse {
  html: string;
  text?: string;
}
