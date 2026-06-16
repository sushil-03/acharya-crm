import * as React from "react";
import { Badge, Card } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import type { ColumnDef } from "@tanstack/react-table";
import { Hash, Tag, Shield, UserCheck, ToggleLeft, Settings } from "lucide-react";
import type { ErpRole } from "@/components/user/hook/query/use-get-erp-roles";

interface ErpRolesTableProps {
  roles: ErpRole[];
  isLoading: boolean;
  roleLabelMap: Record<string, string>;
  onEditRole: (role: ErpRole) => void;
}

export function ErpRolesTable({
  roles,
  isLoading,
  roleLabelMap,
  onEditRole,
}: ErpRolesTableProps) {
  const columns = React.useMemo<ColumnDef<ErpRole>[]>(
    () => [
      {
        id: "sno",
        header: "S.No",
        meta: { label: "S.No", cell: { variant: "custom", headerIcon: Hash } },
        size: 60,
        cell: ({ row, table }) => {
          const { pageIndex, pageSize } = table.getState().pagination;
          const sortedIndex = table.getRowModel().rows.findIndex((r) => r.id === row.id);
          const index = sortedIndex !== -1 ? sortedIndex : row.index;
          return (
            <span className="text-[12px] tabular-nums pl-1">
              {pageIndex * pageSize + index + 1}
            </span>
          );
        },
      },
      {
        accessorKey: "label",
        header: "Label",
        meta: { label: "Label", cell: { variant: "custom", headerIcon: Tag } },
        size: 200,
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">{row.original.label}</span>
        ),
      },
      {
        accessorKey: "crmStatus",
        header: "CRM Status",
        meta: { label: "CRM Status", cell: { variant: "custom", headerIcon: Shield } },
        size: 180,
        cell: ({ row }) => <span>{row.original.crmStatus || "-"}</span>,
      },
      {
        accessorKey: "crmRole",
        header: "CRM Role",
        meta: { label: "CRM Role", cell: { variant: "custom", headerIcon: UserCheck } },
        size: 200,
        cell: ({ row }) => {
          const displayCrmRole = roleLabelMap[row.original.crmRole] ?? row.original.crmRole;
          return <span>{displayCrmRole}</span>;
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        meta: { label: "Status", cell: { variant: "custom", headerIcon: ToggleLeft } },
        size: 140,
        cell: ({ row }) => (
          <Badge tone={row.original.isActive ? "success" : "muted"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Action",
        meta: { label: "Action", cell: { variant: "custom", headerIcon: Settings, noPadding: true } },
        size: 120,
        cell: ({ row }) => (
          <div className="flex items-center h-full w-full px-3">
            <Button
              size="xs"
              variant="outline"
              className="h-7"
              onClick={(e) => {
                e.stopPropagation();
                onEditRole(row.original);
              }}
            >
              Update
            </Button>
          </div>
        ),
      },
    ],
    [roleLabelMap, onEditRole],
  );

  const dataGrid = useDataGrid({
    data: roles,
    columns,
    readOnly: true,
    manualPagination: true,
  });

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="p-3 border-b border-border flex items-center justify-between gap-4 select-none">
        <div>
          <h3 className="font-display text-[14px] font-semibold">Role Directory</h3>
          <p className="text-xs text-muted-foreground">
            Manage ERP status mapping and user roles within the CRM.
          </p>
        </div>
        {isLoading ? (
          <Badge tone="muted">Loading...</Badge>
        ) : (
          <Badge tone="success">{roles.length} loaded</Badge>
        )}
      </div>

      <div className="flex-1 min-h-0 relative">
        <DataGrid
          {...dataGrid}
          stretchColumns
          className="h-full"
        />
      </div>
    </Card>
  );
}
