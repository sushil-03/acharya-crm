import React, { useRef, useState, useEffect, useCallback } from "react";
import { SmartViewConfig } from "./types";
import { Plus, ChevronLeft, ChevronRight, PanelTop, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartViewsSidebarProps {
  smartViews: SmartViewConfig[];
  selectedView: string;
  onSelectView: (id: string) => void;
  viewCounts: Record<string, number>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  position: "left" | "top";
  onTogglePosition: () => void;
}

export function SmartViewsSidebar({
  smartViews,
  selectedView,
  onSelectView,
  viewCounts,
  isCollapsed,
  onToggleCollapse,
  position,
  onTogglePosition,
}: SmartViewsSidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    if (position !== "top") return;
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [position, checkScroll, smartViews]);

  const scrollBy = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const formatCount = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (position === "top") {
    return (
      <div className="bg-background border-b border-border shrink-0 flex items-center px-3 py-[8.5px] gap-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground shrink-0 pr-2 border-r border-border mr-1">
          Views
        </span>
        <div className="relative flex-1 min-w-0 flex items-center">
          {/* Left shadow + arrow */}
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background to-transparent pointer-events-none z-10 transition-opacity duration-200",
              canScrollLeft ? "opacity-100" : "opacity-0",
            )}
          />
          {canScrollLeft && (
            <button
              onClick={() => scrollBy("left")}
              className="absolute left-0 z-20 size-6 flex items-center justify-center rounded-md border border-border bg-background shadow-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
            </button>
          )}

          <div ref={scrollRef} className="flex-1 flex items-center gap-0.5 overflow-x-auto scrollbar-none">
            {smartViews.map((view) => {
              const Icon = view.icon;
              const count = viewCounts[view.id] || 0;
              const isActive = selectedView === view.id;
              return (
                <button
                  key={view.id}
                  onClick={() => onSelectView(view.id)}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0",
                    isActive
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className={cn("size-3.5 shrink-0", isActive ? view.color : "")} />
                  <span>{view.label}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full",
                        isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {formatCount(count)}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right shadow + arrow */}
          <div
            className={cn(
              "absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 transition-opacity duration-200",
              canScrollRight ? "opacity-100" : "opacity-0",
            )}
          />
          {canScrollRight && (
            <button
              onClick={() => scrollBy("right")}
              className="absolute right-0 z-20 size-6 flex items-center justify-center rounded-md border border-border bg-background shadow-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronRight className="size-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-border ml-1">
          <button
            className="size-7 hover:bg-muted rounded-lg grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Create new Smart View"
          >
            <Plus className="size-3.5" />
          </button>
          <button
            onClick={onTogglePosition}
            className="size-7 hover:bg-muted rounded-lg grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Move to left sidebar"
          >
            <PanelLeft className="size-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "bg-background border-r border-border h-full flex flex-col shrink-0 select-none z-10 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-12" : "w-56",
      )}
    >
      {/* Header */}
      <div className="p-3  border-b border-border flex items-center shrink-0">
        {!isCollapsed && <span className="font-medium text-sm   flex-1">Smart Views</span>}
        <div className={cn("flex items-center gap-0.5", isCollapsed && "mx-auto")}>
          {!isCollapsed && (
            <>
              <button
                className="size-6 hover:bg-muted rounded-md grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="New Smart View"
              >
                <Plus className="size-3.5" />
              </button>
              <button
                onClick={onTogglePosition}
                className="size-6 hover:bg-muted rounded-md grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Move to top bar"
              >
                <PanelTop className="size-3.5" />
              </button>
            </>
          )}
          <button
            onClick={onToggleCollapse}
            className="size-6 hover:bg-muted rounded-md grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <ChevronRight className="size-3.5" />
            ) : (
              <ChevronLeft className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Flat nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-thin">
        {smartViews.map((view) => {
          const Icon = view.icon;
          const count = viewCounts[view.id] || 0;
          const isActive = selectedView === view.id;
          const isEmpty = count === 0;

          return (
            <button
              key={view.id}
              onClick={() => onSelectView(view.id)}
              title={isCollapsed ? view.label : undefined}
              className={cn(
                "w-full flex items-center rounded-lg px-2 py-1.5 text-left transition-all duration-150 cursor-pointer group relative",
                isActive
                  ? "bg-primary/8 text-primary font-semibold"
                  : isEmpty
                    ? "text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground"
                    : "text-foreground/75 hover:bg-muted hover:text-foreground",
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "size-3.5 shrink-0 transition-transform duration-150 group-hover:scale-105",
                  isActive
                    ? view.color
                    : isEmpty
                      ? "text-muted-foreground/40"
                      : "text-muted-foreground",
                )}
              />
              {!isCollapsed && (
                <>
                  <span className="ml-2 text-[12.5px] truncate flex-1">{view.label}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full ml-1 shrink-0",
                        isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {formatCount(count)}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
