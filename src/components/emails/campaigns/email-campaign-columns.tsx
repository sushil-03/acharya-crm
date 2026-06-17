import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Hash,
  Mail,
  Calendar,
  Users,
  Eye,
  MousePointerClick,
  Send,
  MoreHorizontal,
  Pencil,
  Trash2,
  CalendarClock,
  XCircle,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui-kit";
import { getReadableDate } from "@/lib/utils";
import type { Campaign, CampaignStatus } from "./types";

function pct(num: number, den: number) {
  if (!den) return "—";
  return `${((num / den) * 100).toFixed(1)}%`;
}

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; tone: React.ComponentProps<typeof Badge>["tone"] }
> = {
  draft: { label: "Draft", tone: "muted" },
  scheduled: { label: "Scheduled", tone: "info" },
  running: { label: "Running", tone: "warning" },
  complete: { label: "Complete", tone: "success" },
  error: { label: "Error", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "muted" },
};

interface CampaignColumnsOptions {
  onView: (id: string) => void;
  onEdit: (campaign: Campaign) => void;
  onSchedule: (campaign: Campaign) => void;
  onCancel: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}

export const getEmailCampaignColumns = ({
  onView,
  onEdit,
  onSchedule,
  onCancel,
  onDelete,
}: CampaignColumnsOptions): ColumnDef<Campaign>[] => [
  {
    id: "sno",
    header: "S.No",
    meta: { label: "S.No", cell: { variant: "custom", headerIcon: Hash } },
    size: 72,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination || { pageIndex: 0, pageSize: 20 };
      const idx = table.getRowModel().rows.findIndex((r) => r.id === row.id);
      return (
        <span className="text-[12px] tabular-nums pl-1">
          {pageIndex * pageSize + (idx !== -1 ? idx : row.index) + 1}
        </span>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Campaign Name",
    meta: { label: "Campaign Name", cell: { variant: "custom", headerIcon: Mail } },
    size: 240,
    cell: ({ row }) => {
      const c = row.original;
      return (
        <button
          onClick={() => onView(c.id)}
          className="text-left font-semibold text-primary hover:underline truncate max-w-[220px] block"
        >
          {c.name}
        </button>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { label: "Status", cell: { variant: "custom" } },
    size: 110,
    cell: ({ row }) => {
      const cfg = STATUS_CONFIG[row.original.status] ?? STATUS_CONFIG.draft;
      return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
    },
  },
  {
    accessorKey: "scheduledAt",
    header: "Scheduled",
    meta: { label: "Scheduled", cell: { variant: "custom", headerIcon: Calendar } },
    size: 130,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.scheduledAt ? getReadableDate(row.original.scheduledAt) : "—"}
      </span>
    ),
  },
  {
    id: "template",
    header: "Template",
    meta: { label: "Template", cell: { variant: "custom" } },
    size: 200,
    cell: ({ row }) => (
      <span className="text-sm truncate block max-w-[180px]">
        {row.original.emailTemplate?.name ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "totalRecipients",
    header: "Recipients",
    meta: { label: "Recipients", cell: { variant: "custom", headerIcon: Users } },
    size: 120,
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">{row.original.totalRecipients ?? "—"}</span>
    ),
  },
  {
    id: "delivered",
    header: "Delivered %",
    meta: { label: "Delivered %", cell: { variant: "custom", headerIcon: Send } },
    size: 115,
    cell: ({ row }) => {
      const c = row.original;
      return <span className="tabular-nums text-sm">{pct(c.sentCount, c.totalRecipients)}</span>;
    },
  },
  {
    id: "openRate",
    header: "Open Rate",
    meta: { label: "Open Rate", cell: { variant: "custom", headerIcon: Eye } },
    size: 105,
    cell: ({ row }) => {
      const c = row.original;
      return <span className="tabular-nums text-sm">{pct(c.openCount, c.sentCount)}</span>;
    },
  },
  {
    id: "clickRate",
    header: "Click Rate",
    meta: { label: "Click Rate", cell: { variant: "custom", headerIcon: MousePointerClick } },
    size: 105,
    cell: ({ row }) => {
      const c = row.original;
      return <span className="tabular-nums text-sm">{pct(c.clickCount, c.sentCount)}</span>;
    },
  },
  {
    id: "actions",
    header: () => "",
    meta: { label: "Actions" },
    enableSorting: false,
    enableHiding: false,
    size: 60,
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="flex justify-end pr-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onView(c.id)}>
                <BarChart2 className="mr-2 size-3.5" />
                View Report
              </DropdownMenuItem>

              {c.status === "draft" && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(c)}>
                    <Pencil className="mr-2 size-3.5" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSchedule(c)}>
                    <CalendarClock className="mr-2 size-3.5" />
                    Schedule
                  </DropdownMenuItem>
                </>
              )}

              {c.status === "error" && (
                <DropdownMenuItem onClick={() => onSchedule(c)}>
                  <CalendarClock className="mr-2 size-3.5" />
                  Reschedule
                </DropdownMenuItem>
              )}

              {(c.status === "scheduled" || c.status === "draft") && (
                <DropdownMenuItem
                  onClick={() => onCancel(c)}
                  className="text-warning focus:text-warning"
                >
                  <XCircle className="mr-2 size-3.5" />
                  Cancel
                </DropdownMenuItem>
              )}

              {(c.status === "draft" || c.status === "error" || c.status === "cancelled") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(c)}
                    className="text-danger focus:text-danger"
                  >
                    <Trash2 className="mr-2 size-3.5" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
