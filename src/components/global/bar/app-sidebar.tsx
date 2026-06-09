import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Settings,
  LogOut,
  Sun,
  Moon,
  User,
  MoreHorizontal,
} from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLogout } from "@/components/auth/hook/query/use-logout";
import { useTheme } from "next-themes";
import ItemButton from "./item-button";
import { SettingsModal } from "@/components/settings/settings-modal";
import { navItems, NavigationItem } from "./sidebar-items";

interface SidebarLinkProps {
  item: NavigationItem;
  path: string;
  isCollapsed: boolean;
  onClick?: () => void;
}

function SidebarLink({ item, path, isCollapsed, onClick }: SidebarLinkProps) {
  const Icon = item.icon;
  const active = item.to && (path === item.to || (item.to !== "/" && path.startsWith(item.to)));

  if (isCollapsed) {
    return (
      <li className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={item.to}
              onClick={onClick}
              className={cn(
                "group flex items-center justify-center rounded-lg size-9 transition-colors duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4.5 transition-transform duration-200 group-hover:scale-105" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span className="font-medium">{item.label}</span>
          </TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return (
    <li>
      <Link
        to={item.to}
        onClick={onClick}
        className={cn(
          "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
            active
              ? "text-sidebar-accent-foreground"
              : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground",
          )}
        />
        <span className="flex-1 truncate">{item.label}</span>
      </Link>
    </li>
  );
}

interface SidebarSubmenuProps {
  item: NavigationItem;
  path: string;
  isCollapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onExpand: () => void;
}

function SidebarSubmenu({
  item,
  path,
  isCollapsed,
  isOpen,
  onToggle,
  onExpand,
}: SidebarSubmenuProps) {
  const Icon = item.icon;
  const hasActiveChild = item.items?.some(
    (child) => path === child.to || (child.to !== "/" && path.startsWith(child.to)),
  );

  if (isCollapsed) {
    return (
      <li className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onExpand}
              className={cn(
                "group flex items-center justify-center rounded-lg size-9 transition-colors duration-200 cursor-pointer",
                hasActiveChild
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4.5 transition-transform duration-200 group-hover:scale-105" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span className="font-medium">{item.label} (Expand)</span>
          </TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return (
    <li className="space-y-0.5">
      <button
        onClick={onToggle}
        className={cn(
          "w-full group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200 text-left cursor-pointer",
          hasActiveChild
            ? "text-sidebar-accent-foreground"
            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0 transition-transform duration-200 group-hover:scale-105 text-sidebar-accent-foreground",
          )}
        />
        <span className="flex-1 truncate">{item.label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 text-sidebar-foreground/50 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen && (
        <ul className="pl-9 pr-1 py-0.5 space-y-1 border-l border-sidebar-border ml-3">
          {item.items?.map((child) => {
            const childActive =
              path === child.to || (child.to !== "/" && path.startsWith(child.to));
            return (
              <li key={child.to}>
                <Link
                  to={child.to}
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium transition-colors duration-200",
                    childActive
                      ? "text-sidebar-accent-foreground bg-sidebar-accent/30"
                      : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/20",
                  )}
                >
                  <span className="flex-1 truncate">{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export function AppSidebar({
  className,
  collapsible = true,
}: {
  className?: string;
  collapsible?: boolean;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const user = useUserStore((state) => state.user);
  const { logout } = useLogout();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(() => {
    const initialOpenStates: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.items) {
        const hasActiveChild = item.items.some(
          (child) => path === child.to || (child.to !== "/" && path.startsWith(child.to)),
        );
        if (hasActiveChild) {
          initialOpenStates[item.label] = true;
        }
      }
    });
    return initialOpenStates;
  });

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar_collapsed") === "true";
    }
    return false;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", String(isCollapsed));
  }, [isCollapsed]);

  // Auto-expand submenus if a child item is active
  useEffect(() => {
    const initialOpenStates: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.items) {
        const hasActiveChild = item.items.some(
          (child) => path === child.to || (child.to !== "/" && path.startsWith(child.to)),
        );
        if (hasActiveChild) {
          initialOpenStates[item.label] = true;
        }
      }
    });
    setOpenSubmenus((prev) => ({ ...prev, ...initialOpenStates }));
  }, [path]);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isActuallyCollapsed = isCollapsed && collapsible;
  const isCounsellor = user?.role === "counsellor" || user?.role === "councellor";

  // Filter items according to role
  const filteredItems = navItems.filter((item) => {
    if (isCounsellor && item.isAdminOnly) {
      return false;
    }
    return true;
  });

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0 transition-all duration-300 ease-in-out z-30",
          isActuallyCollapsed ? "w-[56px]" : "w-60",
          className,
        )}
      >
        {/* Header Branding */}
        <div
          className={cn(
            "px-4 h-12.25 flex items-center border-b border-sidebar-border shrink-0 select-none",
            isActuallyCollapsed && "justify-center px-0",
          )}
        >
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-2.5",
              isActuallyCollapsed && "justify-center w-full",
            )}
          >
            <img
              src="/brand/logo.png"
              alt="Acharya Logo"
              className="size-8 rounded-lg object-contain bg-background p-1 border border-border/10 shadow-sm shrink-0"
            />
            {!isActuallyCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-foreground text-sm leading-none tracking-wide whitespace-nowrap overflow-hidden">
                  ACHARYA ONE
                </span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-[0.16em] mt-0.5 leading-none">
                  Admissions CRM
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation list */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto py-4 space-y-1 scrollbar-thin",
            isActuallyCollapsed ? "px-0" : "px-3",
          )}
        >
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              if (item.items?.length) {
                return (
                  <SidebarSubmenu
                    key={item.label}
                    item={item}
                    path={path}
                    isCollapsed={isActuallyCollapsed}
                    isOpen={!!openSubmenus[item.label]}
                    onToggle={() => toggleSubmenu(item.label)}
                    onExpand={() => setIsCollapsed(false)}
                  />
                );
              }

              return (
                <SidebarLink
                  key={item.label}
                  item={item}
                  path={path}
                  isCollapsed={isActuallyCollapsed}
                />
              );
            })}
          </ul>
        </nav>

        {/* Footer & User Profile Block */}
        <div
          className={cn(
            "p-3 border-t border-sidebar-border space-y-1.5 shrink-0 bg-sidebar/85 backdrop-blur-md",
            isActuallyCollapsed && "px-0 py-3",
          )}
        >
          {/* Inbox / Communications (Commented out for now) */}
          {/* 
          {isActuallyCollapsed ? (
            <div className="flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/communications"
                    className={cn(
                      "group flex items-center justify-center rounded-lg size-9 transition-colors duration-200",
                      path.startsWith("/communications")
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Mail className="size-4.5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span className="font-medium">Inbox</span>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <Link
              to="/communications"
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200",
                path.startsWith("/communications")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <Mail className="size-4 text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground transition-colors" />
              <span className="flex-1 truncate">Inbox</span>
            </Link>
          )}
          */}

          {/* Settings trigger */}
          {isActuallyCollapsed ? (
            <div className="flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="group flex items-center justify-center rounded-lg size-9 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 cursor-pointer"
                  >
                    <Settings className="size-4.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span className="font-medium">Settings</span>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-full group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-left text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 cursor-pointer"
            >
              <Settings className="size-4 text-sidebar-foreground group-hover:text-sidebar-accent-foreground transition-colors" />
              <span className="flex-1 truncate">Settings</span>
            </button>
          )}

          {/* Collapse sidebar toggle button (if collapsible is true) */}
          {collapsible && (
            <div className="">
              {isActuallyCollapsed ? (
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setIsCollapsed(false)}
                        className="group flex items-center justify-center rounded-lg size-9 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 cursor-pointer"
                      >
                        <ChevronRight className="size-4.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Expand Sidebar</TooltipContent>
                  </Tooltip>
                </div>
              ) : (
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="w-full group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-left text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 cursor-pointer"
                >
                  <ChevronLeft className="size-4 text-sidebar-foreground transition-transform group-hover:-translate-x-0.5 group-hover:text-sidebar-accent-foreground" />
                  <span className="flex-1 truncate">Collapse Sidebar</span>
                </button>
              )}
            </div>
          )}

          {/* User Profile Popover */}
          <div className="pt-2 border-t border-sidebar-border">
            <Popover>
              <PopoverTrigger asChild>
                {isActuallyCollapsed ? (
                  <button className="w-full flex justify-center cursor-pointer hover:opacity-90 transition-opacity">
                    <div className="size-8.5 rounded-lg bg-gradient-aurora flex items-center justify-center text-white text-[10px] font-bold shadow-xs shrink-0 select-none">
                      {user?.email?.substring(0, 2).toUpperCase() || "DR"}
                    </div>
                  </button>
                ) : (
                  <button className="w-full flex items-center gap-2 p-1 rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 cursor-pointer text-left">
                    <div className="size-8.5 rounded-lg bg-gradient-aurora flex items-center justify-center text-white text-[11px] font-bold shadow-sm shrink-0 select-none">
                      {user?.email?.substring(0, 2).toUpperCase() || "DR"}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="font-semibold text-sidebar-accent-foreground text-[12.5px] truncate leading-tight">
                        {user?.email?.split("@")[0] || "User"}
                      </span>
                      <span className="text-[10px] text-sidebar-foreground/60 truncate capitalize">
                        {user?.role?.replace("_", " ") || ""}
                      </span>
                    </div>
                    <MoreHorizontal className="size-4 text-sidebar-foreground/45 group-hover:text-sidebar-accent-foreground shrink-0" />
                  </button>
                )}
              </PopoverTrigger>
              <PopoverContent align="start" side="right" className="w-56 p-1 z-40">
                <div className="px-2.5 py-2 border-b border-border mb-1">
                  <div className="text-xs font-semibold text-foreground truncate">
                    {user?.email || ""}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                    {user?.role?.replace("_", " ") || ""}
                  </div>
                </div>
                <div className="space-y-1">
                  <ItemButton
                    icon={<User className="size-4 text-muted-foreground" />}
                    buttonText="Profile"
                    type="coming_soon"
                  />
                  <ItemButton
                    onClick={() => setSettingsOpen(true)}
                    icon={<Settings className="size-4 text-muted-foreground" />}
                    buttonText="Settings"
                  />
                  <ItemButton
                    onClick={() => setTheme(currentTheme === "light" ? "dark" : "light")}
                    icon={
                      mounted && currentTheme === "light" ? (
                        <Moon className="size-4 text-muted-foreground" />
                      ) : (
                        <Sun className="size-4 text-muted-foreground" />
                      )
                    }
                    buttonText={mounted && currentTheme === "light" ? "Dark Mode" : "Light Mode"}
                  />
                  <div className="h-px bg-border my-1" />
                  <ItemButton
                    onClick={() => {
                      logout();
                    }}
                    icon={<LogOut className="size-4" />}
                    buttonText="Log out"
                    variant="light-destructive"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </aside>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </TooltipProvider>
  );
}
