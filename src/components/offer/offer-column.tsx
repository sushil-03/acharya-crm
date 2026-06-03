import { ColumnDef } from "@tanstack/react-table";
import { Offer } from "./hook/query/use-get-all-offer";
import { Badge } from "@/components/ui-kit";
import { format } from "date-fns";
import { Hash, Plus, Send, CheckSquare, Eye, Lock } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AttachScholarshipModal } from "./attach-scholarship-modal";
import { Row } from "@tanstack/react-table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useReleaseOffer } from "./hook/mutation/use-update-offer";
import { useConfirmPayment } from "@/components/payment/hook/mutation/use-confirm-payment";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { capitalizeWords, formatCurrency, getReadableDate } from "@/lib/utils";

import { useNavigate } from "@tanstack/react-router";
import { useUserStore } from "@/store/use-user-store";

function OfferStudentCell({ row }: { row: Row<Offer> }) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate({ to: "/offer/$offerId", params: { offerId: row.original.id } });
  };

  return (
    <div onClick={handleClick} className="cursor-pointer flex items-center h-full w-full">
      <span className="text-sm font-semibold text-foreground hover:text-primary hover:underline truncate">
        {row.original.student?.firstName} {row.original.student?.lastName}
      </span>
    </div>
  );
}

function OfferScholarshipCell({ row }: { row: Row<Offer> }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const scholarships = row.original.scholarships || [];
  const { user } = useUserStore();
  const isAdmin = user?.role === "super_admin";

  const getTone = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success-light";
      case "rejected":
        return "danger-light";
      case "pending":
        return "warning-light";
      default:
        return "primary-light";
    }
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate({ to: "/offer/$offerId", params: { offerId: row.original.id } });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 h-full px-2">
      {scholarships.length > 0 ? (
        <>
          <TooltipProvider delayDuration={200}>
            {scholarships.slice(0, 1).map((s) => (
              <Tooltip key={s.id}>
                <TooltipTrigger asChild>
                  <span className="inline-flex cursor-help">
                    <Badge
                      tone={getTone(s.approvalStatus) as any}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {capitalizeWords(s.scholarshipType)} - {s.amountValue}
                    </Badge>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="capitalize">
                    Status: {capitalizeWords(s.approvalStatus) || "Pending"}
                  </p>
                  {s.approvalStatus?.toLowerCase() === "rejected" &&
                    ((s as any).reason || (s as any).rejectionReason) && (
                      <p className="text-xs text-muted-foreground mt-1 max-w-[250px] whitespace-normal">
                        Reason: {(s as any).reason || (s as any).rejectionReason}
                      </p>
                    )}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
          {scholarships.length > 1 && (
            <Badge
              tone={"muted" as any}
              className="text-[10px] px-1.5 py-0 cursor-pointer hover:opacity-80"
              onClick={handleMoreClick}
            >
              +{scholarships.length - 1}
            </Badge>
          )}
          {row.original.status === "draft" &&
            (!isAdmin ? (
              <Button
                variant="secondary"
                size="icon"
                className="size-5 rounded opacity-80 cursor-not-allowed"
                tooltip="Only admins can add scholarships"
              >
                <Lock className="size-3 text-muted-foreground" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="size-5 rounded"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(true);
                }}
                tooltip="Add More"
              >
                <Plus className="size-3" />
              </Button>
            ))}
        </>
      ) : row.original.status === "draft" ? (
        !isAdmin ? (
          <Button
            variant="secondary"
            size="sm"
            className="h-6 text-[11px] px-2 opacity-80 cursor-not-allowed"
            tooltip="Only admins can add scholarships"
          >
            <Lock className="size-3 mr-1 text-muted-foreground" /> Add
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[11px] px-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <Plus className="size-3" /> Add
          </Button>
        )
      ) : (
        <span className="text-muted-foreground text-xs pl-2">-</span>
      )}
      <AttachScholarshipModal offerId={row.original.id} open={open} onOpenChange={setOpen} />
    </div>
  );
}

