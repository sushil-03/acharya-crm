export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: "visual" | "rich-text" | "html" | "plain-text";
  content: string; // HTML string or plain text
  visualData?: string; // GrapesJS specific JSON string representing layout state
  tags: string[];
  createdBy: string;
  modifiedBy: string;
  accessibleTo: "Everyone" | "Me Only" | "Role Custom";
  createdOn: string;
  modifiedOn: string;
  status: "Published" | "Draft";
}
