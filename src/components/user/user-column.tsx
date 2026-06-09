import { Badge } from "@/components/ui-kit";
import { User, Mail, Shield, Building2, Activity, Hash, Calendar, Plus } from "lucide-react";
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { getReadableDate } from "@/lib/utils";

const StatusCell = ({ row }: { row: any }) => {
  const isActive = row.original.isActive as boolean;
  const tone = isActive ? "success" : "muted";
  const label = isActive ? "Active" : "Inactive";

  return <Badge tone={tone}>{label}</Badge>;
};

export const getUsersColumn: ColumnDef<any>[] = [
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
    accessorKey: "username",
    header: "User",
    meta: { label: "User", cell: { variant: "custom", headerIcon: User } },
    size: 200,
    cell: ({ row }) => {
      const l = row.original;
      return (
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-foreground hover:text-primary truncate">
            {l.username || l.email.split("@")[0]}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { label: "Email", cell: { variant: "custom", headerIcon: Mail } },
    size: 200,
  },
  {
    accessorKey: "role",
    header: "Role",
    meta: {
      label: "Role",
      cell: { variant: "custom", headerIcon: Shield },
    },
    size: 150,
    cell: ({ row }) => {
      return <span className="capitalize">{row.original.role}</span>;
    },
  },
  {
    accessorKey: "campus.name",
    header: "Campus",
    meta: {
      label: "Campus",
      cell: { variant: "custom", headerIcon: Building2 },
    },
    size: 150,
    cell: ({ row }) => {
      return <span>{row.original.campus?.name || "N/A"}</span>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    meta: {
      label: "Status",
      cell: { variant: "custom", headerIcon: Activity },
    },
    size: 100,
    cell: ({ row }) => <StatusCell row={row} />,
  },
  {
    accessorKey: "lastLoginAt",
    header: "Last Login",
    meta: { label: "Last Login", cell: { variant: "custom", headerIcon: Calendar } },
    size: 140,
    cell: ({ row }) => (
      <span>{row.original.lastLoginAt ? getReadableDate(row.original.lastLoginAt) : ""}</span>
    ),
  },
  {
    id: "actions",
    header: () => "",
    meta: {
      label: "Actions",
      cell: { variant: "custom", headerIcon: Plus },
    },
    enableSorting: false,
    enableHiding: false,
    size: 60,
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];

import { Button } from "@/components/ui/button";
import { CreateCounsellorModal } from "./create-counsellor-modal";
import { useState } from "react";

const ActionsCell = ({ row }: { row: any }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const user = row.original;

  if (user.role !== "counsellor") return null;

  if (user.counsellor) {
    return (
      <div className="h-full flex items-center ">
        <Badge tone="success">Created</Badge>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center">
      <Button variant="outline" className="text-xs" size="sm" onClick={() => setModalOpen(true)}>
        <Plus /> Profile
      </Button>

      <CreateCounsellorModal user={user} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};
