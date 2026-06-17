import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ListIconBadge } from "@/components/lists/list-icon";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card } from "@/components/ui-kit";
import {
  Plus,
  List,
  LayoutGrid,
  Star,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useState } from "react";
import { useGetLists, type LeadList } from "@/components/lists/hook/query/use-get-lists";
import { useDeleteList } from "@/components/lists/hook/mutation/use-delete-list";
import { CreateListDialog } from "@/components/lists/create-list-dialog";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/lists/")({
  component: ListsPage,
  head: () => ({ meta: [{ title: "Lists — Acharya One" }] }),
});

function ListsPage() {
  const navigate = useNavigate();
  const { data: lists, isLoading } = useGetLists();
  const { mutate: deleteList, isPending: isDeleting } = useDeleteList();

  const [view, setView] = useState<"card" | "table">(
    () => (localStorage.getItem("lists_view") as "card" | "table") || "card",
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [editList, setEditList] = useState<LeadList | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeadList | null>(null);

  function setViewPersisted(v: "card" | "table") {
    setView(v);
    localStorage.setItem("lists_view", v);
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell className="h-screen overflow-hidden" noPadding>
      <PageHeader
        title="Lists"
        subtitle="Organise leads into personal saved lists for quick access and follow-up."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setViewPersisted("card")}
                className={`px-2.5 py-1.5 transition-colors ${view === "card" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => setViewPersisted("table")}
                className={`px-2.5 py-1.5 transition-colors ${view === "table" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
              >
                <List className="size-4" />
              </button>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4 mr-1.5" />
              New List
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto border-t">
        {!lists || lists.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <div className="font-semibold text-foreground mb-1">No lists yet</div>
            <div className="text-sm text-muted-foreground mb-4">
              Create a list to organise your leads
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4 mr-1.5" />
              Create your first list
            </Button>
          </Card>
        ) : view === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 ">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onEdit={() => setEditList(list)}
                onDelete={() => setDeleteTarget(list)}
                onClick={() => navigate({ to: "/lists/$listId", params: { listId: list.id } })}
              />
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden rounded-none border-none">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">List</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground text-right">
                    Leads
                  </th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Created</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground w-10" />
                </tr>
              </thead>
              <tbody>
                {lists.map((list) => (
                  <tr
                    key={list.id}
                    className="group border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => navigate({ to: "/lists/$listId", params: { listId: list.id } })}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <ListIconBadge name={list.icon} color={list.color} size="sm" />
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{list.name}</span>
                          {list.isSystem && (
                            <Star className="size-3 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[240px]">
                      {list.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {list.leadCount}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatDate(list.createdAt)}
                    </td>
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <ListActionsMenu
                        list={list}
                        onEdit={() => setEditList(list)}
                        onDelete={() => setDeleteTarget(list)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <CreateListDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editList && (
        <CreateListDialog
          key={editList.id}
          open={!!editList}
          onOpenChange={(o) => !o && setEditList(null)}
          editList={editList}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the list and all its lead memberships. The leads themselves won't be
              affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={() => {
                if (deleteTarget) {
                  deleteList(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
                }
              }}
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function ListCard({
  list,
  onClick,
  onEdit,
  onDelete,
}: {
  list: LeadList;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-background border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <ListIconBadge name={list.icon} color={list.color} size="md" />
        <div onClick={(e) => e.stopPropagation()}>
          <ListActionsMenu list={list} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-1">
        <span className="font-semibold text-[14px]">{list.name}</span>
        {list.isSystem && <Star className="size-3 text-amber-500 fill-amber-500" />}
      </div>

      {list.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{list.description}</p>
      )}

      <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{list.leadCount}</span> leads
        </span>
        <div
          className="size-2.5 rounded-full"
          style={{ backgroundColor: list.color || "#e2e8f0" }}
        />
      </div>
    </div>
  );
}

function ListActionsMenu({
  list,
  onEdit,
  onDelete,
}: {
  list: LeadList;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="size-3.5 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          disabled={list.isSystem}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="size-3.5 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
