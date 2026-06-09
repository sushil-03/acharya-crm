import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui-kit";
import {
  PhoneCall,
  FileText,
  Bell,
  CheckSquare,
  Hash,
  User,
  Calendar,
  Headset,
  FileSpreadsheet,
} from "lucide-react";
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { getReadableDate } from "@/lib/utils";
import { TASK_TYPES } from "@/lib/constant";
import type { Task } from "../leads/hook/query/use-get-task";

// Helper to resolve task type icon
const getTaskIcon = (type: string, status: string) => {
  const isCompleted = status.toLowerCase() === "completed";
  const className = `size-3.5 ${isCompleted ? "text-success" : "text-muted-foreground"}`;

  switch (type.toLowerCase()) {
    case "follow_up":
    case "call_back":
      return <PhoneCall className={className} />;
    case "send_documents":
      return <FileText className={className} />;
    case "application_reminder":
    case "payment_reminder":
      return <Bell className={className} />;
    default:
      return <CheckSquare className={className} />;
  }
};

// Helper to format task type to user-friendly label
const getTaskTypeLabel = (type: string) => {
  const found = TASK_TYPES.find((t) => t.value === type);
  if (found) return found.label;
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper to resolve status badge tone
const getTaskStatusTone = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success";
    case "overdue":
      return "danger";
    case "pending":
    default:
      return "warning";
  }
};

export const getTasksColumn: ColumnDef<Task>[] = [
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
    accessorKey: "taskType",
    header: "Task",
    meta: { label: "Task", cell: { variant: "custom", headerIcon: CheckSquare } },
    size: 180,
    cell: ({ row }) => {
      const t = row.original;
      return (
        <Link
          to="/leads/$leadId"
          params={{ leadId: t.leadId }}
          className="flex items-center gap-2 hover:underline"
        >
          <span className="shrink-0">{getTaskIcon(t.taskType, t.taskStatus)}</span>
          <span className="font-semibold text-foreground truncate">
            {getTaskTypeLabel(t.taskType)}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "leadName",
    header: "Lead",
    meta: { label: "Lead", cell: { variant: "custom", headerIcon: User } },
    size: 200,
    cell: ({ row }) => {
      const t = row.original;
      const leadId = t.leadId;
      const leadName = t.lead?.name || "Unknown Lead";
      return (
        <Link
          to="/leads/$leadId"
          params={{ leadId }}
          className="flex items-center gap-2.5 hover:underline"
        >
          <span className="font-semibold text-primary hover:text-primary-dark truncate">
            {leadName}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "taskStatus",
    header: "Status",
    meta: { label: "Status", cell: { variant: "custom" } },
    size: 120,
    cell: ({ row }) => {
      const status = row.original.taskStatus;
      const tone = getTaskStatusTone(status);
      const label = status.charAt(0).toUpperCase() + status.slice(1);
      return <Badge tone={tone}>{label}</Badge>;
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    meta: { label: "Notes", cell: { variant: "custom", headerIcon: FileSpreadsheet } },
    size: 250,
    cell: ({ row }) => {
      const notes = row.original.notes || "-";
      return (
        <div className="text-[12px] text-muted-foreground truncate max-w-[230px]" title={notes}>
          {notes}
        </div>
      );
    },
  },
  {
    accessorKey: "counsellor",
    header: "Counsellor",
    meta: { label: "Counsellor", cell: { variant: "custom", headerIcon: Headset } },
    size: 160,
    cell: ({ row }) => {
      const counsellorName = row.original.counsellor?.name || "-";
      return <span className="font-medium text-[12px]">{counsellorName}</span>;
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    meta: { label: "Due Date", cell: { variant: "custom", headerIcon: Calendar } },
    size: 160,
    cell: ({ row }) => {
      return (
        <span className="text-[12px] text-muted-foreground">
          {getReadableDate(row.original.dueDate)}
        </span>
      );
    },
  },
];