function OfferActionsCell({ row }: { row: Row<Offer> }) {
  const { mutate: releaseOffer, isPending } = useReleaseOffer();
  const { mutate: confirmPayment, isPending: isConfirmPaymentPending } = useConfirmPayment();
  const offer = row.original;
  const payments = (offer as any).payments || [];
  const [open, setOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useUserStore();
  const isAdmin = user?.role === "super_admin";

  const hasPendingScholarships = offer.scholarships?.some(
    (s) => s.approvalStatus?.toLowerCase() === "pending",
  );

  const handleRelease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    releaseOffer(offer.id, {
      onSuccess: () => setOpen(false),
    });
  };

  const studentName =
    `${offer.student?.firstName || ""} ${offer.student?.lastName === "-" ? "" : offer.student?.lastName || ""}`.trim();

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex w-full items-center justify-center h-full gap-2"
    >
      {offer.status === "draft" &&
        (!isAdmin ? (
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-xs px-3 rounded-full opacity-80 cursor-not-allowed"
            tooltip="Only admins can release offers"
          >
            <Lock className="size-3 mr-1.5 text-muted-foreground" /> Release
          </Button>
        ) : (
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="h-7 text-xs px-3 rounded-full">
                <Send className="size-3 mr-1.5" /> Release
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Release Offer</AlertDialogTitle>
                <AlertDialogDescription className="flex flex-col gap-2">
                  <span>
                    Are you sure you want to release this offer to {studentName}? They will be
                    notified immediately. This action cannot be undone.
                  </span>
                  {hasPendingScholarships && (
                    <span className="text-destructive font-medium">
                      Note: There are pending scholarships for this offer. If you release the offer
                      now, these scholarships will not be added.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                <Button variant="default" onClick={handleRelease} disabled={isPending}>
                  {isPending ? "Releasing..." : "Confirm & Release"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ))}

      {offer.status === "released" && (
        <Badge
          tone="info"
          className="h-7 text-xs px-3 rounded-full cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate({ to: "/offer/$offerId", params: { offerId: offer.id } });
          }}
        >
          Decision Pending
        </Badge>
      )}

      {offer.status === "accepted" &&
        payments.length > 0 &&
        payments[0].paymentStatus === "initiated" && (
          <AlertDialog open={paymentOpen} onOpenChange={setPaymentOpen}>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="h-7 text-xs px-3 rounded-full">
                <CheckSquare className="size-3 mr-1.5" />
                Confirm
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to confirm the payment of ₹{payments[0].amount} for{" "}
                  {studentName}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isConfirmPaymentPending}>Cancel</AlertDialogCancel>
                <Button
                  disabled={isConfirmPaymentPending}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const referenceNumber = `txn_mock_${Math.random().toString(36).substring(2, 12)}`;
                    confirmPayment(
                      {
                        id: payments[0].id,
                        payload: {
                          referenceNumber,
                          notes: "Payment processed via 1-click simulated checkout",
                        },
                      },
                      {
                        onSuccess: () => setPaymentOpen(false),
                      },
                    );
                  }}
                >
                  {isConfirmPaymentPending ? "Confirming..." : "Confirm"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
    </div>
  );
}

export const getOffersColumn: ColumnDef<Offer>[] = [
  {
    id: "sno",
    header: "S.No",
    meta: { label: "S.No", cell: { variant: "custom", headerIcon: Hash } },
    size: 60,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return (
        <span className="text-[12px] tabular-nums  pl-1">
          {pageIndex * pageSize + row.index + 1}
        </span>
      );
    },
  },
  {
    id: "student",
    header: "Student",
    accessorFn: (row) =>
      `${row.student?.firstName || ""} ${row.student?.lastName === "-" ? "" : row.student?.lastName || ""}`.trim(),
    meta: { label: "Student", cell: { variant: "custom" } },
    cell: ({ row }) => <OfferStudentCell row={row} />,
  },
  {
    accessorKey: "offerType",
    header: "Offer Type",
    meta: { label: "Offer Type", cell: { variant: "custom" } },

    cell: ({ row }) => {
      const type = row.original.offerType || "";
      const tones: Record<string, string> = {
        standard: "primary-light",
        conditional: "warning-light",
        waitlist: "info-light",
      };
      const tone = tones[type.toLowerCase()] || "muted";

      return (
        <Badge tone={tone as any} className="text-xs capitalize">
          {type.replace(/_/g, " ")}
        </Badge>
      );
    },
  },

  {
    accessorKey: "totalFee",
    header: "Total Fee",
    meta: { label: "Total Fee", cell: { variant: "custom" } },
    cell: ({ row }) => (
      <span className="text-sm font-medium">{formatCurrency(Number(row.original.totalFee))}</span>
    ),
  },

  {
    accessorKey: "netFeePayable",
    header: "Net Fee",
    meta: { label: "Net Fee", cell: { variant: "custom" } },
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {formatCurrency(Number(row.original.netFeePayable))}
      </span>
    ),
  },
  {
    accessorKey: "scholarships",
    header: "Scholarship",
    size: 200,
    meta: { cell: { variant: "custom", noPadding: true } },
    cell: ({ row }) => <OfferScholarshipCell row={row} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { label: "Status", cell: { variant: "custom" } },

    cell: ({ row }) => {
      const status = row.original.status;
      const variants: Record<
        string,
        "default" | "success" | "warning" | "destructive" | "info" | "outline" | "primary"
      > = {
        draft: "info",
        released: "primary",
        accepted: "success",
        rejected: "destructive",
        expired: "warning",
      };

      return (
        <Badge
          tone={(variants[status?.toLowerCase()] || "muted") as any}
          className="text-xs capitalize"
        >
          {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "releasedAt",
    header: "Released Date",
    meta: { label: "Release Date", cell: { variant: "custom" } },

    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.releasedAt
          ? format(new Date(row.original.releasedAt), "dd MMM yyyy, hh:mm a")
          : ""}
      </span>
    ),
  },
  {
    id: "actions",
    accessorFn: (row) =>
      `${row.status}-${JSON.stringify(row.scholarships)}-${JSON.stringify((row as any).payments)}`, // Force re-render on status, scholarship or payment change
    header: "Actions",
    meta: { label: "Actions", cell: { variant: "custom", noPadding: true } },
    size: 120,
    cell: ({ row }) => <OfferActionsCell row={row} />,
  },
];
