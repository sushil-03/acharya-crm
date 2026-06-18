import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui-kit";
import { DataGrid } from "@/components/data-grid/data-grid";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import InputSearch from "@/components/global/input-search";
import { getApplicationColumns, ApplicationTableRow } from "./application-column";
import { useGetApplications } from "./hook/query/use-get-applications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPLICATION_STATUS } from "@/lib/constant";

export function ApplicationTableView() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const { data, isLoading } = useGetApplications();

  const filteredData = useMemo(() => {
    if (!data) return [];
    const filtered = data.filter((l) => l.student);

    const formatted: ApplicationTableRow[] = filtered.map((app) => ({
      ...app,
      id: app.id,
      student:
        `${app.student?.firstName || ""} ${app.student?.lastName === "-" ? "" : app.student?.lastName || ""}`.trim(),
      program: app.program?.name || app.programId,
      campus: app.campusId,
      status: app.status || "started",
      progress: app.completionPercent || 0,
      submitted: app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "-",
      offers: app.offers || [],
    })) as unknown as ApplicationTableRow[];

    return formatted.filter((app) => {
      const matchesSearch =
        app.student.toLowerCase().includes(q.toLowerCase()) ||
        app.id.toLowerCase().includes(q.toLowerCase());
      const matchesStatus = status === "all" || app.status.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [q, status, data]);

  const dataGrid = useDataGrid({
    data: filteredData,
    columns: getApplicationColumns,
    readOnly: true,
    manualPagination: false,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },
    },
  });

  return (
    <Card className="overflow-hidden flex flex-col min-h-0 flex-1">
      <div className="p-3 border-b border-border flex flex-wrap items-center gap-3 shrink-0">
        <InputSearch
          searchTerm={q}
          setSearchTerm={setQ}
          className="h-7"
          placeholder="Search by student or ID..."
        />
        <div className="flex items-center gap-2 ml-auto">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger size="xs" className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {APPLICATION_STATUS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
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
        loading={isLoading}
        totalElements={filteredData.length}
        className="flex-1 min-h-0"
      />
    </Card>
  );
}
