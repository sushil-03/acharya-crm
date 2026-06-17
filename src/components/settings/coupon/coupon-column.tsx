import { Badge } from "@/components/ui-kit";
import { Ticket, Layers, Coins, UserCheck, Calendar, Activity, Pencil, Copy } from "lucide-react";
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Coupon } from "../hook/query/use-get-coupons";
import { toast } from "sonner";
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

interface CouponColumnsOptions {
  onEditCoupon: (coupon: Coupon) => void;
  updateCoupon: (params: { id: string; payload: any }) => Promise<any>;
  refetch: () => void;
}

function formatDiscount(coupon: Coupon): string {
  if (coupon.discountType === "PERCENTAGE") {
    return `${coupon.discountValue}%`;
  }
  return `₹${Number(coupon.discountValue).toLocaleString("en-IN")}`;
}

function formatUses(coupon: Coupon): string {
  const used = coupon.usedCount;
  const max = coupon.maxUses;
  if (max === null) return `${used} / unlimited`;
  return `${used} / ${max}`;
}

function formatValidUntil(coupon: Coupon): string {
  if (!coupon.validUntil) return "No expiry";
  return new Date(coupon.validUntil).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const getCouponColumns = ({
  onEditCoupon,
  updateCoupon,
  refetch,
}: CouponColumnsOptions): ColumnDef<Coupon>[] => [
  {
    accessorKey: "code",
    header: "Code",
    meta: { label: "Code", cell: { variant: "custom", headerIcon: Ticket } },
    size: 260,
    cell: ({ row }) => {
      const code = row.original.code;
      return (
        <div className="flex flex-col py-1">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-semibold text-foreground select-all break-all leading-tight">
              {code}
            </span>
            <button
              className="flex items-center justify-center h-5 w-5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(code);
                toast.success(`Copied: ${code}`);
              }}
              title="Copy code"
            >
              <Copy className="size-3" />
            </button>
          </div>
          {row.original.description && (
            <span className="text-[11px] text-muted-foreground mt-0.5 break-words max-w-[240px]">
              {row.original.description}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "discountType",
    header: "Type",
    meta: { label: "Type", cell: { variant: "custom", headerIcon: Layers } },
    size: 120,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.discountType === "PERCENTAGE" ? "Percentage" : "Flat"}
      </span>
    ),
  },
  {
    accessorKey: "discountValue",
    header: "Value",
    meta: { label: "Value", cell: { variant: "custom", headerIcon: Coins } },
    size: 180,
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {formatDiscount(row.original)}
        {row.original.maxDiscountAmt && (
          <span className="text-[11px] text-muted-foreground ml-1">
            (max ₹{Number(row.original.maxDiscountAmt).toLocaleString("en-IN")})
          </span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "usedCount",
    header: "Uses",
    meta: { label: "Uses", cell: { variant: "custom", headerIcon: UserCheck } },
    size: 140,
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">{formatUses(row.original)}</span>
    ),
  },
  {
    accessorKey: "validUntil",
    header: "Valid Until",
    meta: { label: "Valid Until", cell: { variant: "custom", headerIcon: Calendar } },
    size: 140,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{formatValidUntil(row.original)}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    meta: { label: "Status", cell: { variant: "custom", headerIcon: Activity } },
    size: 150,
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      const [confirmOpen, setConfirmOpen] = React.useState(false);

      return (
        <div className="flex items-center gap-2 px-1" onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={isActive}
            onCheckedChange={() => setConfirmOpen(true)}
            className="cursor-pointer"
          />
          <span
            className={
              isActive
                ? "text-primary font-medium text-xs"
                : "text-muted-foreground font-medium text-xs"
            }
          >
            {isActive ? "Active" : "Inactive"}
          </span>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isActive ? "Disable Coupon?" : "Enable Coupon?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to {isActive ? "disable" : "enable"} the coupon code{" "}
                  <strong className="text-foreground">{row.original.code}</strong>?
                  {isActive && " Students will no longer be able to use this coupon."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      await updateCoupon({
                        id: row.original.id,
                        payload: { isActive: !isActive },
                      });
                      refetch();
                      toast.success(`Coupon ${isActive ? "disabled" : "enabled"} successfully`);
                    } catch (err) {
                      toast.error("Failed to update status");
                    }
                  }}
                  className={isActive ? "bg-destructive hover:bg-destructive/90 text-white" : ""}
                >
                  {isActive ? "Disable" : "Enable"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => "",
    meta: { label: "Actions", cell: { variant: "custom", noPadding: true } },
    size: 80,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-center size-full">
        <Button
          size="icon"
          variant="ghost"
          title="Edit"
          onClick={(e) => {
            e.stopPropagation();
            onEditCoupon(row.original);
          }}
          className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer"
        >
          <Pencil className="size-4" />
        </Button>
      </div>
    ),
  },
];
