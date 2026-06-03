import { ReactNode } from "react";
import { AppSidebar } from "@/components/global/bar/app-sidebar";
import { TopBar } from "@/components/global/bar/top-bar";
import { cn } from "@/lib/utils";

export function AppShell({ children, noPadding }: { children: ReactNode; noPadding?: boolean }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className={cn("flex-1 flex flex-col", !noPadding && "px-4 lg:px-6 py-6 lg:py-6")}>
          {children}
        </main>
      </div>
    </div>
  );
}
