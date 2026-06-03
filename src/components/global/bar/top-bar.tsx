import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Building2,
  HelpCircle,
  LogOut,
  Settings,
  User as UserIcon,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react";
import { campuses, notifications } from "@/lib/mock-data";
import { Button } from "../../ui/button";
import { ThemeToggle } from "../theme-toggle";
import { useUserStore } from "@/store/use-user-store";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { useTheme } from "next-themes";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useLogout } from "@/components/auth/hook/query/use-logout";
import { getRouteTitle } from "@/lib/constant";
import { GlobalSearch } from "./global-search";
import ItemButton from "./item-button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AppSidebar } from "./app-sidebar";

export function TopBar() {
  const { user } = useUserStore();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const { logout } = useLogout();

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border w-full">
      <div className="flex items-center gap-3 px-4 lg:px-6 h-12 w-full">
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted">
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-none [&>button]:hidden">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <AppSidebar className="flex border-none w-full h-full" />
            </SheetContent>
          </Sheet>
          <img src="/brand/logo.png" alt="Logo" className="size-7 object-contain" />
        </div>

        <div className="hidden lg:flex flex-1 max-w-xl">
          <GlobalSearch />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* <div className="relative">
            <button className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-muted px-3 h-8 text-[13px] font-medium">
              <Building2 className="size-4 text-primary" />
              {campus.name}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </div> */}

          {/* <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="size-9 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground relative"
            >
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger ring-2 ring-background" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-96 rounded-xl bg-popover border border-border shadow-elev-3 overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="font-semibold text-sm">Notifications</div>
                  <button className="text-[11px] text-primary font-medium">Mark all read</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="px-4 py-3 border-b border-border/60 hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`mt-1 size-2 rounded-full ${
                            n.type === "lead"
                              ? "bg-success"
                              : n.type === "ai"
                                ? "bg-primary"
                                : n.type === "payment"
                                  ? "bg-gold"
                                  : "bg-warning"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium">{n.title}</div>
                          <div className="text-[12px] text-muted-foreground truncate">{n.desc}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{n.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div> */}
          <button className="size-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-danger ring-2 ring-background" />
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button className="size-9 flex items-center justify-center rounded-full hover:bg-muted">
                <div className="size-7 rounded-full bg-gradient-brand grid place-items-center text-white text-[11px] font-bold">
                  {user?.email?.substring(0, 2).toUpperCase() || "DR"}
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-1">
              <div className="px-2.5 py-2 border-b border-border mb-1">
                <div className="text-xs font-semibold text-foreground truncate">
                  {user?.email || ""}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {user?.role
                    ?.split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ") || ""}
                </div>
              </div>
              <div className="space-y-1">
                <ItemButton
                  icon={<UserIcon className="size-4 text-muted-foreground" />}
                  buttonText="Profile"
                  type="coming_soon"
                />
                <ItemButton
                  icon={<Settings className="size-4 text-muted-foreground" />}
                  buttonText="Preferences"
                  type="coming_soon"
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
                {/* <div className="h-px bg-border my-1" /> */}
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
    </header>
  );
}
