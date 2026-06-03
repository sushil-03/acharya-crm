import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card } from "@/components/ui-kit";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import { getProgramsColumn } from "@/components/program/program-column";
import { useGetPrograms } from "@/components/global/hooks/use-get-programs";
import InputSearch from "@/components/global/input-search";

export const Route = createFileRoute("/programs/")({
  component: ProgramsPage,
  head: () => ({ meta: [{ title: "Program Management — Acharya One" }] }),
});

function ProgramsPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const { data, isLoading } = useGetPrograms();

  const filtered = React.useMemo(() => {
    if (!data) return [];
    if (!q) return data;
    const lowerQ = q.toLowerCase();
    return data.filter(
      (p) => p.name.toLowerCase().includes(lowerQ) || p.code.toLowerCase().includes(lowerQ)
    );
  }, [data, q]);

  const dataGrid = useDataGrid({
    data: filtered,
    columns: getProgramsColumn,
    readOnly: true,
    manualPagination: false,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
  });

  return (
    <AppShell>
      <PageHeader
        title="Program Management"
        subtitle="Manage academic programs, fees, and eligibility criteria."
        actions={
          <>
            <Button onClick={() => navigate({ to: "/programs/new" })}>
              <Plus className="size-4 mr-1.5" /> Create Program
            </Button>
          </>
        }
      />
      <div className="flex flex-col h-full min-h-0 flex-1">
        <Card className="overflow-hidden h-full flex flex-col">
          <div className="p-3 border-b border-border flex flex-wrap items-center gap-3">
            <InputSearch
              searchTerm={q}
              setSearchTerm={setQ}
              className="h-7 w-[300px]"
              placeholder="Search programs..."
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
