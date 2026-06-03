import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card } from "@/components/ui-kit";
import { Download, Filter, Plus } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import InputSearch from "@/components/global/input-search";
import { useGetAllOffer } from "@/components/offer/hook/query/use-get-all-offer";
import { getOffersColumn } from "@/components/offer/offer-column";

export const Route = createFileRoute("/offer/")({
  component: OfferPage,
  head: () => ({ meta: [{ title: "Offers — Acharya One" }] }),
});

function OfferPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const router = useRouter();
  const { data, isLoading } = useGetAllOffer();

  const filtered = React.useMemo(() => {
    if (!data) return [];
    let result = data;
    if (q) {
      const lowerQ = q.toLowerCase();
      result = result.filter(
        (offer) =>
          offer.student?.firstName?.toLowerCase().includes(lowerQ) ||
          offer.student?.lastName?.toLowerCase().includes(lowerQ) ||
          offer.id.toLowerCase().includes(lowerQ),
      );
    }
    return result;
  }, [data, q]);

  const dataGrid = useDataGrid({
    data: filtered,
    columns: getOffersColumn,
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
    <AppShell>
      <PageHeader
        title="Offers Management"
        subtitle="Manage and track all student offers."
        actions={
          <>
            <Button variant="outline" onClick={() => router.navigate({ to: "/applications" })}>
              <Plus className="size-4" /> Create Offer
            </Button>
          </>
        }
      />
      <div className="flex flex-col h-full min-h-0 flex-1">
        <Card className="overflow-hidden h-full flex flex-col ">
          <div className="p-3 border-b border-border flex flex-wrap items-center gap-3">
            <InputSearch
              searchTerm={q}
              setSearchTerm={setQ}
              className="h-7"
              placeholder="Search offers by name or ID..."
            />
            <div className="flex items-center gap-2 ml-auto">
              <DataGridViewMenu table={dataGrid.table} />
              <DataGridRowHeightMenu table={dataGrid.table} />
            </div>
          </div>

          <DataGrid
            {...dataGrid}
            stretchColumns
            showPagination
            totalElements={filtered.length}
            className="flex-1 "
          />
        </Card>
      </div>
    </AppShell>
  );
}
