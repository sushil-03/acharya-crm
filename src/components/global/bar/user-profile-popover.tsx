import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Settings, LogOut, Sun, Moon, User, MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUserStore } from "@/store/use-user-store";
import { useLogout } from "@/components/auth/hook/query/use-logout";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UserProfilePopoverProps {
  isCollapsed: boolean;
  isCounsellor: boolean;
}

export function UserProfilePopover({ isCollapsed, isCounsellor }: UserProfilePopoverProps) {
  const user = useUserStore((state) => state.user);
  const { logout } = useLogout();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const initials = user?.email?.substring(0, 2).toUpperCase() || "DR";
  const displayName = user?.email?.split("@")[0] || "User";
  const role = user?.role?.replace(/_/g, " ") || "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        {isCollapsed ? (
          <button className="w-full flex justify-center cursor-pointer hover:opacity-90 transition-opacity">
            <div className="size-8.5 rounded-lg bg-gradient-aurora flex items-center justify-center text-white text-[10px] font-bold shadow-xs shrink-0 select-none">
              {initials}
            </div>
          </button>
        ) : (
          <button className="w-full flex items-center gap-2 p-1 rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 cursor-pointer text-left group">
            <div className="size-8.5 rounded-lg bg-gradient-aurora flex items-center justify-center text-white text-[11px] font-bold shadow-sm shrink-0 select-none">
              {initials}
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="font-semibold text-sidebar-accent-foreground text-[12.5px] truncate leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-sidebar-foreground/60 truncate capitalize">
                {role}
              </span>
            </div>
            <MoreHorizontal className="size-4 text-sidebar-foreground/45 shrink-0" />
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="end"
        sideOffset={12}
        alignOffset={4}
        className="w-56 p-0 z-40 overflow-hidden shadow-lg"
      >
        {/* Compact user header */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border">
          <div className="size-8 rounded-lg bg-gradient-aurora flex items-center justify-center text-white text-[11px] font-bold shrink-0 select-none">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-foreground truncate capitalize">{displayName}</p>
            <p className="text-[10.5px] text-muted-foreground truncate">{user?.email || ""}</p>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-1">
          <MenuItem
            icon={<User className="size-3.5" />}
            label="Profile"
            badge="Soon"
            onClick={() => toast.message("Coming soon")}
          />
          <MenuItem
            icon={<Settings className="size-3.5" />}
            label="Settings"
            onClick={() => navigate({ to: isCounsellor ? "/chat-settings" : "/settings" })}
          />
          <MenuItem
            icon={
              mounted && currentTheme === "light" ? (
                <Moon className="size-3.5" />
              ) : (
                <Sun className="size-3.5" />
              )
            }
            label={mounted && currentTheme === "light" ? "Dark Mode" : "Light Mode"}
            onClick={() => setTheme(currentTheme === "light" ? "dark" : "light")}
          />
        </div>

        <div className="border-t border-border py-1">
          <MenuItem
            icon={<LogOut className="size-3.5" />}
            label="Log out"
            destructive
            onClick={() => logout()}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  destructive?: boolean;
  onClick?: () => void;
}

function MenuItem({ icon, label, badge, destructive, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-150 cursor-pointer text-left",
        destructive
          ? "text-destructive hover:bg-destructive/8"
          : "text-foreground/80 hover:bg-muted hover:text-foreground",
      )}
    >
      <span className={cn("shrink-0", destructive ? "text-destructive" : "text-muted-foreground")}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          {badge}
        </span>
      )}
    </button>
  );
}
