import { ColumnDef } from "@tanstack/react-table";
import { Payment } from "./hook/query/use-get-all-payments";
import { Badge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  CheckCircle,
  RotateCcw,
  Calendar,
  Hash,
  User,
  Mail,
  Banknote,
  Tag,
  Wallet,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useState } from "react";
import { useConfirmPayment } from "./hook/mutation/use-confirm-payment";
import { useRefundPayment } from "./hook/mutation/use-refund-payment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getReadableDate } from "@/lib/utils";

const PaymentActions = ({ payment }: { payment: Payment }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [reason, setReason] = useState("");

  const confirmMutation = useConfirmPayment();
  const refundMutation = useRefundPayment();

  const handleConfirm = () => {
    confirmMutation.mutate(
      { id: payment.id, payload: { notes, referenceNumber } },
      { onSuccess: () => setConfirmOpen(false) },
    );
  };

  const handleRefund = () => {
    refundMutation.mutate(
      { id: payment.id, payload: { reason } },
      { onSuccess: () => setRefundOpen(false) },
    );
  };

  return (
    <>
      <div className="flex w-full items-center justify-center gap-1 h-full">
        {payment.paymentStatus !== "completed" && payment.paymentStatus !== "refunded" && (
          <Button
            size={"sm"}
            variant="light-success"
            tooltip="Confirm"
            // className="text-success hover:text-success hover:bg-success/10"
            onClick={() => setConfirmOpen(true)}
            title="Accept (Confirm)"
          >
            <CheckCircle className="size-3" />
          </Button>
        )}
        {payment.paymentStatus === "completed" && (
          <Button
            variant="light-destructive"
            size={"sm"}
            tooltip="Refund"
            // className=" text-muted-foreground hover:text-foreground"
            onClick={() => setRefundOpen(true)}
            title="Refund"
          >
            <RotateCcw className="size-3" />
          </Button>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>Confirm this payment to mark it as completed.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Enter reference number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={confirmMutation.isPending || !referenceNumber}
            >
              {confirmMutation.isPending ? "Confirming..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to refund this payment? Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Refund</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for refund"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={refundMutation.isPending || !reason}
              variant="destructive"
            >
              {refundMutation.isPending ? "Refunding..." : "Confirm Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "id",
    header: "Payment ID",
    meta: { cell: { variant: "custom", headerIcon: Hash } },
    cell: ({ row }) => (
      <div className="font-mono ">{row.original.id.slice(0, 8).toUpperCase()}</div>
    ),
  },
  {
    id: "student",
    header: "Student",
    accessorFn: (row) =>
      `${row.student?.firstName} ${" "} ${row.student?.lastName === "-" ? "" : row.student?.lastName || ""}`,
    meta: { cell: { variant: "custom", headerIcon: User } },
    cell: ({ row }) => (
      <div>
        <div className="font-medium">
          {row.original.student?.firstName}{" "}
          {row.original.student?.lastName === "-" ? "" : row.original.student?.lastName || ""}
        </div>
      </div>
    ),
  },
  {
    id: "email",
    header: "Email",
    accessorFn: (row) => `${row.student?.email}`,
    meta: { cell: { variant: "custom", headerIcon: Mail } },
    cell: ({ row }) => <div>{row.original.student?.email}</div>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    meta: { cell: { variant: "custom", headerIcon: Banknote } },
    cell: ({ row }) => (
      <div className="font-medium">
        {new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: row.original.currency || "INR",
        }).format(Number(row.original.amount))}
      </div>
    ),
  },
  {
    accessorKey: "paymentType",
    header: "Type",
    meta: { cell: { variant: "custom", headerIcon: Tag } },
    cell: ({ row }) => (
      <div className="capitalize">{row.original.paymentType?.replace("_", " ")}</div>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    meta: { cell: { variant: "custom", headerIcon: Wallet } },
    cell: ({ row }) => <div className="capitalize">{row.original.paymentMethod}</div>,
  },
  {
    accessorKey: "paymentStatus",
    header: "Status",
    meta: { cell: { variant: "custom", headerIcon: Activity } },
    cell: ({ row }) => {
      const status = row.original.paymentStatus;
      return (
        <Badge
          tone={
            status === "completed"
              ? "success"
              : status === "failed"
                ? "danger"
                : status === "refunded"
                  ? "muted"
                  : "warning"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    meta: { label: "Created Date", cell: { variant: "custom", headerIcon: Calendar } },
    cell: ({ row }) => <div className="text-sm">{getReadableDate(row.original.createdAt)}</div>,
  },
  {
    id: "actions",
    meta: { cell: { variant: "custom", noPadding: true } },
    cell: ({ row }) => <PaymentActions payment={row.original} />,
  },
];
