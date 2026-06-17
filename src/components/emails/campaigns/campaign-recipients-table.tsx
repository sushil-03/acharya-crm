import React, { useState } from "react";
import { Loader2, User, Mail, Clock, MousePointerClick, Eye, AlertCircle } from "lucide-react";
import InputSearch from "@/components/global/input-search";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui-kit";
import { DataGrid } from "@/components/data-grid/data-grid";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import { useDataGrid } from "@/hooks/use-data-grid";
import { Card } from "@/components/ui-kit";
import { useGetCampaignRecipients } from "./hooks/query/use-get-campaign-recipients";
import type { CampaignRecipient, CampaignRecipientStatus } from "./types";

const STATUS_CONFIG: Record<
  CampaignRecipientStatus,
  { label: string; tone: React.ComponentProps<typeof Badge>["tone"] }
> = {
  pending: { label: "Pending", tone: "muted" },
  sent: { label: "Sent", tone: "info" },
  failed: { label: "Failed", tone: "danger" },
  opened: { label: "Opened", tone: "success" },
  clicked: { label: "Clicked", tone: "primary" },
};

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const COLUMNS: ColumnDef<CampaignRecipient>[] = [
  {
    id: "name",
    header: "Name",
    meta: { label: "Name", cell: { variant: "custom", headerIcon: User } },
    size: 180,
    cell: ({ row }) => (
      <span className="font-medium text-xs">{row.original.lead.name}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { label: "Email", cell: { variant: "custom", headerIcon: Mail } },
    size: 220,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { label: "Status", cell: { variant: "custom" } },
    size: 100,
    cell: ({ row }) => {
      const cfg = STATUS_CONFIG[row.original.status] ?? STATUS_CONFIG.pending;
      return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
    },
  },
  {
    accessorKey: "sentAt",
    header: "Sent At",
    meta: { label: "Sent At", cell: { variant: "custom", headerIcon: Clock } },
    size: 150,
    cell: ({ row }) => (
      <span className="text-xs tabular-nums text-muted-foreground">
        {formatTime(row.original.sentAt)}
      </span>
    ),
  },
  {
    accessorKey: "openedAt",
    header: "Opened At",
    meta: { label: "Opened At", cell: { variant: "custom", headerIcon: Eye } },
    size: 150,
    cell: ({ row }) => (
      <span className="text-xs tabular-nums text-muted-foreground">
        {formatTime(row.original.openedAt)}
      </span>
    ),
  },
  {
    accessorKey: "clickedAt",
    header: "Clicked At",
    meta: { label: "Clicked At", cell: { variant: "custom", headerIcon: MousePointerClick } },
    size: 150,
    cell: ({ row }) => (
      <span className="text-xs tabular-nums text-muted-foreground">
        {formatTime(row.original.clickedAt)}
      </span>
    ),
  },
  {
    accessorKey: "failReason",
    header: "Fail Reason",
    meta: { label: "Fail Reason", cell: { variant: "custom", headerIcon: AlertCircle } },
    size: 200,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.failReason ?? "—"}</span>
    ),
  },
];

const PAGE_SIZE = 20;

interface CampaignRecipientsTableProps {
  campaignId: string;
}

export function CampaignRecipientsTable({ campaignId }: CampaignRecipientsTableProps) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignRecipientStatus | "all">("all");

  const { data, isLoading } = useGetCampaignRecipients(campaignId, {
    page,
    pageSize: PAGE_SIZE,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: q || undefined,
  });

  const recipients = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const dataGrid = useDataGrid({
    data: recipients,
    columns: COLUMNS,
    readOnly: true,
    manualPagination: true,
    state: {
      pagination: { pageIndex: page - 1, pageSize: PAGE_SIZE },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater({ pageIndex: page - 1, pageSize: PAGE_SIZE });
        setPage(next.pageIndex + 1);
      } else {
        setPage(updater.pageIndex + 1);
      }
    },
  });

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2">
        <InputSearch
          searchTerm={q}
          setSearchTerm={(val) => { setQ(val); setPage(1); }}
          className="h-7"
          placeholder="Search by name or email..."
        />
        <div className="flex items-center gap-2 ml-auto">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as CampaignRecipientStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger size="sm" className="w-[140px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="opened">Opened</SelectItem>
              <SelectItem value="clicked">Clicked</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5 border-s pl-2 border-border">
            <DataGridViewMenu table={dataGrid.table} />
            <DataGridRowHeightMenu table={dataGrid.table} />
          </div>
        </div>
      </div>

      {/* DataGrid */}
      <Card className="overflow-hidden flex flex-col" style={{ minHeight: 300 }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <DataGrid
            {...dataGrid}
            stretchColumns
            showPagination
            totalElements={total}
            className="flex-1"
          />
        )}
      </Card>
    </div>
  );
}
