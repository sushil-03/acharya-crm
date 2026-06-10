import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card } from "@/components/ui-kit";
import { ArrowLeft, Star, Trash2, Loader2, MoveRight, UserPlus } from "lucide-react";
import { ListIconBadge } from "@/components/lists/list-icon";
import { getListIconComponent } from "@/components/lists/list-icons";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { useGetList } from "@/components/lists/hook/query/use-get-list";
import { useGetLists } from "@/components/lists/hook/query/use-get-lists";
import { useRemoveLeadsFromList } from "@/components/lists/hook/mutation/use-remove-leads-from-list";
import { useBulkMoveLeads } from "@/components/lists/hook/mutation/use-bulk-move";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import { getDataGridSelectColumn } from "@/components/data-grid/data-grid-select-column";
import { getLeadsColumn } from "@/components/leads/lead-column";

export const Route = createFileRoute("/lists/$listId")({
  component: ListDetailPage,
});

function ListDetailPage() {
  const { listId } = Route.useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(100);
  const { data: list, isLoading } = useGetList(listId, page, pageSize);
  const { data: allLists } = useGetLists();
  const { mutate: removeLeads, isPending: isRemoving } = useRemoveLeadsFromList();
  const { mutate: moveLeads, isPending: isMoving } = useBulkMoveLeads();

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [moveToListId, setMoveToListId] = useState<string>("");
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);

  const tableData = useMemo(() => {
    if (!list?.leads) return [];
    return list.leads.map((l) => ({
      ...l,
      program: l.courseInterest,
      campus: l.campusId,
      source: l.sourceChannel,
      stage: l.status,
      score: l.leadScore,
      counsellor: l.assignments ?? [],
      lastActivity: l.lastContactedAt ?? l.createdAt,
    }));
  }, [list?.leads]);

  const dataGrid = useDataGrid({
    data: tableData,
    columns: [getDataGridSelectColumn(), ...getLeadsColumn],
    readOnly: true,
    manualPagination: true,
    persistedKey: "list_leads_table",
    initialState: {
      columnPinning: { right: ["actions"] },
      columnVisibility: {
        lastActivity: false,
        city: false,
        email: false,
        mobile: false,
        state: false,
        utmSource: false,
        utmMedium: false,
        utmCampaign: false,
      },
    },
    state: {
      pagination: { pageIndex: page - 1, pageSize },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex: page - 1, pageSize });
        setPage(newState.pageIndex + 1);
      } else {
        setPage(updater.pageIndex + 1);
      }
    },
  });

  const selectedLeadIds = dataGrid.table
    .getSelectedRowModel()
    .rows.map((r) => r.original.id as string);

  const otherLists = allLists?.filter((l) => l.id !== listId) || [];

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (!list) {
    return (
      <AppShell>
        <div className="p-8 text-center text-muted-foreground">List not found.</div>
      </AppShell>
    );
  }

  return (
    <AppShell className="h-screen overflow-hidden" noPadding>
      {/* Custom header row — PageHeader.title only accepts string */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/lists" className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="size-4" />
          </Link>
          <ListIconBadge name={list.icon} color={list.color} size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-[17px] leading-tight">{list.name}</h1>
              {list.isSystem && <Star className="size-3.5 text-amber-500 fill-amber-500" />}
            </div>
            <p className="text-xs text-muted-foreground">
              {list.description || `${list.meta.total} lead${list.meta.total !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {selectedLeadIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">
              {selectedLeadIds.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMoveDialogOpen(true)}
              disabled={otherLists.length === 0}
            >
              <MoveRight className="size-3.5 mr-1.5" />
              Move to
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setRemoveDialogOpen(true)}
              loading={isRemoving}
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Remove
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col min-h-0 flex-1">
        <Card className="overflow-hidden flex flex-col min-h-0 flex-1 border-none">
          <div className="p-3 border-b border-border flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{list.meta.total}</span> leads
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <DataGridViewMenu table={dataGrid.table} />
              <DataGridRowHeightMenu table={dataGrid.table} />
            </div>
          </div>
          <DataGrid
            {...dataGrid}
            stretchColumns
            showPagination
            totalElements={list.meta.total}
            className="flex-1 min-h-0"
          />
        </Card>
      </div>

      {/* Remove confirmation */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {selectedLeadIds.length} lead(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              These leads will be removed from "{list.name}". They won't be deleted from the CRM.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={() => {
                removeLeads(
                  { listId, leadIds: selectedLeadIds },
                  {
                    onSuccess: () => {
                      dataGrid.table.resetRowSelection();
                      setRemoveDialogOpen(false);
                    },
                  },
                );
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move to list dialog */}
      <AlertDialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Move {selectedLeadIds.length} lead(s) to another list
            </AlertDialogTitle>
            <AlertDialogDescription>
              Select a destination list. Leads will be removed from "{list.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-3">
            <Select value={moveToListId} onValueChange={setMoveToListId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a list…" />
              </SelectTrigger>
              <SelectContent>
                {otherLists.map((l) => {
                  const Icon = getListIconComponent(l.icon ?? undefined);
                  return (
                    <SelectItem key={l.id} value={l.id}>
                      <span className="flex items-center gap-2">
                        <Icon className="size-3.5 shrink-0" style={{ color: l.color ?? undefined }} />
                        {l.name}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMoveToListId("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!moveToListId || isMoving}
              onClick={() => {
                if (!moveToListId) return;
                moveLeads(
                  { fromListId: listId, toListId: moveToListId, leadIds: selectedLeadIds },
                  {
                    onSuccess: () => {
                      dataGrid.table.resetRowSelection();
                      setMoveToListId("");
                      setMoveDialogOpen(false);
                    },
                  },
                );
              }}
            >
              {isMoving ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
              Move
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
