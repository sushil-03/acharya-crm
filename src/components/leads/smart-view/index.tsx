import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { SmartViewsSidebar } from "./sidebar";
import { SmartViewsFilterBar } from "./filter-bar";
import { SmartViewsTable } from "./table";
import { SmartViewConfig, SmartFilters } from "./types";
import { useDataGrid } from "@/hooks/use-data-grid";
import { useGetLeads } from "@/components/leads/hook/query/use-get-leads";
import { useUserStore } from "@/store/use-user-store";
import { useGetCounsellors } from "@/components/global/hooks/use-get-counsellor";
import { getDataGridSelectColumn } from "@/components/data-grid/data-grid-select-column";
import type { ColumnDef } from "@tanstack/react-table";
import { LEAD_SOURCES } from "@/lib/constant";
import {
  Users,
  User,
  Flame,
  Thermometer,
  Sparkles,
  CheckSquare,
  AlertCircle,
  FileEdit,
  FileCheck,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MoreVertical,
  Star,
  Pencil,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function SmartViewContainer() {
  const [selectedView, setSelectedView] = useState("Untouched");
  const [starredLeads, setStarredLeads] = useState<Set<string>>(() => new Set());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarPosition, setSidebarPosition] = useState<"left" | "top">("left");

  const [filters, setFilters] = useState<SmartFilters>({
    search: "",
    stage: "all",
    source: "all",
    owner: "me",
    app: "all",
    level: "all",
    activity: "all",
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { user, counsellorId } = useUserStore();
  const { data: counsellors } = useGetCounsellors();
  const isCounsellor = user?.role === "counsellor" || user?.role === "councellor";

  const resolvedCounsellorId = useMemo(() => {
    if (counsellorId) return counsellorId;
    if (isCounsellor && counsellors) {
      return counsellors.find((c) => c.userId === user?.id)?.id;
    }
    return undefined;
  }, [counsellorId, isCounsellor, counsellors, user?.id]);

  const {
    data: leadsResponse,
    isLoading,
    refetch,
    isFetching,
  } = useGetLeads({
    page: 1,
    pageSize: 100,
    assignedTo: isCounsellor ? resolvedCounsellorId : undefined,
  });

  const rawLeads = leadsResponse?.data || [];

  const smartViews: SmartViewConfig[] = useMemo(
    () => [
      {
        id: "Untouched",
        label: "Untouched",
        icon: Users,
        color: "text-blue-500",
        filterFn: (l) =>
          !l.lastContactedAt &&
          (l.status === "new" || !l.assignments || l.assignments.length === 0),
      },
      {
        id: "Prospect",
        label: "Prospect",
        icon: User,
        color: "text-purple-500",
        filterFn: (l) => l.status === "qualified" || l.status === "contacted",
      },
      {
        id: "Warm",
        label: "Warm",
        icon: Flame,
        color: "text-orange-500",
        filterFn: (l) => (l.leadScore ?? 0) >= 40 && (l.leadScore ?? 0) < 70,
      },
      {
        id: "Cold",
        label: "Cold",
        icon: Thermometer,
        color: "text-sky-500",
        filterFn: (l) => (l.leadScore ?? 0) < 40 && (l.leadScore ?? 0) >= 0,
      },
      {
        id: "Hot",
        label: "Hot",
        icon: Sparkles,
        color: "text-red-500",
        filterFn: (l) => (l.leadScore ?? 0) >= 70,
      },
      {
        id: "Pending Tasks",
        label: "Pending Tasks",
        icon: CheckSquare,
        color: "text-amber-500",
        filterFn: (l) => l.status === "assigned",
      },
      {
        id: "Overdue Tasks",
        label: "Overdue Tasks",
        icon: AlertCircle,
        color: "text-rose-600",
        filterFn: (l) => (l.leadScore ?? 0) < 0,
      },
      {
        id: "Application Initiated",
        label: "Application Initiated",
        icon: FileEdit,
        color: "text-indigo-500",
        filterFn: (l) =>
          l.applications?.some(
            (app: any) => app.status === "started" || app.status === "payment_pending",
          ) ?? false,
      },
      {
        id: "Application Submitted",
        label: "Application Submitted",
        icon: FileCheck,
        color: "text-emerald-500",
        filterFn: (l) => l.applications?.some((app: any) => app.status === "submitted") ?? false,
      },
      {
        id: "Enrolled",
        label: "Enrolled",
        icon: GraduationCap,
        color: "text-violet-600",
        filterFn: (l) => l.status === "converted",
      },
      {
        id: "Course Details Filled",
        label: "Course Details Filled",
        icon: BookOpen,
        color: "text-teal-500",
        filterFn: (l) => !!l.courseInterest,
      },
      {
        id: "Application Submitted Pending",
        label: "Application submitted pending",
        icon: ClipboardCheck,
        color: "text-cyan-500",
        filterFn: (l) => l.applications?.some((app: any) => app.status === "under_review") ?? false,
      },
      {
        id: "Payment Failure",
        label: "Payment failure",
        icon: CreditCard,
        color: "text-red-600",
        filterFn: (l) =>
          l.applications?.some((app: any) => app.status === "payment_pending") ?? false,
      },
    ],
    [],
  );

  const viewCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    smartViews.forEach((view) => {
      counts[view.id] = rawLeads.filter(view.filterFn).length;
    });
    return counts;
  }, [rawLeads, smartViews]);

  const filteredLeads = useMemo(() => {
    const activeView = smartViews.find((v) => v.id === selectedView);
    let list = rawLeads;

    if (activeView) list = list.filter(activeView.filterFn);

    if (filters.search) {
      const search = filters.search.toLowerCase();
      list = list.filter(
        (l) =>
          l.name?.toLowerCase().includes(search) ||
          l.email?.toLowerCase().includes(search) ||
          l.mobile?.toLowerCase().includes(search) ||
          l.id?.toLowerCase().includes(search),
      );
    }

    if (filters.stage !== "all") list = list.filter((l) => l.status === filters.stage);

    if (filters.source !== "all") list = list.filter((l) => l.sourceChannel === filters.source);

    if (filters.owner === "me" && resolvedCounsellorId) {
      list = list.filter((l) => {
        const assignments = l.assignments || [];
        return assignments.some((item: any) => {
          const id = typeof item === "object" ? item?.id || item?.counsellorId : item;
          return String(id) === String(resolvedCounsellorId);
        });
      });
    }

    if (filters.app !== "all") {
      list = list.filter(
        (l) => l.applications?.some((app: any) => app.status === filters.app) ?? false,
      );
    }

    if (filters.level !== "all") {
      list = list.filter((l) =>
        l.courseInterest?.toLowerCase().includes(filters.level.toLowerCase()),
      );
    }

    return list.map((l) => ({
      ...l,
      program: l.courseInterest || "Not specified",
      source: l.sourceChannel,
      stage: l.status,
      score: l.leadScore ?? 0,
      counsellor: l.assignments,
      lastActivity: l.lastContactedAt ?? l.createdAt,
    }));
  }, [rawLeads, selectedView, filters, resolvedCounsellorId, smartViews]);

  const paginatedLeads = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredLeads.slice(startIndex, startIndex + pageSize);
  }, [filteredLeads, page, pageSize]);

  const handleChangeFilter = <K extends keyof SmartFilters>(key: K, value: SmartFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      stage: "all",
      source: "all",
      owner: "all",
      app: "all",
      level: "all",
      activity: "all",
    });
    setPage(1);
  };

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStarredLeads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const smartColumns = useMemo<ColumnDef<any>[]>(
    () => [
      getDataGridSelectColumn<any>({ enableRowMarkers: false, size: 36 }),
      {
        accessorKey: "name",
        header: "Lead Name",
        meta: { label: "Lead Name", cell: { variant: "custom" } },
        size: 190,
        cell: ({ row }) => {
          const l = row.original;
          const isStarred = starredLeads.has(l.id);
          return (
            <div className="flex items-center gap-2 max-w-full">
              <button
                onClick={(e) => handleToggleStar(l.id, e)}
                className="focus:outline-hidden hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                aria-label={isStarred ? "Unstar lead" : "Star lead"}
              >
                <Star
                  className={`size-4 transition-colors ${
                    isStarred
                      ? "text-amber-400 fill-amber-400 filter drop-shadow-[0_0_1px_rgba(245,158,11,0.5)]"
                      : "text-slate-300 dark:text-zinc-600 hover:text-amber-400"
                  }`}
                />
              </button>
              <Link
                to="/leads/$leadId"
                params={{ leadId: l.id }}
                className="font-semibold text-slate-800 dark:text-zinc-200 hover:text-primary dark:hover:text-primary transition-colors truncate"
              >
                {l.name || "No Name"}
              </Link>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        meta: { label: "Actions", cell: { variant: "custom" } },
        size: 120,
        cell: ({ row: _row }) => (
          <div className="flex items-center gap-1">
            <button
              className="size-7 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg grid place-items-center cursor-pointer text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              aria-label="Edit details"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              className="size-7 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg grid place-items-center cursor-pointer text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              aria-label="Make call"
            >
              <Phone className="size-3.5" />
            </button>
            <button
              className="size-7 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg grid place-items-center cursor-pointer text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              aria-label="Send email"
            >
              <Mail className="size-3.5" />
            </button>
            <button
              className="size-7 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg grid place-items-center cursor-pointer text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="size-3.5" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        meta: { label: "Email", cell: { variant: "short-text" } },
        size: 210,
        cell: ({ row }) => (
          <span className="text-slate-500 dark:text-zinc-400 font-medium truncate max-w-[190px]">
            {row.original.email || "—"}
          </span>
        ),
      },
      {
        accessorKey: "score",
        header: "Lead Score",
        meta: { label: "Lead Score", cell: { variant: "custom" } },
        size: 100,
        cell: ({ row }) => {
          const score = row.original.score;
          return (
            <span
              className={`font-semibold tabular-nums text-sm ${
                score < 0
                  ? "text-rose-500 dark:text-rose-400"
                  : score > 50
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-700 dark:text-zinc-300"
              }`}
            >
              {score}
            </span>
          );
        },
      },
      {
        accessorKey: "source",
        header: "Lead Source",
        meta: { label: "Lead Source", cell: { variant: "custom" } },
        size: 130,
        cell: ({ row }) => {
          const source = row.original.source;
          const label =
            LEAD_SOURCES.find((s) => s.value === source)?.label || source || "Direct Traffic";
          return (
            <span className="font-semibold text-slate-500 dark:text-zinc-400 text-xs">{label}</span>
          );
        },
      },
      {
        accessorKey: "program",
        header: "STREAM",
        meta: { label: "STREAM", cell: { variant: "short-text" } },
        size: 200,
        cell: ({ row }) => (
          <span className="font-medium text-slate-600 dark:text-zinc-400 text-xs truncate max-w-[180px]">
            {row.original.program}
          </span>
        ),
      },
    ],
    [starredLeads],
  );

  const dataGrid = useDataGrid({
    data: paginatedLeads,
    columns: smartColumns,
    getRowId: (row: any) => row.id,
    readOnly: true,
    manualPagination: true,
    pageCount: Math.ceil(filteredLeads.length / pageSize),
    persistedKey: "smart_leads_grid_table",
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex: page - 1, pageSize });
        setPage(newState.pageIndex + 1);
        setPageSize(newState.pageSize);
      } else {
        setPage(updater.pageIndex + 1);
        setPageSize(updater.pageSize);
      }
    },
  });

  const activeViewConfig = smartViews.find((v) => v.id === selectedView);
  const ActiveIcon = activeViewConfig?.icon ?? Users;

  return (
    <div
      className={`flex flex-1 overflow-hidden w-full h-full ${
        sidebarPosition === "top" ? "flex-col" : "flex-row"
      }`}
    >
      <SmartViewsSidebar
        smartViews={smartViews}
        selectedView={selectedView}
        onSelectView={(id) => {
          setSelectedView(id);
          setPage(1);
        }}
        viewCounts={viewCounts}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        position={sidebarPosition}
        onTogglePosition={() => setSidebarPosition((p) => (p === "left" ? "top" : "left"))}
      />

      {/* Right / Bottom Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Combined title + filter bar */}
        <SmartViewsFilterBar
          filters={filters}
          onChangeFilter={handleChangeFilter}
          onClearFilters={handleClearFilters}
          viewIcon={<ActiveIcon className={`size-4 shrink-0 ${activeViewConfig?.color ?? "text-primary"}`} />}
          viewLabel={selectedView}
          viewCount={filteredLeads.length}
          isFetching={isFetching}
          onRefresh={() => refetch()}
        />

        {/* Content Table Area */}
        <div className="flex-1 min-h-0 flex flex-col relative">
          <div className="flex-1 min-h-0 overflow-auto bg-white dark:bg-zinc-950 flex flex-col">
            {filteredLeads.length === 0 && !isLoading ? (
              <div className="p-16 text-center max-w-md mx-auto my-auto flex flex-col items-center gap-4">
                <div className="text-4xl select-none">📭</div>
                <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">
                  No leads match this smart view
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Try adjusting or clearing your filters to see more leads.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="rounded-lg"
                >
                  Clear Search & Filters
                </Button>
              </div>
            ) : (
              <SmartViewsTable
                dataGrid={dataGrid}
                starredLeads={starredLeads}
                onToggleStar={handleToggleStar}
                filteredCount={filteredLeads.length}
                loading={isLoading}
              />
            )}
          </div>

          {/* Paginated Footer */}
          {filteredLeads.length > 0 && (
            <div className="h-11 px-5 bg-white dark:bg-zinc-950 border-t border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between shrink-0 select-none shadow-2xs">
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                <span>
                  Showing {Math.min(filteredLeads.length, (page - 1) * pageSize + 1)}–
                  {Math.min(filteredLeads.length, page * pageSize)} of {filteredLeads.length}
                </span>
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(val) => {
                      setPageSize(Number(val));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-7 text-xs px-2 w-[66px] bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-md">
                      <SelectValue placeholder={pageSize.toString()} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="size-7 hover:bg-slate-50 dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-800 disabled:opacity-40 rounded-lg grid place-items-center cursor-pointer text-slate-500 dark:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="size-4" />
                </button>
                {Array.from({ length: Math.ceil(filteredLeads.length / pageSize) })
                  .map((_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === Math.ceil(filteredLeads.length / pageSize) ||
                      Math.abs(p - page) <= 1,
                  )
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <span className="text-slate-400 dark:text-zinc-500 px-1 text-xs">…</span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`size-7 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                            page === p
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "hover:bg-slate-50 dark:hover:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-950"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
                <button
                  onClick={() =>
                    setPage((p) => Math.min(Math.ceil(filteredLeads.length / pageSize), p + 1))
                  }
                  disabled={
                    page === Math.ceil(filteredLeads.length / pageSize) ||
                    filteredLeads.length === 0
                  }
                  className="size-7 hover:bg-slate-50 dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-800 disabled:opacity-40 rounded-lg grid place-items-center cursor-pointer text-slate-500 dark:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
