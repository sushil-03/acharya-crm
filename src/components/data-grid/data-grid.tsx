"use client";

import { Plus } from "lucide-react";
import * as React from "react";
import { DataGridColumnHeader } from "@/components/data-grid/data-grid-column-header";
import { DataGridContextMenu } from "@/components/data-grid/data-grid-context-menu";
import { DataGridPasteDialog } from "@/components/data-grid/data-grid-paste-dialog";
import { DataGridRow } from "@/components/data-grid/data-grid-row";
import { DataGridSearch } from "@/components/data-grid/data-grid-search";
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination";
import { useAsRef } from "@/hooks/use-as-ref";
import type { useDataGrid } from "@/hooks/use-data-grid";
import { flexRender, getColumnBorderVisibility, getColumnPinningStyle } from "@/lib/data-grid";
import { cn } from "@/lib/utils";
import type { Direction } from "@/types/data-grid";

const EMPTY_CELL_SELECTION_SET = new Set<string>();

interface DataGridProps<TData>
  extends
    Omit<ReturnType<typeof useDataGrid<TData>>, "dir">,
    Omit<React.ComponentProps<"div">, "contextMenu"> {
  dir?: Direction;
  height?: number | string;
  stretchColumns?: boolean;
  showPagination?: boolean;
  totalElements?: number;
  pageSizeOptions?: number[];
}

