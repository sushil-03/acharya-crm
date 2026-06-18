import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FileText,
  Wallet,
  Zap,
  ListOrdered,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  icon: React.ComponentType<any>;
  to?: string;
  badge?: string | number;
  isAdminOnly?: boolean;
  items?: {
    label: string;
    to: string;
    badge?: string | number;
  }[];
}

export const navItems: NavigationItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/dashboard",
  },
  {
    label: "Lead Management",
    icon: Users,
    items: [
      { label: "Smart Leads", to: "/leads/smart" },
      { label: "Leads", to: "/leads" },
      { label: "Application", to: "/applications" },
      { label: "Activities", to: "/activities" },
    ],
  },
  {
    label: "Lists",
    icon: ListOrdered,
    to: "/lists",
  },
  {
    label: "Finance & Payments",
    icon: Wallet,
    to: "/finance",
  },
  {
    label: "Automation",
    icon: Zap,
    isAdminOnly: true,
    items: [
      { label: "Flows", to: "/automation" },
      { label: "Email Library", to: "/email-templates" },
      { label: "Email Campaigns", to: "/email-campaigns" },
    ],
  },
];
