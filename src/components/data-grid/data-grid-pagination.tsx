import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DataGridPaginationProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  totalElements?: number;
}

export function DataGridPagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50, 100, 200],
  isLoading,
  totalElements,
  className,
  ...props
}: DataGridPaginationProps<TData>) {
  const manualPagination = table.options.manualPagination === true;
  const { pageIndex, pageSize } = table.getState().pagination || {
    pageIndex: 0,
    pageSize: table.getFilteredRowModel()?.rows?.length || 100,
  };
  
  const start = pageIndex * pageSize + 1;
  const renderedCount = table.getRowModel()?.rows?.length || 0;
  const clientTotal = table.getFilteredRowModel()?.rows?.length || 0;
  const total = manualPagination ? (totalElements ?? clientTotal) : clientTotal;
  const end = Math.min(start + renderedCount - 1, total);
  const pageCount = manualPagination ? Math.ceil(total / pageSize) : table.getPageCount();

  return (
    <div
      className={cn(
        "flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-3 sm:flex-row sm:gap-8 bg-muted/20 border-t border-border",
        className,
      )}
      {...props}
    >
      <div className="flex w-full flex-row items-center justify-between gap-2 sm:gap-6">
        <div className="flex flex-1 items-center space-x-2">
          <p className="hidden text-[13px] font-medium whitespace-nowrap md:block text-muted-foreground">
            Rows per page
          </p>
          <p className="block text-[13px] font-medium whitespace-nowrap md:hidden text-muted-foreground">
            Rows
          </p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="w-[70px] h-8 text-[13px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`} className="text-[13px]">
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col items-start justify-center gap-1 text-[13px] font-medium md:flex-row md:items-center md:gap-4">
          <span className="text-muted-foreground">
            {total > 0 ? `Showing ${start}-${end} of ${total}` : ""}
          </span>
          <span className="text-foreground">
            Page {pageIndex + 1} of {Math.max(1, pageCount)}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            aria-label="Go to first page"
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={pageIndex === 0}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            aria-label="Go to previous page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            aria-label="Go to next page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={pageIndex >= pageCount - 1}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            aria-label="Go to last page"
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
