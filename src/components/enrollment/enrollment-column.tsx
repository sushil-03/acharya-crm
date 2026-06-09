import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui-kit";
import { Hash, User, Milestone, Building2, BookOpen, Clock } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import { Enrollment } from "./hook/query/use-get-enrollment";
import { useGetPrograms } from "../global/hooks/use-get-programs";
import { useGetCampuses } from "../global/hooks/use-get-campuses";
import { Mail } from "lucide-react";
import { capitalizeWords } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { RefreshCw, XCircle, Loader2 } from "lucide-react";
import { useRetrySyncEnrollment } from "./hook/mutation/use-retry-sync-enrollment";
import { useCancelEnrollment } from "./hook/mutation/use-cancel-enrollment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const RetrySyncButton = ({ enrollmentId }: { enrollmentId: string }) => {
  const { mutate: retrySync, isPending } = useRetrySyncEnrollment();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="size-8 shrink-0"
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation();
        retrySync(enrollmentId);
      }}
      title="Retry Sync"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <RefreshCw className="size-4 text-muted-foreground hover:text-foreground" />
      )}
    </Button>
  );
};

const CancelEnrollmentButton = ({ enrollmentId }: { enrollmentId: string }) => {
  const { mutate: cancelEnrollment, isPending } = useCancelEnrollment();
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 hover:bg-destructive/10"
          disabled={isPending}
          title="Cancel Enrollment"
          onClick={(e) => e.stopPropagation()}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin text-destructive" />
          ) : (
            <XCircle className="size-4 text-destructive" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Cancel Enrollment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this enrollment? This action cannot be undone. Please
            provide a reason below.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <Input
            placeholder="Reason for cancellation"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Go Back</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={!reason.trim() || isPending}
            onClick={() => {
              cancelEnrollment(
                { id: enrollmentId, payload: { reason } },
                {
                  onSuccess: () => setOpen(false),
                }
              );
            }}
          >
            Confirm Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ProgramCell = ({ programId }: { programId: string }) => {
  const { data: programs } = useGetPrograms();
  const program = programs?.find((p) => p.id === programId);
  return <div className="font-medium truncate max-w-[180px]">{program?.name || programId}</div>;
};

const CampusCell = ({ campusId }: { campusId: string }) => {
  const { data: campuses } = useGetCampuses();
  const campus = campuses?.find((c) => c.id === campusId);
  return <div className="font-medium truncate max-w-[130px]">{campus?.name || campusId}</div>;
};

export const getEnrollmentColumns: ColumnDef<Enrollment>[] = [
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
    accessorKey: "studentIdGenerated",
    header: "Student ID",
    meta: { label: "Student ID", cell: { variant: "short-text" } },
    size: 140,
    cell: ({ row }) => {
      return (
        <span className="font-mono text-[12px] font-medium text-muted-foreground">
          {row.original.studentIdGenerated || "Pending"}
        </span>
      );
    },
  },
  {
    id: "student",
    header: "Name",
    meta: { label: "Name", cell: { variant: "custom", headerIcon: User } },
    size: 200,
    cell: ({ row }) => {
      const student = row.original.student;
      const name =
        `${student?.firstName || ""} ${student?.lastName === "-" ? "" : student?.lastName || ""}`.trim();

      return (
        <Link
          to="/enrollment/$enrollmentId"
          params={{ enrollmentId: row.original.id }}
          className="flex items-center gap-2.5"
        >
          <span className="font-semibold text-foreground hover:text-primary truncate">{name}</span>
        </Link>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { label: "Email", cell: { variant: "custom", headerIcon: Mail } },
    size: 200,
    cell: ({ row }) => {
      return <div className="text-[13px] ">{row.original.student?.email}</div>;
    },
  },
  {
    accessorKey: "programId",
    header: "Program",
    meta: { label: "Program", cell: { variant: "custom", headerIcon: BookOpen } },
    size: 200,
    cell: ({ row }) => <ProgramCell programId={row.original.programId} />,
  },
  {
    accessorKey: "campusId",
    header: "Campus",
    meta: { label: "Campus", cell: { variant: "custom", headerIcon: Building2 } },
    size: 150,
    cell: ({ row }) => <CampusCell campusId={row.original.campusId} />,
  },
  {
    accessorKey: "enrollmentStatus",
    header: "Status",
    meta: { label: "Status", cell: { variant: "custom", headerIcon: Milestone } },
    size: 120,
    cell: ({ row }) => {
      const status = row.original.enrollmentStatus;
      const isConfirmed = status.toLowerCase() === "confirmed";
      return (
        <div className="flex items-center justify-between gap-2 pr-2">
          <Badge tone={isConfirmed ? "success" : "warning"}>{capitalizeWords(status)}</Badge>
          {isConfirmed && <CancelEnrollmentButton enrollmentId={row.original.id} />}
        </div>
      );
    },
  },
  {
    accessorKey: "erpSyncStatus",
    header: "ERP Sync",
    meta: { label: "ERP Sync", cell: { variant: "custom", headerIcon: Clock } },
    size: 120,
    cell: ({ row }) => {
      const syncStatus = row.original.erpSyncStatus;
      const isSynced = syncStatus.toLowerCase() === "synced";
      return (
        <div className="flex items-center justify-between gap-2 pr-2">
          <Badge tone={isSynced ? "success" : "warning"}>{capitalizeWords(syncStatus)}</Badge>
          {!isSynced && <RetrySyncButton enrollmentId={row.original.id} />}
        </div>
      );
    },
  },
];
