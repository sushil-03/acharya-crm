import { useState } from "react";
import {
  User,
  SlidersHorizontal,
  Bell,
  Building2,
  Users,
  Puzzle,
  MessageSquare,
  Palette,
  LayoutTemplate,
  Bot,
  UserCog,
  LogOut,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUserStore } from "@/store/use-user-store";
import { useLogout } from "@/components/auth/hook/query/use-logout";
import { WidgetAppearance } from "@/components/communications/settings/widget-appearance";
import { TemplateManager } from "@/components/communications/settings/template-manager";
import { AutoResponses } from "@/components/communications/settings/auto-responses";
import { AssignmentRules } from "@/components/communications/settings/assignment-rules";

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  available: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const NAV: NavSection[] = [
  {
    label: "Account",
    items: [
      { id: "profile", label: "Profile", icon: User, available: false },
      { id: "preferences", label: "Preferences", icon: SlidersHorizontal, available: false },
      { id: "notifications", label: "Notifications", icon: Bell, available: false },
    ],
  },
  {
    label: "Workspace",
    items: [
      { id: "general", label: "General", icon: Building2, available: false },
      { id: "team", label: "Team Members", icon: Users, available: false },
      { id: "integrations", label: "Integrations", icon: Puzzle, available: false },
    ],
  },
  {
    label: "Communications",
    items: [
      { id: "chat-appearance", label: "Widget Appearance", icon: Palette, available: true },
      { id: "chat-templates", label: "Templates", icon: LayoutTemplate, available: true },
      { id: "chat-autoresponse", label: "Auto-Responses", icon: Bot, available: true },
      { id: "chat-assignment", label: "Assignment Rules", icon: UserCog, available: true },
    ],
  },
];

const CONTENT_META: Record<string, { title: string; subtitle: string }> = {
  "chat-appearance": { title: "Widget Appearance", subtitle: "Customize the look and feel of your chat widget." },
  "chat-templates": { title: "Templates & Quick Replies", subtitle: "Manage reusable message templates for faster replies." },
  "chat-autoresponse": { title: "Auto-Responses", subtitle: "Configure automatic replies for common queries." },
  "chat-assignment": { title: "Assignment Rules", subtitle: "Auto-route incoming conversations to the right counsellor." },
};

function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
      <div className="size-14 rounded-2xl bg-muted grid place-items-center">
        <SlidersHorizontal className="size-6 text-muted-foreground" />
      </div>
      <div className="font-semibold text-[15px]">Coming Soon</div>
      <p className="text-[13px] text-muted-foreground max-w-xs">
        This section is under development and will be available in an upcoming release.
      </p>
    </div>
  );
}

function ContentBody({ id }: { id: string }) {
  if (id === "chat-appearance") return <WidgetAppearance />;
  if (id === "chat-templates") return <TemplateManager />;
  if (id === "chat-autoresponse") return <AutoResponses />;
  if (id === "chat-assignment") return <AssignmentRules />;
  return <ComingSoon />;
}

export function SettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user } = useUserStore();
  const { logout } = useLogout();
  const [active, setActive] = useState("chat-appearance");

  const meta = CONTENT_META[active];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-5xl w-[95vw] h-[82vh] overflow-hidden flex flex-col [&>button]:hidden rounded-2xl">
        <div className="flex flex-1 min-h-0">
          {/* ── Left sidebar ─────────────────────────────────────────── */}
          <aside className="w-56 shrink-0 flex flex-col border-r border-border h-full" style={{ background: "oklch(var(--muted) / 0.35)" }}>
            {/* Sidebar header */}
            <div className="px-5 pt-6 pb-4 shrink-0">
              <span className="font-bold text-[16px] tracking-tight">Settings</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
              {NAV.map((section) => (
                <div key={section.label}>
                  <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 select-none">
                    {section.label}
                  </div>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = active === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => item.available && setActive(item.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
                              isActive
                                ? "bg-background text-foreground font-semibold shadow-sm"
                                : item.available
                                  ? "text-foreground/70 hover:bg-background/60 hover:text-foreground"
                                  : "text-muted-foreground/40 cursor-not-allowed"
                            }`}
                          >
                            <Icon className={`size-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                            <span className="flex-1 text-left">{item.label}</span>
                            {!item.available && (
                              <span className="text-[9px] font-medium bg-muted/80 text-muted-foreground/50 rounded-md px-1.5 py-0.5 uppercase tracking-wide">
                                Soon
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            {/* User profile at bottom */}
            <div className="px-4 py-4 border-t border-border/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-white text-[11px] font-bold shrink-0">
                  {user?.email?.substring(0, 2).toUpperCase() ?? "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold truncate leading-tight">{user?.email ?? "User"}</div>
                  <div className="text-[11px] text-muted-foreground capitalize truncate leading-tight mt-0.5">
                    {user?.role?.replace(/_/g, " ") ?? ""}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* Content header */}
            <div className="flex items-start justify-between gap-4 px-8 pt-6 pb-4 border-b border-border shrink-0">
              <div>
                <h2 className="font-bold text-[20px] leading-tight">
                  {meta?.title ?? "Settings"}
                </h2>
                {meta?.subtitle && (
                  <p className="text-[13px] text-muted-foreground mt-0.5">{meta.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => { logout(); onOpenChange(false); }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-[12px] font-medium hover:bg-muted transition-colors text-muted-foreground"
                >
                  <LogOut className="size-3.5" /> Log out
                </button>
                <button
                  onClick={() => onOpenChange(false)}
                  className="size-8 grid place-items-center rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <ContentBody id={active} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
