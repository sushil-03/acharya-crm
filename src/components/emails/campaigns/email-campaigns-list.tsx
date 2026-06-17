import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Mail,
  Send,
  CheckCircle2,
  Loader2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, StatCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataGrid } from "@/components/data-grid/data-grid";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import { useDataGrid } from "@/hooks/use-data-grid";

import { useGetEmailCampaigns } from "./hooks/query/use-get-email-campaigns";
import { useDeleteEmailCampaign } from "./hooks/mutation/use-delete-email-campaign";
import { useCancelEmailCampaign } from "./hooks/mutation/use-cancel-email-campaign";
import { getEmailCampaignColumns } from "./email-campaign-columns";
import { CreateCampaignModal } from "./create-campaign-modal";
import { ScheduleCampaignModal } from "./schedule-campaign-modal";
import type { Campaign, CampaignStatus } from "./types";

const STATUS_OPTIONS: { value: CampaignStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "running", label: "Running" },
  { value: "complete", label: "Complete" },
  { value: "error", label: "Error" },
  { value: "cancelled", label: "Cancelled" },
];

export function EmailCampaignsList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [createOpen, setCreateOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [scheduleCampaign, setScheduleCampaign] = useState<Campaign | null>(null);
  const [deleteCampaign, setDeleteCampaign] = useState<Campaign | null>(null);

  const { data, isLoading, error } = useGetEmailCampaigns({
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    pageSize,
  });

  const { mutateAsync: deleteCampaignFn } = useDeleteEmailCampaign();
  const { mutateAsync: cancelCampaignFn } = useCancelEmailCampaign();

  const campaigns = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const handleView = (id: string) => navigate({ to: `/email-campaigns/${id}` });

  const handleEdit = (campaign: Campaign) => setEditCampaign(campaign);

  const handleSchedule = (campaign: Campaign) => setScheduleCampaign(campaign);

  const handleCancel = async (campaign: Campaign) => {
    try {
      toast.loading("Cancelling campaign…", { id: "cancel-campaign" });
      await cancelCampaignFn(campaign.id);
      toast.success("Campaign cancelled", { id: "cancel-campaign" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel", {
        id: "cancel-campaign",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteCampaign) return;
    const id = deleteCampaign.id;
    setDeleteCampaign(null);
    try {
      toast.loading("Deleting campaign…", { id: "delete-campaign" });
      await deleteCampaignFn(id);
      toast.success("Campaign deleted", { id: "delete-campaign" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete", {
        id: "delete-campaign",
      });
    }
  };

  const columns = React.useMemo(
    () =>
      getEmailCampaignColumns({
        onView: handleView,
        onEdit: handleEdit,
        onSchedule: handleSchedule,
        onCancel: handleCancel,
        onDelete: (c) => setDeleteCampaign(c),
      }),
    [],
  );

  const dataGrid = useDataGrid({
    data: campaigns,
    columns,
    readOnly: true,
    manualPagination: true,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
    state: {
      pagination: { pageIndex: page - 1, pageSize },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater({ pageIndex: page - 1, pageSize });
        setPage(next.pageIndex + 1);
        setPageSize(next.pageSize);
      } else {
        setPage(updater.pageIndex + 1);
        setPageSize(updater.pageSize);
      }
    },
  });

  const stats = React.useMemo(() => {
    const totalCampaigns = total;
    const running = campaigns.filter((c) => c.status === "running").length;
    const scheduled = campaigns.filter((c) => c.status === "scheduled").length;
    const complete = campaigns.filter((c) => c.status === "complete").length;
    return { totalCampaigns, running, scheduled, complete };
  }, [campaigns, total]);

  if (error) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
          <p className="text-danger font-semibold">Error loading campaigns</p>
          <p className="text-muted-foreground text-xs">{error.message}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell noPadding>
      <PageHeader
        title="Email Campaigns"
        actions={
          <Button
            onClick={() => navigate({ to: "/email-campaigns/new" })}
            className="bg-primary hover:bg-primary/95 text-white"
          >
            <Plus className="size-4 mr-1.5" /> New Campaign
          </Button>
        }
      />

      <div className="p-3 flex flex-col min-h-0 h-full gap-4">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Campaigns"
            value={stats.totalCampaigns.toString()}
            icon={<Mail className="size-4" />}
            accent="primary"
          />
          <StatCard
            label="Running"
            value={stats.running.toString()}
            icon={<Loader2 className="size-4" />}
            accent="warning"
          />
          <StatCard
            label="Scheduled"
            value={stats.scheduled.toString()}
            icon={<Clock className="size-4" />}
            accent="info"
          />
          <StatCard
            label="Completed"
            value={stats.complete.toString()}
            icon={<CheckCircle2 className="size-4" />}
            accent="success"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns by name or category…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as CampaignStatus | "all");
                setPage(1);
              }}
            >
              <SelectTrigger size="sm" className="w-[150px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 border-s pl-3 border-border">
              <DataGridViewMenu table={dataGrid.table} />
              <DataGridRowHeightMenu table={dataGrid.table} />
            </div>
          </div>
        </div>

        {/* DataGrid */}
        <div className="flex flex-col h-full min-h-0 flex-1">
          <Card className="overflow-hidden h-full flex flex-col relative">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="size-8 animate-spin text-primary" />
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
      </div>

      {/* Create / Edit modal */}
      <CreateCampaignModal
        open={createOpen || !!editCampaign}
        onOpenChange={(o) => {
          if (!o) {
            setCreateOpen(false);
            setEditCampaign(null);
          }
        }}
        editCampaign={editCampaign}
      />

      {/* Schedule modal */}
      <ScheduleCampaignModal
        campaign={scheduleCampaign}
        open={!!scheduleCampaign}
        onOpenChange={(o) => !o && setScheduleCampaign(null)}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteCampaign}
        onOpenChange={(o) => !o && setDeleteCampaign(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong className="text-foreground">"{deleteCampaign?.name}"</strong>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-danger hover:bg-danger/90 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
