import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, Badge } from "@/components/ui-kit";
import { Loader2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import { getDataGridSelectColumn } from "@/components/data-grid/data-grid-select-column";
import { getLeadsColumn } from "@/components/leads/lead-column";
import { BulkAddToListDialog } from "@/components/leads/bulk-add-to-list-dialog";
import { useGetLeads } from "@/components/leads/hook/query/use-get-leads";
import { useUserStore } from "@/store/use-user-store";
import { useGetCounsellors } from "@/components/global/hooks/use-get-counsellor";
import InputSearch from "@/components/global/input-search";
import {
  LeadsFilterBar,
  ADVANCED_FILTER_ID,
  type FilterCondition,
} from "@/components/leads/leads-filter-bar";

export const Route = createFileRoute("/leads/")({
  component: LeadsPage,
  head: () => ({ meta: [{ title: "Lead Management — Acharya One" }] }),
});

function getLeadRawValue(l: any, fieldId: string): unknown {
  switch (fieldId) {
    case "program":
      return l.courseInterest;
    case "score":
      return l.leadScore;
    case "createdAt":
      return l.createdAt;
    case "city":
      return l.city;
    case "state":
      return l.state;
    case "name":
      return l.name;
    case "email":
      return l.email;
    case "mobile":
      return l.mobile;
    case "utmSource":
      return l.utmSource;
    case "utmMedium":
      return l.utmMedium;
    case "utmCampaign":
      return l.utmCampaign;
    case "status":
      return l.status;
    case "sourceChannel":
      return l.sourceChannel;
    default:
      return undefined;
  }
}

function matchLeadCondition(l: any, f: FilterCondition): boolean {
  const raw = getLeadRawValue(l, f.fieldId);
  if (raw === undefined || raw === null) return false;

  switch (f.operator) {
    case "is":
      return String(raw).toLowerCase() === String(f.value).toLowerCase();
    case "is_not":
      return String(raw).toLowerCase() !== String(f.value).toLowerCase();
    case "contains":
      return String(raw)
        .toLowerCase()
        .includes(String(f.value ?? "").toLowerCase());
    case "not_contains":
      return !String(raw)
        .toLowerCase()
        .includes(String(f.value ?? "").toLowerCase());
    case "eq":
      return Number(raw) === Number(f.value);
    case "gt":
      return Number(raw) > Number(f.value);
    case "gte":
      return Number(raw) >= Number(f.value);
    case "lt":
      return Number(raw) < Number(f.value);
    case "lte":
      return Number(raw) <= Number(f.value);
    case "between": {
      const n = Number(raw);
      return n >= Number(f.value) && n <= Number(f.endValue ?? f.value);
    }
    case "on":
      return new Date(String(raw)).toDateString() === new Date(String(f.value)).toDateString();
    case "before":
      return new Date(String(raw)) < new Date(String(f.value));
    case "after":
      return new Date(String(raw)) > new Date(String(f.value));
    default:
      return true;
  }
}

function LeadsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterCondition[]>(() => {
    try {
      const saved = localStorage.getItem("leads_table_filters");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [q, setQ] = useState(() => {
    return localStorage.getItem("leads_table_search") || "";
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const { user, counsellorId } = useUserStore();
  const { data: counsellors, isLoading: isLoadingCounsellors } = useGetCounsellors();

  const isCounsellor = user?.role === "counsellor" || user?.role === "councellor";

  const resolvedCounsellorId = React.useMemo(() => {
    if (counsellorId) return counsellorId;
    if (isCounsellor && counsellors) {
      return counsellors.find((c) => c.userId === user?.id)?.id;
    }
    return undefined;
  }, [counsellorId, isCounsellor, counsellors, user?.id]);

  const handleFiltersChange = (next: FilterCondition[]) => {
    setFilters(next);
    setPage(1);
    try {
      localStorage.setItem("leads_table_filters", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Map filter conditions to API-supported params (server-side)
  const apiStatus = filters.find((f) => f.fieldId === "status" && f.operator === "is")?.value as
    | string
    | undefined;
  const apiSource = filters.find((f) => f.fieldId === "sourceChannel" && f.operator === "is")
    ?.value as string | undefined;

  const { data, isLoading } = useGetLeads({
    search: q || undefined,
    status: apiStatus,
    sourceChannel: apiSource,
    assignedTo: isCounsellor ? resolvedCounsellorId : undefined,
    page,
    pageSize,
  });

  const filtered = React.useMemo(() => {
    if (!data) return [];

    let list = data.data;

    // In-memory filter for counselor assignments as a fallback/verification
    if (isCounsellor && resolvedCounsellorId) {
      list = list.filter((l) => {
        const assignments = l.assignments || [];
        return assignments.some((item: any) => {
          const id = typeof item === "object" ? item?.id || item?.counsellorId : item;
          return String(id) === String(resolvedCounsellorId);
        });
      });
    }

    // Client-side filtering
    for (const f of filters) {
      if (f.fieldId === "status" || f.fieldId === "sourceChannel") continue; // server-side

      if (f.fieldId === ADVANCED_FILTER_ID) {
        const subs = f.subConditions ?? [];
        if (subs.length === 0) continue;
        // OR logic: lead passes if it matches ANY sub-condition
        list = list.filter((l) => subs.some((sub) => matchLeadCondition(l, sub)));
        continue;
      }

      if (f.value === undefined || f.value === "") continue;
      list = list.filter((l) => matchLeadCondition(l, f));
    }

    return list.map((l) => ({
      ...l,
      program: l.courseInterest,
      campus: l.campusId,
      city: l.city,
      source: l.sourceChannel,
      stage: l.status,
      score: l.leadScore,
      counsellor: l.assignments,
      lastActivity: l.lastContactedAt ?? l.createdAt,
    }));
  }, [data, isCounsellor, resolvedCounsellorId, filters]);

  const leadsColumns = useMemo(
    () => [getDataGridSelectColumn<any>({ enableRowMarkers: true }), ...getLeadsColumn],
    [],
  );

  console.log("leads", data);
  const dataGrid = useDataGrid({
    data: filtered,
    columns: leadsColumns,
    getRowId: (row: any) => row.id,
    readOnly: true,
    manualPagination: true,
    persistedKey: "leads_table",
    initialState: {
      columnPinning: { left: ["select"], right: ["actions"] },
      columnVisibility: {
        lastActivity: false,
        city: false,
        email: false,
        mobile: false,
        state: false,
        utmSource: false,
        utmMedium: false,
        utmCampaign: false,
      },
    },
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

  const rowSelection = dataGrid.table.getState().rowSelection;
  const selectedLeadIds = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection],
  );

  const [bulkListDialogOpen, setBulkListDialogOpen] = useState(false);

  // Display a loading state if we are still resolving the counselor profile for a counselor
  if (isCounsellor && !resolvedCounsellorId && isLoadingCounsellors) {
    return (
      <AppShell>
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell className="h-screen overflow-hidden" noPadding>
      <PageHeader
        title="Leads"
        subtitle="Centralized acquisition, attribution, scoring & distribution across all channels."
        actions={
          <>
            <Button variant="outline-primary" className="font-medium" asChild>
              <Link to="/leads/new">Quick Add Lead</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={() => {}}>Import Leads</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>Export Leads</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />
      <div className="flex flex-col min-h-0 flex-1  border-t">
        {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Leads"
            value="12,480"
            delta="+18.4%"
            icon={<Users className="size-4" />}
          />
          <StatCard
            label="Hot Leads"
            value="2,142"
            delta="+24.1%"
            icon={<Flame className="size-4" />}
            accent="warning"
          />
          <StatCard
            label="Avg Lead Score"
            value="68.4"
            delta="+3.2"
            icon={<Target className="size-4" />}
            accent="info"
          />
          <StatCard
            label="MQL → SQL"
            value="42.6%"
            delta="+2.1pp"
            icon={<TrendingUp className="size-4" />}
            accent="success"
          />
        </div> */}

        <Card className="overflow-hidden flex flex-col min-h-0 flex-1 border-none">
          <div className="px-3 py-2 border-b border-border flex flex-wrap items-center gap-2">
            <InputSearch
              searchTerm={q}
              setSearchTerm={setQ}
              className="h-7"
              containerClassName="w-44 flex-none"
              placeholder="Search.."
            />
            <div className="h-4 w-px bg-border" />
            <LeadsFilterBar filters={filters} onChange={handleFiltersChange} className="flex-1" />
            <div className="flex items-center gap-1.5 ml-auto">
              <DataGridViewMenu table={dataGrid.table} />
              {/* <DataGridRowHeightMenu table={dataGrid.table} /> */}
            </div>
          </div>

          <DataGrid
            {...dataGrid}
            stretchColumns
            showPagination
            loading={isLoading}
            totalElements={data?.meta?.total ?? 0}
            className="flex-1 min-h-0 border-none"
          />
        </Card>
      </div>

      {selectedLeadIds.length > 0 && (
        <div
          data-grid-popover
          className="animated-border fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full p-px shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-center gap-3 rounded-full bg-white px-2 py-1.5">
            <div className="flex items-center gap-2 pl-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {selectedLeadIds.length}
              </span>
              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                lead{selectedLeadIds.length !== 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-1 pr-1">
              <Button
                size="sm"
                className="h-7 rounded-full px-3 text-xs"
                onClick={() => setBulkListDialogOpen(true)}
              >
                Add to List
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => dataGrid.table.resetRowSelection()}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      <BulkAddToListDialog
        open={bulkListDialogOpen}
        onOpenChange={setBulkListDialogOpen}
        leadIds={selectedLeadIds}
        onSuccess={() => dataGrid.table.resetRowSelection()}
      />
    </AppShell>
  );
}