export function DataGrid<TData>({
  dataGridRef,
  headerRef,
  rowMapRef,
  footerRef,
  dir = "ltr",
  table,
  tableMeta,
  virtualTotalSize,
  virtualItems,
  measureElement,
  columns,
  columnSizeVars,
  searchState,
  searchMatchesByRow,
  activeSearchMatch,
  cellSelectionMap,
  focusedCell,
  editingCell,
  rowHeight,
  contextMenu,
  pasteDialog,
  onRowAdd: onRowAddProp,
  height,
  stretchColumns = false,
  adjustLayout = false,
  showPagination = false,
  totalElements,
  pageSizeOptions,
  className,
  ...props
}: DataGridProps<TData>) {
  const rows = table.getRowModel().rows;
  const readOnly = tableMeta?.readOnly ?? false;
  const columnVisibility = table.getState().columnVisibility;
  const columnPinning = table.getState().columnPinning;

  const hasHeightConstraint = className?.includes("flex-1") || className?.includes("h-") || className?.includes("flex-grow");
  const resolvedMaxHeight = height !== undefined ? height : (hasHeightConstraint ? undefined : 600);

  const onRowAddRef = useAsRef(onRowAddProp);

  const onRowAdd = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onRowAddRef.current?.(event);
    },
    [onRowAddRef],
  );

  const onDataGridContextMenu = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const onFooterCellKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!onRowAddRef.current) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onRowAddRef.current();
      }
    },
    [onRowAddRef],
  );

  return (
    <div
      data-slot="grid-wrapper"
      dir={dir}
      {...props}
      className={cn(
        "relative flex w-full flex-col",
        className?.includes("flex-1") && "min-h-0",
        className?.includes("flex-grow") && "min-h-0",
        className
      )}
    >
      {searchState && <DataGridSearch {...searchState} />}
      <DataGridContextMenu tableMeta={tableMeta} columns={columns} contextMenu={contextMenu} />
      <DataGridPasteDialog tableMeta={tableMeta} pasteDialog={pasteDialog} />
      <div
        role="grid"
        aria-label="Data grid"
        aria-rowcount={rows.length + (onRowAddProp ? 1 : 0)}
        aria-colcount={columns.length}
        data-slot="grid"
        tabIndex={0}
        ref={dataGridRef}
        className={cn(
          "relative grid grid-rows-[auto_1fr_auto] select-none scrollbar-thin rounded-md focus:outline-none flex-1 min-h-0",
          stretchColumns ? "overflow-y-auto overflow-x-hidden" : "overflow-auto",
        )}
        style={{
          ...columnSizeVars,
          "--table-total-size": `${table.getTotalSize()}px`,
          maxHeight: resolvedMaxHeight !== undefined ? (typeof resolvedMaxHeight === "number" ? `${resolvedMaxHeight}px` : resolvedMaxHeight) : undefined,
        } as React.CSSProperties}
        onContextMenu={onDataGridContextMenu}
      >
        <div
          role="rowgroup"
          data-slot="grid-header"
          ref={headerRef}
          className="sticky top-0 z-10 flex flex-col border-b bg-background"
          style={{
            minWidth: "var(--table-total-size)",
          }}
        >
          {table.getHeaderGroups().map((headerGroup, rowIndex) => (
            <div
              key={headerGroup.id}
              role="row"
              aria-rowindex={rowIndex + 1}
              data-slot="grid-header-row"
              tabIndex={-1}
              className="flex w-full"
              style={{
                minWidth: "var(--table-total-size)",
              }}
            >
              {headerGroup.headers.map((header, colIndex) => {
                const sorting = table.getState().sorting;
                const currentSort = sorting.find((sort) => sort.id === header.column.id);
                const isSortable = header.column.getCanSort();

                const nextHeader = headerGroup.headers[colIndex + 1];
                const isLastColumn = colIndex === headerGroup.headers.length - 1;

                const { showEndBorder, showStartBorder } = getColumnBorderVisibility({
                  column: header.column,
                  nextColumn: nextHeader?.column,
                  isLastColumn,
                });

                return (
                  <div
                    key={header.id}
                    role="columnheader"
                    aria-colindex={colIndex + 1}
                    aria-sort={
                      currentSort?.desc === false
                        ? "ascending"
                        : currentSort?.desc === true
                          ? "descending"
                          : isSortable
                            ? "none"
                            : undefined
                    }
                    data-slot="grid-header-cell"
                    tabIndex={-1}
                    className={cn("relative", {
                      grow: stretchColumns && header.column.id !== "select",
                      "border-e": showEndBorder && header.column.id !== "select",
                      "border-s": showStartBorder && header.column.id !== "select",
                    })}
                    style={{
                      ...getColumnPinningStyle({ column: header.column, dir }),
                      width: `calc(var(--header-${header.id}-size) * 1px)`,
                    }}
                  >
                    {header.isPlaceholder ? null : typeof header.column.columnDef.header ===
                      "function" ? (
                      <div className="size-full px-3 py-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    ) : (
                      <DataGridColumnHeader header={header} table={table} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div
          role="rowgroup"
          data-slot="grid-body"
          className="relative"
          style={{
            height: `${virtualTotalSize}px`,
            minWidth: "var(--table-total-size)",
            contain: adjustLayout ? "layout paint" : "strict",
          }}
        >
          {virtualItems.map((virtualItem) => {
            const row = rows[virtualItem.index];
            if (!row) return null;

            const cellSelectionKeys =
              cellSelectionMap?.get(virtualItem.index) ?? EMPTY_CELL_SELECTION_SET;

            const searchMatchColumns = searchMatchesByRow?.get(virtualItem.index) ?? null;
            const isActiveSearchRow = activeSearchMatch?.rowIndex === virtualItem.index;

            return (
              <DataGridRow
                key={row.id}
                row={row}
                tableMeta={tableMeta}
                rowMapRef={rowMapRef}
                virtualItem={virtualItem}
                measureElement={measureElement}
                rowHeight={rowHeight}
                columnVisibility={columnVisibility}
                columnPinning={columnPinning}
                focusedCell={focusedCell}
                editingCell={editingCell}
                cellSelectionKeys={cellSelectionKeys}
                searchMatchColumns={searchMatchColumns}
                activeSearchMatch={isActiveSearchRow ? activeSearchMatch : null}
                dir={dir}
                adjustLayout={adjustLayout}
                stretchColumns={stretchColumns}
                readOnly={readOnly}
              />
            );
          })}
        </div>
        {!readOnly && onRowAdd && (
          <div
            role="rowgroup"
            data-slot="grid-footer"
            ref={footerRef}
            className="sticky bottom-0 z-10 flex flex-col border-t bg-background"
            style={{
              minWidth: "var(--table-total-size)",
            }}
          >
            <div
              role="row"
              aria-rowindex={rows.length + 2}
              data-slot="grid-add-row"
              tabIndex={-1}
              className="flex w-full"
            >
              <div
                role="gridcell"
                tabIndex={0}
                className="relative flex h-9 grow items-center bg-muted/30 transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
                style={{
                  width: table.getTotalSize(),
                  minWidth: table.getTotalSize(),
                }}
                onClick={onRowAdd}
                onKeyDown={onFooterCellKeyDown}
              >
                <div className="sticky start-0 flex items-center gap-2 px-3 text-muted-foreground">
                  <Plus className="size-3.5" />
                  <span className="text-sm">Add row</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPagination && (
        <DataGridPagination
          table={table}
          totalElements={totalElements}
          pageSizeOptions={pageSizeOptions}
          className="mt-auto"
        />
      )}
    </div>
  );
}
