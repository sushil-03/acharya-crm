import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, XCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui-kit";
import { Enrollment } from "../hook/query/use-get-enrollment";
import { useRetrySyncEnrollment } from "../hook/mutation/use-retry-sync-enrollment";
import { useCancelEnrollment } from "../hook/mutation/use-cancel-enrollment";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function EnrollmentHeader({ enrollment }: { enrollment: Enrollment }) {
  const { mutate: retrySync, isPending: isRetryPending } = useRetrySyncEnrollment();
  const { mutate: cancelEnrollment, isPending: isCancelPending } = useCancelEnrollment();
  const [cancelReason, setCancelReason] = useState("");

  const getStatusTone = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "confirmed":
        return "success";
      case "cancelled":
        return "destructive";
      default:
        return "muted";
    }
  };

  const studentName =
    `${enrollment.student.firstName} ${enrollment.student.lastName === "-" ? "" : enrollment.student.lastName}`.trim() ||
    "Unknown";
  const initials = studentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0 h-14">
      <div className="flex items-center gap-4">
        <Link to="/enrollment" className="text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-gradient-brand grid place-items-center text-white font-bold text-xs">
            {initials}
          </div>
          <div className="flex flex-col">
            <h1 className="font-semibold text-[15px] leading-tight">{studentName}</h1>
            <span className="text-xs text-muted-foreground font-mono">
              ID: {enrollment.studentIdGenerated || "Pending"}
            </span>
          </div>
          <Badge
            tone={getStatusTone(enrollment.enrollmentStatus) as any}
            className="ml-2 h-6 text-xs uppercase tracking-wider"
          >
            {enrollment.enrollmentStatus}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {enrollment.erpSyncStatus !== "synced" && (
          <Button
            variant="outline"
            disabled={isRetryPending}
            onClick={() => retrySync(enrollment.id)}
          >
            {isRetryPending ? (
              <Loader2 className="size-4 animate-spin mr-1.5" />
            ) : (
              <RefreshCw className="size-4 mr-1.5" />
            )}
            Retry Sync
          </Button>
        )}

        {enrollment.enrollmentStatus !== "cancelled" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isCancelPending}>
                {isCancelPending ? (
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                ) : (
                  <XCircle className="size-4 mr-1.5" />
                )}
                Cancel Enrollment
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Enrollment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this enrollment for {studentName}? This action
                  cannot be undone. Please provide a reason below.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="my-4">
                <Input
                  placeholder="Reason for cancellation"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Go Back</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                  disabled={!cancelReason.trim()}
                  onClick={() => {
                    cancelEnrollment({ id: enrollment.id, payload: { reason: cancelReason } });
                  }}
                >
                  Confirm Cancel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
