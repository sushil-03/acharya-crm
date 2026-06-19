import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  ArrowLeft,
  UserCog,
  MessageSquare,
  Ticket,
  LayoutGrid,
} from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NavigationItem } from "./sidebar-items";
import { GlobalSearch } from "./global-search";
import { UserProfilePopover } from "./user-profile-popover";
import { useGetMySubmenus } from "@/hooks/query/use-get-my-submenus";
import type { NavMenu, NavModule } from "@/types/nav";
import { Icon } from "@iconify/react";
import { navItems } from "./sidebar-items";

const DYNAMIC_NAV = import.meta.env.VITE_DYNAMIC_NAV === "true";

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
  const activeChildIdx =
    item.items?.findIndex(
      (child) =>
        path === child.to ||
        (child.to !== "/" &&
          path.startsWith(child.to + "/") &&
          !item.items?.some(
            (otherChild) => otherChild.to !== child.to && path.startsWith(otherChild.to),
          )),
    ) ?? -1;
  const hasActiveChild = activeChildIdx !== -1;

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
          className={cn("size-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ")}
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
        <ul className="relative ml-[20px] pl-0 pr-1 py-1 space-y-1">
          {item.items?.map((child, idx) => {
            const childActive =
              path === child.to ||
              (child.to !== "/" &&
                path.startsWith(child.to + "/") &&
                !item.items?.some(
                  (otherChild) => otherChild.to !== child.to && path.startsWith(otherChild.to),
                ));
            const isFirst = idx === 0;
            const isLast = idx === (item.items?.length || 0) - 1;

            return (
              <li key={child.to} className="relative pl-5">
                {/* Connection Lines */}
                {/* 1. Straight vertical line - Top segment (above the branch) */}
                <div
                  className={cn(
                    "absolute left-0 w-px pointer-events-none transition-colors duration-200",
                    isFirst ? "-top-2.5 h-[20px]" : "top-0 h-2.5",
                    activeChildIdx >= idx ? "bg-sidebar-accent-foreground" : "bg-border",
                  )}
                />

                {/* 2. Straight vertical line - Bottom segment (below the branch) */}
                {!isLast && (
                  <div
                    className={cn(
                      "absolute left-0 top-2.5 bottom-[-5px] w-px pointer-events-none transition-colors duration-200",
                      activeChildIdx > idx ? "bg-sidebar-accent-foreground" : "bg-border",
                    )}
                  />
                )}

                {/* 3. Curved branch bend to the child */}
                <svg
                  className={cn(
                    "absolute left-0 top-0 w-3.5 h-3.5 pointer-events-none transition-colors duration-200",
                    childActive ? "text-sidebar-accent-foreground" : "text-border",
                  )}
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M 0.5 8.5 A 5 5 0 0 0 5.5 13.5 L 14 13.5"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </svg>

                <Link
                  to={child.to}
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-200",
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

  const isSettingsPath =
    path.startsWith("/settings") ||
    path.startsWith("/chat-settings") ||
    path.startsWith("/coupons");
  const { data: navTree = [] } = useGetMySubmenus(DYNAMIC_NAV && !!user);

  // Flatten all menus from all modules (only used when DYNAMIC_NAV is on)
  const allMenus: NavMenu[] = navTree.flatMap((mod: NavModule) => mod.menus);

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(() => {
    const initialOpenStates: Record<string, boolean> = {};
    if (DYNAMIC_NAV) {
      allMenus.forEach((menu) => {
        const hasActiveChild = menu.subMenus.some(
          (sub) => path === sub.path || (sub.path !== "/" && path.startsWith(sub.path)),
        );
        if (hasActiveChild) initialOpenStates[String(menu.id)] = true;
      });
    } else {
      navItems.forEach((item) => {
        if (item.items) {
          const hasActiveChild = item.items.some(
            (child) => path === child.to || (child.to !== "/" && path.startsWith(child.to)),
          );
          if (hasActiveChild) initialOpenStates[item.label] = true;
        }
      });
    }
    return initialOpenStates;
  });

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar_collapsed") === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", String(isCollapsed));
  }, [isCollapsed]);

  // Auto-expand menus when active path changes
  useEffect(() => {
    const updates: Record<string, boolean> = {};
    if (DYNAMIC_NAV) {
      allMenus.forEach((menu) => {
        const hasActiveChild = menu.subMenus.some(
          (sub) => path === sub.path || (sub.path !== "/" && path.startsWith(sub.path)),
        );
        if (hasActiveChild) updates[String(menu.id)] = true;
      });
    } else {
      navItems.forEach((item) => {
        if (item.items) {
          const hasActiveChild = item.items.some(
            (child) => path === child.to || (child.to !== "/" && path.startsWith(child.to)),
          );
          if (hasActiveChild) updates[item.label] = true;
        }
      });
    }
    if (Object.keys(updates).length > 0) {
      setOpenSubmenus((prev) => ({ ...prev, ...updates }));
    }
  }, [path, navTree]);

  const isActuallyCollapsed = isCollapsed && collapsible;
  const isCounsellor = user?.role === "counsellor" || user?.role === "councellor";

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "group/sidebar flex flex-col shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0 transition-all duration-300 ease-in-out z-30",
          isActuallyCollapsed ? "w-[56px]" : "w-60",
          className,
        )}
      >
        {/* Header Branding — hidden on settings pages */}
        <div
          className={cn(
            "px-3 h-12.25 flex items-center gap-1 border-b border-sidebar-border shrink-0 select-none",
            isActuallyCollapsed && "justify-center px-0",
            isSettingsPath && "hidden",
          )}
        >
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-2 flex-1 min-w-0",
              isActuallyCollapsed && "justify-center flex-none",
            )}
          >
            <img
              src="/brand/logo.png"
              alt="Acharya Logo"
              className="size-8 rounded-md object-contain bg-background p-0.5 border border-border/10 shadow-sm shrink-0"
            />
            {!isActuallyCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-foreground text-[14px] leading-none tracking-wide truncate">
                  ACHARYA ONE
                </span>
                {/* <span className="text-[9px] text-muted-foreground uppercase tracking-[0.16em] mt-0.5 leading-none">
                  Admissions CRM
                </span> */}
              </div>
            )}
          </Link>

          {!isActuallyCollapsed && (
            <div className="flex items-center gap-0.5 shrink-0">
              <GlobalSearch iconOnly />
              {collapsible && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsCollapsed(true)}
                      className="group flex items-center justify-center rounded-lg size-7 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 cursor-pointer"
                    >
                      <PanelLeftClose className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <span className="font-medium">Collapse sidebar</span>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>

        {/* Collapsed: search icon below logo */}
        {isActuallyCollapsed && !isSettingsPath && (
          <div className="flex justify-center pt-2 shrink-0">
            <GlobalSearch isCollapsed />
          </div>
        )}

        {/* Navigation list */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto py-4 space-y-1 scrollbar-thin",
            isActuallyCollapsed ? "px-0" : "px-3",
          )}
        >
          <ul className="space-y-1">
            {isSettingsPath ? (
              <>
                <SidebarLink
                  item={{
                    label: isActuallyCollapsed ? "Back" : "Back to Dashboard",
                    icon: ArrowLeft,
                    to: "/dashboard",
                  }}
                  path={path}
                  isCollapsed={isActuallyCollapsed}
                />
                <div className="my-2 border-t border-sidebar-border/50" />
                {!isCounsellor && (
                  <SidebarLink
                    item={{
                      label: "Users & Roles",
                      icon: UserCog,
                      to: "/settings",
                    }}
                    path={path}
                    isCollapsed={isActuallyCollapsed}
                  />
                )}
                <SidebarLink
                  item={{
                    label: "Chat Widget",
                    icon: MessageSquare,
                    to: "/chat-settings",
                  }}
                  path={path}
                  isCollapsed={isActuallyCollapsed}
                />
                {!isCounsellor && (
                  <SidebarLink
                    item={{
                      label: "Coupons",
                      icon: Ticket,
                      to: "/coupons",
                    }}
                    path={path}
                    isCollapsed={isActuallyCollapsed}
                  />
                )}
              </>
            ) : !DYNAMIC_NAV ? (
              // ── Static nav (VITE_DYNAMIC_NAV=false) ──
              navItems
                .filter((item) => !item.isAdminOnly || !isCounsellor)
                .map((item) => {
                  if (!item.items) {
                    return (
                      <SidebarLink
                        key={item.label}
                        item={item}
                        path={path}
                        isCollapsed={isActuallyCollapsed}
                      />
                    );
                  }
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
                })
            ) : allMenus.length === 0 ? (
              !isActuallyCollapsed && (
                <li className="px-3 py-6 flex flex-col items-center gap-2 text-center">
                  <LayoutGrid className="size-8 text-sidebar-foreground/20" />
                  <p className="text-[11px] text-sidebar-foreground/40">
                    No navigation configured
                  </p>
                </li>
              )
            ) : (
              allMenus.map((menu) => {
                const menuKey = String(menu.id);
                const isOpen = !!openSubmenus[menuKey];
                const hasActiveChild = menu.subMenus.some(
                  (sub) => path === sub.path || (sub.path !== "/" && path.startsWith(sub.path)),
                );

                if (menu.subMenus.length === 0) return null;

                if (menu.subMenus.length === 1) {
                  const sub = menu.subMenus[0];
                  const active = path === sub.path || (sub.path !== "/" && path.startsWith(sub.path));
                  return (
                    <li key={menu.id}>
                      <Link
                        to={sub.path}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <span className="flex-1 truncate">{sub.name}</span>
                      </Link>
                    </li>
                  );
                }

                if (isActuallyCollapsed) {
                  return (
                    <li key={menu.id} className="flex justify-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setIsCollapsed(false)}
                            className={cn(
                              "group flex items-center justify-center rounded-lg size-9 transition-colors duration-200 cursor-pointer",
                              hasActiveChild
                                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs"
                                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                            )}
                          >
                            <Icon icon={menu.icon || "lucide:layout-grid"} className="size-4.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <span className="font-medium">{menu.name} (Expand)</span>
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  );
                }

                return (
                  <li key={menu.id} className="space-y-0.5">
                    <button
                      onClick={() => toggleSubmenu(menuKey)}
                      className={cn(
                        "w-full group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200 text-left cursor-pointer",
                        hasActiveChild
                          ? "text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon icon={menu.icon || "lucide:layout-grid"} className="size-4 shrink-0" />
                      <span className="flex-1 truncate">{menu.name}</span>
                      <ChevronDown
                        className={cn(
                          "size-3.5 text-sidebar-foreground/50 transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {isOpen && (
                      <ul className="relative ml-[20px] pl-0 pr-1 py-1 space-y-1">
                        {menu.subMenus.map((sub, idx) => {
                          const subActive =
                            path === sub.path ||
                            (sub.path !== "/" && path.startsWith(sub.path));
                          const activeIdx = menu.subMenus.findIndex(
                            (s) => path === s.path || (s.path !== "/" && path.startsWith(s.path)),
                          );
                          const isFirst = idx === 0;
                          const isLast = idx === menu.subMenus.length - 1;

                          return (
                            <li key={sub.id} className="relative pl-5">
                              <div
                                className={cn(
                                  "absolute left-0 w-px pointer-events-none transition-colors duration-200",
                                  isFirst ? "-top-2.5 h-[20px]" : "top-0 h-2.5",
                                  activeIdx >= idx ? "bg-sidebar-accent-foreground" : "bg-border",
                                )}
                              />
                              {!isLast && (
                                <div
                                  className={cn(
                                    "absolute left-0 top-2.5 bottom-[-5px] w-px pointer-events-none transition-colors duration-200",
                                    activeIdx > idx ? "bg-sidebar-accent-foreground" : "bg-border",
                                  )}
                                />
                              )}
                              <svg
                                className={cn(
                                  "absolute left-0 top-0 w-3.5 h-3.5 pointer-events-none transition-colors duration-200",
                                  subActive ? "text-sidebar-accent-foreground" : "text-border",
                                )}
                                viewBox="0 0 14 14"
                                fill="none"
                              >
                                <path
                                  d="M 0.5 8.5 A 5 5 0 0 0 5.5 13.5 L 14 13.5"
                                  stroke="currentColor"
                                  strokeWidth="1"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <Link
                                to={sub.path}
                                className={cn(
                                  "group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-200",
                                  subActive
                                    ? "text-sidebar-accent-foreground bg-sidebar-accent/30"
                                    : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/20",
                                )}
                              >
                                <span className="flex-1 truncate">{sub.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })
            )}
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
          {/* {!isSettingsPath &&
            (isActuallyCollapsed ? (
              <div className="flex justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to={isCounsellor ? "/chat-settings" : "/settings"}
                      className={cn(
                        "group flex items-center justify-center rounded-lg size-9 transition-colors duration-200",
                        path.startsWith("/settings") || path.startsWith("/chat-settings")
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Settings className="size-4.5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <span className="font-medium">Settings</span>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <Link
                to={isCounsellor ? "/chat-settings" : "/settings"}
                className={cn(
                  "w-full group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-left transition-colors duration-200",
                  path.startsWith("/settings") || path.startsWith("/chat-settings")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )}
              >
                <Settings
                  className={cn(
                    "size-4 transition-colors",
                    path.startsWith("/settings") || path.startsWith("/chat-settings")
                      ? "text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground",
                  )}
                />
                <span className="flex-1 truncate">Settings</span>
              </Link>
            ))} */}

          {/* Expand sidebar button (only shown when collapsed) */}
          {collapsible && isActuallyCollapsed && (
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
          )}

          {/* User Profile Popover */}
          <UserProfilePopover isCollapsed={isActuallyCollapsed} isCounsellor={isCounsellor} />
        </div>
      </aside>
    </TooltipProvider>
  );
}
