export const OFFER_STATUS = [
  { value: "draft", label: "Draft", tone: "muted" },
  { value: "released", label: "Released", tone: "info" },
  { value: "accepted", label: "Accepted", tone: "success" },
  { value: "rejected", label: "Rejected", tone: "danger" },
  { value: "expired", label: "Expired", tone: "warning" },
];
export const USER_ROLES = [
  { label: "Super Admin", value: "super_admin" },
  { label: "Chairman", value: "chairman" },
  { label: "Admissions Director", value: "admissions_director" },
  { label: "Marketing", value: "marketing" },
  { label: "Counsellor", value: "counsellor" },
  { label: "Telecaller", value: "telecaller" },
  { label: "Verification Team", value: "verification_team" },
  { label: "Finance", value: "finance" },
  { label: "Campus Director", value: "campus_director" },
  { label: "International Office", value: "international_office" },
  { label: "Student", value: "student" },
  { label: "Channel Partner", value: "channel_partner" },
];

export const SCHOLARSHIP_TYPES = [
  { label: "Merit", value: "merit" },
  { label: "Sports", value: "sports" },
  { label: "Diversity", value: "diversity" },
  { label: "International", value: "international" },
  { label: "Financial Aid", value: "financial_aid" },
  { label: "Special", value: "special" },
];

export const TASK_TYPES = [
  { value: "follow_up", label: "Follow Up" },
  { value: "call_back", label: "Call Back" },
  { value: "send_documents", label: "Send Documents" },
  { value: "application_reminder", label: "Application Reminder" },
  { value: "payment_reminder", label: "Payment Reminder" },
  { value: "others", label: "Others" },
];

export const TASK_STATUS = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

export const getOfferStatusTone = (status?: string) => {
  if (!status) return "muted";
  const normalized = status.toLowerCase();
  const found = OFFER_STATUS.find(
    (s) => s.value === normalized || s.label.toLowerCase() === normalized,
  );
  return found?.tone || "muted";
};

export const getOfferStatusLabel = (status?: string) => {
  if (!status) return "Draft";
  const normalized = status.toLowerCase();
  const found = OFFER_STATUS.find(
    (s) => s.value === normalized || s.label.toLowerCase() === normalized,
  );
  return found?.label || status;
};
export const APPLICATION_STATUS = [
  { value: "started", label: "Started", tone: "primary" },
  { value: "submitted", label: "Submitted", tone: "info" },
  { value: "payment_pending", label: "Payment Pending", tone: "warning-light" },
  { value: "under_review", label: "Under Review", tone: "warning" },
  { value: "docs_pending", label: "Docs Pending", tone: "warning" },
  { value: "verified", label: "Verified", tone: "success" },
  { value: "approved", label: "Approved", tone: "success" },
  { value: "rejected", label: "Rejected", tone: "danger" },
];

export const getApplicationStatusTone = (status?: string) => {
  if (!status) return "primary";
  const normalized = status.toLowerCase();
  const found = APPLICATION_STATUS.find(
    (s) => s.value === normalized || s.label.toLowerCase() === normalized,
  );
  return found?.tone || "primary";
};

export const getApplicationStatusLabel = (status?: string) => {
  if (!status) return "Started";
  const normalized = status.toLowerCase();
  const found = APPLICATION_STATUS.find(
    (s) => s.value === normalized || s.label.toLowerCase() === normalized,
  );
  return found?.label || status;
};
export const LEAD_STATUS = [
  { label: "New", value: "new" },
  { label: "Qualified", value: "qualified" },
  { label: "Assigned", value: "assigned" },
  { label: "Contacted", value: "contacted" },
  { label: "Nurturing", value: "nurturing" },
  { label: "Converted", value: "converted" },
  { label: "Lost", value: "lost" },
];

export const LEAD_SOURCES = [
  { label: "Meta", value: "meta" },
  { label: "Instagram", value: "instagram" },
  { label: "Google", value: "google" },
  { label: "YouTube", value: "youtube" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Website", value: "website" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Event", value: "event" },
  { label: "Walk-in", value: "walk_in" },
  { label: "Referral", value: "referral" },
  { label: "Phone", value: "phone" },
  { label: "CSV Import", value: "csv_import" },
];
export const CAMPUSES = [
  { label: "Acharya Bangalore Main Campus", value: "f4ab6e99-0d6a-47aa-9d75-161721687437" },
];

export const PROGRAMS = [
  { label: "B.Tech Computer Science", value: "B.Tech Computer Science" },
  { label: "MBA Analytics", value: "MBA Analytics" },
  { label: "B.Arch", value: "B.Arch" },
  { label: "Pharm.D", value: "Pharm.D" },
  { label: "MBBS", value: "MBBS" },
];

export type BadgeTone =
  | "muted"
  | "primary"
  | "primary-light"
  | "success"
  | "success-light"
  | "warning"
  | "warning-light"
  | "danger"
  | "danger-light"
  | "info"
  | "info-light"
  | "gold-light";

export function getLeadSourceTone(source: string): BadgeTone {
  switch (source) {
    case "meta":
    case "instagram":
    case "linkedin":
      return "info-light";
    case "google":
    case "youtube":
      return "danger-light";
    case "website":
    case "csv_import":
      return "primary-light";
    case "whatsapp":
    case "phone":
      return "success-light";
    case "event":
    case "walk_in":
      return "warning-light";
    case "referral":
      return "gold-light";
    default:
      return "muted";
  }
}

