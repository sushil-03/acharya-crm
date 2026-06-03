import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, StatCard } from "@/components/ui-kit";
import { Users, Phone, Shield, Target, Download } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import InputSearch from "@/components/global/input-search";
import { useGetCounsellors } from "@/components/global/hooks/use-get-counsellor";
import { getCounsellorsColumn } from "@/components/counsellor/counsellor-column";

export const Route = createFileRoute("/counsellor")({
  component: CounsellorPage,
  head: () => ({ meta: [{ title: "Counsellors — Acharya One" }] }),
});

function CounsellorPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const { data, isLoading } = useGetCounsellors();

  const filtered = React.useMemo(() => {
    if (!data) return [];
    return data.filter((c) => {
      if (!q) return true;
      const search = q.toLowerCase();
      return (
        (c.name && c.name.toLowerCase().includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search)) ||
        (c.mobile && c.mobile.includes(search)) ||
        (c.specialization && c.specialization.some(s => s.toLowerCase().includes(search))) ||
        (c.languageProficiency && c.languageProficiency.some(l => l.toLowerCase().includes(search)))
      );
    });
  }, [data, q]);

  const dataGrid = useDataGrid({
    data: filtered,
    columns: getCounsellorsColumn,
    readOnly: true,
    manualPagination: false, // In-memory pagination since API returns all
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

  const activeCounsellors = data?.filter((c) => c.isActive).length || 0;
  const avgTarget = data?.length ? Math.round(data.reduce((acc, c) => acc + (c.dailyCallTarget || 0), 0) / data.length) : 0;

  return (
    <AppShell>
      <PageHeader
        title="Counsellor Management"
        subtitle="Manage and track admission counsellors, their specializations, and daily targets."
        actions={
          <>
            <Button variant="outline">
              <Download className="size-4" /> Export
            </Button>
          </>
        }
      />
      <div className="flex flex-col h-full min-h-0 flex-1">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Counsellors"
            value={(data?.length || 0).toString()}
            icon={<Users className="size-4" />}
          />
          <StatCard
            label="Active Counsellors"
            value={activeCounsellors.toString()}
            icon={<Shield className="size-4" />}
            accent="success"
          />
          <StatCard
            label="Average Call Target"
            value={avgTarget.toString()}
            icon={<Target className="size-4" />}
            accent="info"
          />
          <StatCard
            label="On Calls Today"
            value={(data?.filter((c) => c.isAvailable).length || 0).toString()}
            icon={<Phone className="size-4" />}
            accent="warning"
          />
        </div>

        <Card className="overflow-hidden h-full flex flex-col">
          <div className="p-3 border-b border-border flex flex-wrap items-center gap-3">
            <InputSearch
              searchTerm={q}
              setSearchTerm={setQ}
              className="h-7 w-[250px]"
              placeholder="Search by name, email, mobile..."
            />
            <div className="flex items-center gap-2 ml-auto">
              <DataGridViewMenu table={dataGrid.table} />
              <DataGridRowHeightMenu table={dataGrid.table} />
            </div>
          </div>

          <DataGrid
            {...dataGrid}
            stretchColumns
            showPagination
            totalElements={filtered.length}
            className="flex-1"
          />
        </Card>
      </div>
    </AppShell>
  );
}
