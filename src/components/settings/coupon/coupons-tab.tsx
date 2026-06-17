import * as React from "react";
import { Search, Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui-kit";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import { getCouponColumns } from "./coupon-column";
import type { Coupon } from "../hook/query/use-get-coupons";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";

interface CouponsTabProps {
  coupons: Coupon[];
  isLoading: boolean;
  total: number;
  search: string;
  setSearch: (s: string) => void;
  page: number;
  setPage: (p: number | ((p: number) => number)) => void;
  pageSize: number;
  setPageSize: (p: number | ((p: number) => number)) => void;
  onEditCoupon: (coupon: Coupon) => void;
  updateCoupon: any;
  refetch: () => void;
}

export function CouponsTab({
  coupons,
  isLoading,
  total,
  search,
  setSearch,
  page,
  setPage,
  pageSize,
  setPageSize,
  onEditCoupon,
  updateCoupon,
  refetch,
}: CouponsTabProps) {
  const columns = React.useMemo(
    () => getCouponColumns({ onEditCoupon, updateCoupon, refetch }),
    [onEditCoupon, updateCoupon, refetch],
  );

  const dataGrid = useDataGrid({
    data: coupons,
    columns,
    readOnly: true,
    manualPagination: true,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex: page - 1, pageSize });
        setPage(newState.pageIndex + 1);
        setPageSize(newState.pageSize);
      } else {
        setPage(updater.pageIndex + 1);
        setPageSize(updater.pageSize);
      }
    },
  });

  return (
    <Card className="flex flex-col h-full overflow-hidden border-none p-0 rounded-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3 shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by code or description…"
            className="pl-8 h-8 text-[13px]"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DataGridViewMenu table={dataGrid.table} />
          <DataGridRowHeightMenu table={dataGrid.table} />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 relative">
        {isLoading ? (
          <div className="space-y-0 divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
            <div className="size-12 rounded-2xl bg-muted grid place-items-center">
              <Ticket className="size-5 text-muted-foreground" />
            </div>
            <div className="font-semibold text-[14px]">No coupons yet</div>
            <p className="text-[13px] text-muted-foreground max-w-xs">
              Create a coupon to offer discounts on application fees.
            </p>
          </div>
        ) : (
          <DataGrid
            {...dataGrid}
            stretchColumns
            showPagination
            totalElements={total}
            className="flex-1 h-full min-h-0"
          />
        )}
      </div>
    </Card>
  );
}
