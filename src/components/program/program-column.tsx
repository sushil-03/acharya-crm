import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui-kit";
import { Hash, Edit, GraduationCap, Building2 } from "lucide-react";
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Program } from "@/components/global/hooks/use-get-programs";
import { Button } from "@/components/ui/button";

export const getProgramsColumn: ColumnDef<Program>[] = [
  {
    id: "sno",
    header: "S.No",
    meta: { label: "S.No", cell: { variant: "custom", headerIcon: Hash } },
    size: 60,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination || { pageIndex: 0, pageSize: 10 };
      return (
        <span className="text-[12px] tabular-nums pl-1">
          {pageIndex * pageSize + row.index + 1}
        </span>
      );
    },
  },

  {
    accessorKey: "name",
    header: "Program Name",
    meta: { label: "Program Name", cell: { variant: "custom", headerIcon: GraduationCap } },
    size: 250,
    cell: ({ row }) => (
      <Link
        to="/programs/$programId"
        params={{ programId: row.original.id }}
        className="flex items-center gap-2.5"
      >
        <span className="font-semibold text-foreground hover:text-primary truncate">
          {row.original.name}
        </span>
      </Link>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
    meta: { label: "Code", cell: { variant: "short-text" } },
    size: 100,
    cell: ({ row }) => <span className="font-semibold text-[13px]">{row.original.code}</span>,
  },
  {
    accessorKey: "type",
    header: "Type",
    meta: { label: "Type", cell: { variant: "short-text" } },
    size: 130,
    cell: ({ row }) => <span className="capitalize">{row.original.type}</span>,
  },
  {
    accessorKey: "discipline",
    header: "Discipline",
    meta: { label: "Discipline", cell: { variant: "short-text" } },
    size: 150,
  },
  {
    id: "campus",
    header: "Campus",
    meta: { label: "Campus", cell: { variant: "custom", headerIcon: Building2 } },
    size: 150,
    cell: ({ row }) => <span>{row.original.campus?.code || row.original.campusId}</span>,
  },
  {
    accessorKey: "intakeCapacity",
    header: "Intake",
    meta: { label: "Intake", cell: { variant: "short-text" } },
    size: 100,
    cell: ({ row }) => <span>{row.original.intakeCapacity}</span>,
  },
  {
    accessorKey: "totalFee",
    header: "Total Fee",
    meta: { label: "Total Fee", cell: { variant: "short-text" } },
    size: 120,
    cell: ({ row }) => <span>₹{Number(row.original.totalFee).toLocaleString()}</span>,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    meta: { label: "Status", cell: { variant: "custom" } },
    size: 100,
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge tone={isActive ? "success" : "muted"}>{isActive ? "Active" : "Inactive"}</Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => "",
    meta: { label: "Actions" },
    enableSorting: false,
    enableHiding: false,
    size: 80,
    cell: ({ row }) => (
      <Link to="/programs/$programId" params={{ programId: row.original.id }}>
        <Button variant="ghost" size="icon" className="size-8">
          <Edit className="size-4 text-muted-foreground hover:text-foreground" />
        </Button>
      </Link>
    ),
  },
];
