import { ReactNode } from "react";
import { AppSidebar } from "@/components/global/bar/app-sidebar";
import { TopBar } from "@/components/global/bar/top-bar";
import { ChatWidget } from "@/components/communications/chat-widget";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  noPadding,
  className,
}: {
  children: ReactNode;
  noPadding?: boolean;
  className?: string;
}) {
  const isHScreen = className?.includes("h-screen");
  return (
    <div className={cn("flex min-h-screen w-full bg-slate-50/50 dark:bg-zinc-950", className)}>
      <AppSidebar />
      <div className={cn("flex-1 min-w-0 flex flex-col", isHScreen && "h-screen overflow-hidden")}>
        <TopBar />
        <main
          className={cn(
            "flex-1 flex flex-col",
            isHScreen && "overflow-hidden",
            !noPadding && "px-4 lg:px-6 py-4 ",
          )}
        >
          {children}
        </main>
      </div>
      {/* <ChatWidget /> */}
    </div>
  );
}
