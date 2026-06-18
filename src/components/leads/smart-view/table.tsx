import React from "react";
import { DataGrid } from "@/components/data-grid/data-grid";

interface SmartViewsTableProps {
  dataGrid: any;
  starredLeads: Set<string>;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  filteredCount: number;
  loading?: boolean;
}

export function SmartViewsTable({ dataGrid, loading }: SmartViewsTableProps) {
  return (
    <DataGrid
      {...dataGrid}
      stretchColumns
      loading={loading}
      className="flex-1 min-h-0 border-none rounded-none bg-white dark:bg-zinc-950"
    />
  );
}
