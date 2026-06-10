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
    to: "/leads",
  },
  {
    label: "Lists",
    icon: ListOrdered,
    to: "/lists",
  },
  {
    label: "Task Management",
    icon: CheckSquare,
    to: "/tasks",
  },
  {
    label: "Applications",
    icon: FileText,
    to: "/applications",
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
    ],
  },
];
