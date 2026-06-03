import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, Card, StatCard, Badge } from "@/components/ui-kit";
import {
  Users,
  Flame,
  Target,
  TrendingUp,
  Filter,
  Download,
  Plus,
  Search,
  Phone,
  Mail,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import type { ColumnDef } from "@tanstack/react-table";
import { DataGridFilterMenu } from "@/components/data-grid/data-grid-filter-menu";
import { DataGridSortMenu } from "@/components/data-grid/data-grid-sort-menu";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import { getDataGridSelectColumn } from "@/components/data-grid/data-grid-select-column";
import { getLeadsColumn } from "@/components/leads/lead-column";
import { useGetLeads } from "@/components/leads/hook/query/use-get-leads";
import { useUserStore } from "@/store/use-user-store";
import { useGetCounsellors } from "@/components/global/hooks/use-get-counsellor";
import InputSearch from "@/components/global/input-search";
import { LEAD_STATUS, LEAD_SOURCES } from "@/lib/constant";

export const Route = createFileRoute("/leads/")({
  component: LeadsPage,
  head: () => ({ meta: [{ title: "Lead Management — Acharya One" }] }),
});

function LeadsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [sourceChannel, setSourceChannel] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const { user, counsellorId } = useUserStore();
  const { data: counsellors, isLoading: isLoadingCounsellors } = useGetCounsellors();

  const isCounsellor = user?.role === "counsellor" || user?.role === "councellor";

  // Resolve counselor ID for logged-in counselor
  const resolvedCounsellorId = React.useMemo(() => {
    if (counsellorId) return counsellorId;
    if (isCounsellor && counsellors) {
      return counsellors.find((c) => c.userId === user?.id)?.id;
    }
    return undefined;
  }, [counsellorId, isCounsellor, counsellors, user?.id]);

  const { data, isLoading } = useGetLeads({
    search: q || undefined,
    status: tab === "all" ? undefined : tab,
    sourceChannel: sourceChannel === "all" ? undefined : sourceChannel,
    assignedTo: isCounsellor ? resolvedCounsellorId : undefined,
    page,
    pageSize,
  });

  const totalPages = data?.meta ? Math.ceil(data.meta.total / data.meta.pageSize) : 1;

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
  }, [data, isCounsellor, resolvedCounsellorId]);

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

  console.log("leads", data);
  const dataGrid = useDataGrid({
    data: filtered,
    columns: getLeadsColumn,
    readOnly: true,
    manualPagination: true,
    initialState: {
      columnPinning: { right: ["actions"] },
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

  return (
    <AppShell>
      <PageHeader
        title="Lead Management"
        subtitle="Centralized acquisition, attribution, scoring & distribution across all channels."
        actions={
          <>
            <Button variant="outline">
              <Download className="size-4" /> Export
            </Button>
          </>
        }
      />
      <div className="flex flex-col  h-full min-h-0 flex-1">
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

        <Card className="overflow-hidden h-full flex flex-col">
          <div className="p-3 border-b border-border flex flex-wrap items-center gap-3">
            <InputSearch
              searchTerm={q}
              setSearchTerm={setQ}
              className="h-7"
              placeholder="Search by name or ID..."
            />
            <div className="flex items-center gap-2 ml-auto">
              <Select value={tab} onValueChange={setTab}>
                <SelectTrigger size="xs" className="w-[140px] ">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {LEAD_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sourceChannel} onValueChange={setSourceChannel}>
                <SelectTrigger size="xs" className="w-[140px] ">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DataGridViewMenu table={dataGrid.table} />
              <DataGridRowHeightMenu table={dataGrid.table} />
            </div>
          </div>

          <DataGrid
            {...dataGrid}
            stretchColumns
            showPagination
            totalElements={data?.meta?.total ?? 0}
            // className="border-0 border-none rounded-none "
            className="flex-1 "
          />
        </Card>
      </div>
    </AppShell>
  );
}
