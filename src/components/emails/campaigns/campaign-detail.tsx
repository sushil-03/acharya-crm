import React, { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Loader2,
  Send,
  Eye,
  MousePointerClick,
  AlertTriangle,
  Users,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { PageHeader, StatCard, Badge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
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

import { useGetEmailCampaign } from "./hooks/query/use-get-email-campaign";
import { useCancelEmailCampaign } from "./hooks/mutation/use-cancel-email-campaign";
import { CampaignRecipientsTable } from "./campaign-recipients-table";
import type { CampaignStatus } from "./types";
import { getReadableDate } from "@/lib/utils";
import { ca } from "zod/v4/locales";

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

interface CampaignDetailProps {
  campaignId: string;
}

export function CampaignDetail({ campaignId }: CampaignDetailProps) {
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

  const { data: campaign, isLoading, refetch } = useGetEmailCampaign(campaignId);
  const { mutateAsync: cancelCampaign, isPending: isCancelling } = useCancelEmailCampaign();
  console.log("Campaign", campaign);
  // Poll every 5 seconds while status is "running"
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (campaign?.status === "running") {
      pollRef.current = setInterval(() => refetch(), 10000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [campaign?.status, refetch]);

  const handleCancel = async () => {
    if (!campaign) return;
    try {
      await cancelCampaign(campaign.id);
      toast.success("Campaign cancelled");
      setShowCancelDialog(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel campaign");
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!campaign) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
          <p className="text-danger font-semibold">Campaign not found</p>
        </div>
      </AppShell>
    );
  }

  const statusCfg = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.draft;

  return (
    <AppShell noPadding>
      <PageHeader
        title={campaign.name}
        handleBack={() => navigate({ to: "/email-campaigns" })}
        actions={
          <div className="flex items-center gap-2 py-0.75">
            <Badge tone={statusCfg.tone} className="text-[12px] px-3 py-1">
              {statusCfg.label}
              {campaign.status === "running" && <Loader2 className="size-3 ml-1.5 animate-spin" />}
            </Badge>
            {(campaign.status === "scheduled" || campaign.status === "draft") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
                disabled={isCancelling}
                className="text-warning border-warning/30 hover:bg-warning/10"
              >
                Cancel Campaign
              </Button>
            )}
          </div>
        }
      />

      <div className="p-3 flex flex-col gap-4  border-t">
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {campaign.emailTemplate && (
            <span className="flex items-center gap-1">
              Template:
              <button
                type="button"
                onClick={() => navigate({ to: "/email-templates" })}
                className="text-foreground font-medium hover:text-primary inline-flex items-center gap-1 transition-colors"
              >
                {campaign.emailTemplate.name}
                <ExternalLink className="size-3 shrink-0" />
              </button>
            </span>
          )}
          {campaign.scheduledAt && (
            <span>
              Scheduled:{" "}
              <span className="text-foreground font-medium">
                {getReadableDate(campaign.scheduledAt)}
              </span>
            </span>
          )}
          {campaign.completedAt && (
            <span>
              Completed:{" "}
              <span className="text-foreground font-medium">
                {getReadableDate(campaign.completedAt)}
              </span>
            </span>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard
            label="Emails Sent"
            value={campaign.sentCount.toString()}
            icon={<Send className="size-4" />}
            accent="info"
          />
          <StatCard
            label="Delivered %"
            value={pct(campaign.sentCount, campaign.totalRecipients)}
            icon={<Users className="size-4" />}
            accent="primary"
          />
          <StatCard
            label="Open Rate"
            value={pct(campaign.openCount, campaign.sentCount)}
            icon={<Eye className="size-4" />}
            accent="success"
          />
          <StatCard
            label="Click Rate"
            value={pct(campaign.clickCount, campaign.sentCount)}
            icon={<MousePointerClick className="size-4" />}
            accent="gold"
          />
          <StatCard
            label="Failed"
            value={campaign.failedCount.toString()}
            icon={<AlertTriangle className="size-4" />}
            accent="warning"
          />
        </div>

        {/* Recipients table */}
        <CampaignRecipientsTable campaignId={campaignId} />
      </div>

      {/* Cancel dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel{" "}
              <strong className="text-foreground">"{campaign.name}"</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-warning hover:bg-warning/90 text-white"
            >
              {isCancelling ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
              Cancel Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
