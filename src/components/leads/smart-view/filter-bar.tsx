import React, { useMemo, ReactNode } from "react";
import { SmartFilters } from "./types";
import { Search, Filter as FilterIcon, Trash2, Plus, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LEAD_STATUS, LEAD_SOURCES } from "@/lib/constant";

interface SmartViewsFilterBarProps {
  filters: SmartFilters;
  onChangeFilter: <K extends keyof SmartFilters>(key: K, value: SmartFilters[K]) => void;
  onClearFilters: () => void;
  viewIcon?: ReactNode;
  viewLabel?: string;
  viewCount?: number;
  isFetching?: boolean;
  onRefresh?: () => void;
}

export function SmartViewsFilterBar({
  filters,
  onChangeFilter,
  onClearFilters,
  viewIcon,
  viewLabel,
  viewCount,
  isFetching,
  onRefresh,
}: SmartViewsFilterBarProps) {
  const isAnyFilterActive = useMemo(() => {
    return (
      filters.search !== "" ||
      filters.stage !== "all" ||
      filters.source !== "all" ||
      filters.owner !== "all" ||
      filters.app !== "all" ||
      filters.level !== "all" ||
      filters.activity !== "all"
    );
  }, [filters]);

  return (
    <div className="border-b border-border bg-background shrink-0">
      {/* Title row */}
      <div className="px-4 h-11 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {viewIcon}
          <h1 className="text-[13px] font-semibold text-foreground truncate">{viewLabel}</h1>
          {typeof viewCount === "number" && viewCount > 0 && (
            <span className="text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
              {viewCount}
            </span>
          )}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isFetching}
            className="size-6 rounded-md hover:bg-muted grid place-items-center text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer shrink-0"
            aria-label="Refresh"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="px-4 pb-2.5 flex flex-wrap items-center gap-2">
        <div className="relative group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads…"
            value={filters.search}
            onChange={(e) => onChangeFilter("search", e.target.value)}
            className="pl-8 pr-3 h-7 text-xs w-52 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-medium placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Select value={filters.stage} onValueChange={(val) => onChangeFilter("stage", val)}>
            <SelectTrigger size="xs" className="h-7 text-xs w-[120px]">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {LEAD_STATUS.map((st) => (
                <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.source} onValueChange={(val) => onChangeFilter("source", val)}>
            <SelectTrigger size="xs" className="h-7 text-xs w-[120px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {LEAD_SOURCES.map((sc) => (
                <SelectItem key={sc.value} value={sc.value}>{sc.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.owner} onValueChange={(val) => onChangeFilter("owner", val)}>
            <SelectTrigger size="xs" className="h-7 text-xs w-[120px]">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              <SelectItem value="me">Assigned to Me</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.app} onValueChange={(val) => onChangeFilter("app", val)}>
            <SelectTrigger size="xs" className="h-7 text-xs w-[130px]">
              <SelectValue placeholder="App Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">App Status</SelectItem>
              <SelectItem value="started">Started</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="payment_pending">Payment Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isAnyFilterActive && (
          <button
            onClick={onClearFilters}
            className="h-7 px-2.5 rounded-md border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer shrink-0"
          >
            <Trash2 className="size-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
