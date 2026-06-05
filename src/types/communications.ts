export type Channel = "whatsapp" | "instagram" | "facebook" | "web";
export type ConvStatus = "open" | "bot" | "resolved";
export type MessageStatus = "sent" | "delivered" | "read";

export interface ChatMessage {
  id: string;
  text: string;
  isMe: boolean;
  time: string;
  status: MessageStatus;
  attachments?: { name: string; url: string; type: string }[];
  isSystem?: boolean;
}

export interface ChatContact {
  name: string;
  avatar: string;
  leadId: string;
  program: string;
  stage: string;
  phone: string;
  email: string;
  score: number;
  assignedTo: string;
}

export interface Conversation {
  id: string;
  contact: ChatContact;
  channel: Channel;
  status: ConvStatus;
  messages: ChatMessage[];
  unread: number;
  lastMessage: string;
  lastTime: string;
  tags: string[];
}

export interface ChatTemplate {
  id: string;
  category: "welcome" | "documents" | "scholarship" | "fee" | "tour" | "followup" | "other";
  title: string;
  content: string;
  channel?: Channel;
}

export interface AutoResponse {
  id: string;
  trigger: "welcome" | "away" | "faq";
  label: string;
  enabled: boolean;
  response: string;
  question?: string;
}

export interface AssignmentRule {
  id: string;
  label: string;
  channel?: Channel;
  program?: string;
  source?: string;
  assignTo: "round_robin" | string;
  assignToLabel: string;
  priority: number;
}

export interface WidgetConfig {
  chatName: string;
  greeting: string;
  primaryColor: string;
  logoUrl: string;
  isLive: boolean;
}
