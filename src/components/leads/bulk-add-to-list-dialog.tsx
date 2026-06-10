import { useState } from "react";
import { ListIconBadge } from "@/components/lists/list-icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Star, Check } from "lucide-react";
import { useGetLists } from "@/components/lists/hook/query/use-get-lists";
import { useAddLeadsToList } from "@/components/lists/hook/mutation/use-add-leads-to-list";
import { cn } from "@/lib/utils";

interface BulkAddToListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadIds: string[];
  onSuccess?: () => void;
}

export function BulkAddToListDialog({
  open,
  onOpenChange,
  leadIds,
  onSuccess,
}: BulkAddToListDialogProps) {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const { data: lists, isLoading } = useGetLists();
  const { mutate: addLeads, isPending } = useAddLeadsToList();

  function handleAdd() {
    if (!selectedListId) return;
    addLeads(
      { listId: selectedListId, leadIds },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedListId(null);
          onSuccess?.();
        },
      },
    );
  }

  function handleOpenChange(next: boolean) {
    if (!next) setSelectedListId(null);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>
            Add {leadIds.length} lead{leadIds.length !== 1 ? "s" : ""} to a list
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-1 max-h-72 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && (!lists || lists.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No lists yet.</p>
          )}
          {!isLoading &&
            lists?.map((list) => {
              const isSelected = selectedListId === list.id;
              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => setSelectedListId(isSelected ? null : list.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    isSelected ? "bg-primary/8" : "hover:bg-muted",
                  )}
                >
                  <ListIconBadge name={list.icon} color={list.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate">{list.name}</span>
                      {list.isSystem && (
                        <Star className="size-3 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{list.leadCount} leads</span>
                  </div>
                  <div
                    className={cn(
                      "size-5 rounded border-2 flex items-center justify-center transition-colors shrink-0",
                      isSelected ? "bg-primary border-primary" : "border-muted-foreground/30",
                    )}
                  >
                    {isSelected && <Check className="size-3 text-white" />}
                  </div>
                </button>
              );
            })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedListId || isPending} loading={isPending}>
            Add to List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
