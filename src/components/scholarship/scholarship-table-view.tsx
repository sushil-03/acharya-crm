import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui-kit";
import { DataGrid } from "@/components/data-grid/data-grid";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import InputSearch from "@/components/global/input-search";
import { getScholarshipColumns } from "./scholarship-column";
import { useGetAllScholarship } from "./hook/query/use-get-all-scholarship";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ScholarshipTableView() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const { data, isLoading } = useGetAllScholarship();

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((scholarship) => {
      const matchesSearch =
        scholarship.studentId?.toLowerCase().includes(q.toLowerCase()) ||
        scholarship.id?.toLowerCase().includes(q.toLowerCase());
      const matchesStatus =
        status === "all" || scholarship.approvalStatus?.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [q, status, data]);

  const dataGrid = useDataGrid({
    data: filteredData,
    columns: getScholarshipColumns,
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
    <Card className="overflow-hidden h-[calc(100vh-220px)] flex flex-col">
      <div className="p-3 border-b border-border flex flex-wrap items-center gap-3 shrink-0">
        <InputSearch
          searchTerm={q}
          setSearchTerm={setQ}
          className="h-7 w-[250px]"
          placeholder="Search by student or ID..."
        />
        <div className="flex items-center gap-2 ml-auto">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger size="xs" className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
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
        totalElements={filteredData.length}
        className="flex-1"
      />
    </Card>
  );
}
