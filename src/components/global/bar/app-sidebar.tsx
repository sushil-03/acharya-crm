import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Headphones,
  FileText,
  ShieldCheck,
  GraduationCap,
  Award,
  Wallet,
  UserCheck,
  Megaphone,
  MessageSquare,
  Globe2,
  Handshake,
  BarChart3,
  User,
  Settings,
  Settings2,
  Sparkles,
  ChevronRight,
  Zap,
  CheckSquare,
  Mail,
} from "lucide-react";
import { InstantCta } from "./instant-cta";
import { useUserStore } from "@/store/use-user-store";

const groups = [
  {
    label: "Intelligence",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      // { to: "/programs", label: "Programs", icon: GraduationCap },
      // { to: "/analytics", label: "Analytics & BI", icon: BarChart3 },
      // { to: "/users", label: "Users", icon: Users },
      // { to: "/counsellor", label: "Counsellor", icon: Headphones },
    ],
  },
  {
    label: "Admissions Pipeline",
    items: [
      { to: "/leads", label: "Lead Management", icon: Users },
      { to: "/tasks", label: "Task Management", icon: CheckSquare },
      // { to: "/distribution", label: "Lead Distribution", icon: GitBranch },
      { to: "/applications", label: "Applications", icon: FileText },
      { to: "/finance", label: "Finance & Payments", icon: Wallet },

      // { to: "/verification", label: "Verification", icon: ShieldCheck },
      // { to: "/admissions", label: "Admission Decisions", icon: GraduationCap },
      // { to: "/offer", label: "Offers", icon: FileText },
      // { to: "/scholarships", label: "Scholarships", icon: Award },
    ],
  },
  // {
  //   label: "Conversion",
  //   items: [
  //     { to: "/enrollment", label: "Enrollment", icon: UserCheck },
  //   ],
  // },
  // {
  //   label: "Growth",
  //   items: [
  //     { to: "/chat-settings", label: "Chat Settings", icon: Settings2 },
  //   ],
  // },
  {
    label: "Automation",
    items: [
      { to: "/automation", label: "Automation", icon: Zap },
      { to: "/email-templates", label: "Email Library", icon: Mail },
    ],
  },
  // {
  //   label: "Experience",
  //   items: [
  //     { to: "/student", label: "Student Portal", icon: User },
  //     { to: "/settings", label: "Settings & Roles", icon: Settings },
  //   ],
  // },
];

export function AppSidebar({ className }: { className?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const user = useUserStore((state) => state.user);

  const filteredGroups = groups
    .map((g) => {
      if (user?.role === "counsellor" || user?.role === "councellor") {
        if (g.label === "Intelligence") {
          return {
            ...g,
            items: g.items.filter((item) => item.label === "Dashboard"),
          };
        }
        if (g.label === "Admissions Pipeline") {
          return {
            ...g,
            items: g.items.filter((item) => item.label !== "Scholarships"),
          };
        }
        return null;
      }
      // If super_admin or other roles, return all
      return g;
    })
    .filter(Boolean) as typeof groups;

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0",
        className,
      )}
    >
      <div className="px-3 py-2 ">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img
            src="/brand/logo.png"
            alt=""
            className="size-10 shrink-0 rounded-sm object-contain"
          />
          <div className="flex flex-col">
            <div className="font-display font-bold text-sidebar-foreground text-[15px]">
              ACHARYA <span className="text-gold">ONE</span>
            </div>
            <span className="text-[10px] tracking-[0.18em] text-sidebar-foreground/60 uppercase">
              Admissions CRM
            </span>
          </div>
        </Link>
      </div>
      {/* <InstantCta /> */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {filteredGroups.map((g) => (
          <div key={g.label} className="mb-5">
            <div className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45">
              {g.label}
            </div>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = path === it.to || (it.to !== "/" && path.startsWith(it.to));
                const Icon = it.icon;
                return (
                  <li key={it.to}>
                    <Link
                      to={it.to}
                      className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-elev-1"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <Icon className={`size-4 ${active ? "text-sidebar-primary" : ""}`} />
                      <span className="flex-1">{it.label}</span>
                      {/* {active && <ChevronRight className="size-3.5 opacity-70" />} */}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      {/* <div className="px-3 py-3 border-t border-sidebar-border">
        <div className="rounded-xl bg-gradient-brand p-3 text-white">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider opacity-90">
            <Sparkles className="size-3.5" /> AI Copilot
          </div>
          <div className="mt-1 text-[12px] opacity-85">
            8 leads need attention. 3 scholarships pending.
          </div>
          <Button className="mt-2 w-full text-[12px]">Open Acharya AI →</Button>
        </div>
      </div> */}
    </aside>
  );
}
