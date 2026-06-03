import { Badge } from "@/components/ui-kit";
import { User, Mail, Phone, Languages, Hash, Target, PhoneCall } from "lucide-react";
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { getReadableDate } from "@/lib/utils";

export const getCounsellorsColumn: ColumnDef<any>[] = [
  {
    id: "sno",
    header: "S.No",
    meta: { label: "S.No", cell: { variant: "custom", headerIcon: Hash } },
    size: 60,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return (
        <span className="text-[12px] tabular-nums pl-1">
          {pageIndex * pageSize + row.index + 1}
        </span>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    meta: { label: "Name", cell: { variant: "custom", headerIcon: User } },
    size: 200,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <span className="font-semibold text-foreground hover:text-primary truncate">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { label: "Email", cell: { variant: "custom", headerIcon: Mail } },
    size: 200,
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
    meta: { label: "Mobile", cell: { variant: "custom", headerIcon: Phone } },
    size: 150,
  },
  {
    accessorKey: "specialization",
    header: "Specialization",
    meta: { label: "Specialization", cell: { variant: "custom", headerIcon: Target } },
    size: 200,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.specialization?.map((spec: string, idx: number) => (
          <Badge key={idx} tone="primary-light" className="text-[10px] px-1.5 py-0">
            {spec}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "languageProficiency",
    header: "Languages",
    meta: { label: "Languages", cell: { variant: "custom", headerIcon: Languages } },
    size: 200,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.languageProficiency?.map((lang: string, idx: number) => (
          <Badge key={idx} tone="info-light" className="text-[10px] px-1.5 py-0">
            {lang}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "dailyCallTarget",
    header: "Target",
    meta: { label: "Target", cell: { variant: "custom", headerIcon: PhoneCall } },
    size: 100,
    cell: ({ row }) => <span className="tabular-nums font-medium">{row.original.dailyCallTarget}</span>,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    meta: { label: "Status", cell: { variant: "custom" } },
    size: 100,
    cell: ({ row }) => (
      <Badge tone={row.original.isActive ? "success" : "muted"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];