export function getLeadStatusTone(status: string): BadgeTone {
  switch (status) {
    case "new":
      return "info";
    case "qualified":
      return "primary";
    case "assigned":
      return "warning";
    case "contacted":
      return "info-light";
    case "nurturing":
      return "warning-light";
    case "converted":
      return "success";
    case "lost":
      return "danger";
    default:
      return "info";
  }
}

export const APP_TONE_CONFIG: Record<string, { box: string; orb: string; icon: string }> = {
  primary: { box: "border-primary/20 bg-primary/5", orb: "bg-primary/20", icon: "text-primary" },
  success: { box: "border-success/20 bg-success/5", orb: "bg-success/20", icon: "text-success" },
  warning: { box: "border-warning/20 bg-warning/5", orb: "bg-warning/20", icon: "text-warning" },
  danger: { box: "border-danger/20 bg-danger/5", orb: "bg-danger/20", icon: "text-danger" },
  info: { box: "border-info/20 bg-info/5", orb: "bg-info/20", icon: "text-info" },
  gold: { box: "border-gold/20 bg-gold/5", orb: "bg-gold/20", icon: "text-gold" },
};
export const TEMPLATE_OPTIONS = [
  {
    value: "inquiry_acknowledgment",
    label: "Inquiry Acknowledgment",
  },
  {
    value: "lead_assigned",
    label: "Lead Assigned",
  },
  {
    value: "student_welcome_email",
    label: "Student Welcome Email",
  },
  {
    value: "student_welcome_whatsapp",
    label: "Student Welcome WhatsApp",
  },
  {
    value: "application_reminder",
    label: "Application Reminder",
  },
  {
    value: "document_request",
    label: "Document Request",
  },
  {
    value: "offer_released",
    label: "Offer Released",
  },
  {
    value: "offer_accepted",
    label: "Offer Accepted",
  },
  {
    value: "offer_rejected",
    label: "Offer Rejected",
  },
  {
    value: "payment_failed",
    label: "Payment Failed",
  },
  {
    value: "enrollment_confirmed",
    label: "Enrollment Confirmed",
  },
];

export const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
  { value: "Kannada", label: "Kannada" },
  { value: "Telugu", label: "Telugu" },
  { value: "Tamil", label: "Tamil" },
  { value: "Malayalam", label: "Malayalam" },
];


export const getOfferAlertConfig = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return {
        alert: "border-info text-info bg-info/10",
        icon: "text-info",
        button: "bg-info hover:bg-info/90",
      };
    case "released":
      return {
        alert: "border-primary text-primary bg-primary/10",
        icon: "text-primary",
        button: "bg-primary hover:bg-primary/90",
      };
    case "rejected":
      return {
        alert: "border-destructive text-destructive bg-destructive/10",
        icon: "text-destructive",
        button: "bg-destructive hover:bg-destructive/90",
      };
    case "expired":
      return {
        alert: "border-warning text-warning bg-warning/10",
        icon: "text-warning",
        button: "bg-warning hover:bg-warning/90",
      };
    case "accepted":
    default:
      return {
        alert: "border-success text-success bg-success/10",
        icon: "text-success",
        button: "bg-success hover:bg-success/90",
      };
  }
};

export const ROUTE_TITLE_MAP: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Lead Management",
  "/tasks": "Task Management",
  "/applications": "Applications",
  "/finance": "Finance & Payments",
  "/enrollment": "Enrollment",
  "/automation": "Automation",
  "/email-templates": "Email Library",
  "/programs": "Programs",
  "/analytics": "Analytics & BI",
  "/users": "Users",
  "/counsellor": "Counsellor",
  "/admissions": "Admission Decisions",
  "/offer": "Offers",
  "/scholarships": "Scholarships",
  "/marketing": "Marketing Automation",
  "/communications": "Communication Hub",
  "/international": "International",
  "/partners": "Channel Partners",
  "/student": "Student Portal",
  "/settings": "Settings & Roles",
  "/verification": "Verification",
  "/acharyawebsite": "Acharya Website",
};

export const getRouteTitle = (pathname: string): string => {
  if (pathname === "/" || !pathname) return "Dashboard";

  // Exact match first
  if (ROUTE_TITLE_MAP[pathname]) {
    return ROUTE_TITLE_MAP[pathname];
  }

  // Find dynamic/nested routes, sort by length descending to match most specific prefix
  const paths = Object.keys(ROUTE_TITLE_MAP).sort((a, b) => b.length - a.length);
  for (const path of paths) {
    if (path !== "/" && pathname.startsWith(path)) {
      return ROUTE_TITLE_MAP[path];
    }
  }

  // Default fallback based on last segment of the path formatted
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard";
  const lastSegment = segments[segments.length - 1];

  // If lastSegment is a UUID or dynamic parameter placeholder
  if (lastSegment.startsWith("$") || /^[0-9a-fA-F-]+$/.test(lastSegment)) {
    if (segments.length > 1) {
      const parent = segments[segments.length - 2];
      return parent.charAt(0).toUpperCase() + parent.slice(1);
    }
  }

  return lastSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

