import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Star, Check } from "lucide-react";
import { useGetLists } from "./hook/query/use-get-lists";
import { useGetLeadLists } from "./hook/query/use-get-lead-lists";
import { useAddLeadToLists } from "./hook/mutation/use-add-lead-to-lists";
import { useRemoveLeadsFromList } from "./hook/mutation/use-remove-leads-from-list";
import { cn } from "@/lib/utils";

interface AddToListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName?: string;
}

export function AddToListDialog({ open, onOpenChange, leadId, leadName }: AddToListDialogProps) {
  const { data: allLists, isLoading: isLoadingLists } = useGetLists();
  const { data: memberships, isLoading: isLoadingMemberships } = useGetLeadLists(leadId);
  const { mutate: addToLists, isPending: isAdding } = useAddLeadToLists();
  const { mutate: removeFromList, isPending: isRemoving } = useRemoveLeadsFromList();

  const memberListIds = new Set((memberships || []).map((m) => m.listId));

  const [toggling, setToggling] = useState<string | null>(null);

  function handleToggle(listId: string) {
    setToggling(listId);
    if (memberListIds.has(listId)) {
      removeFromList(
        { listId, leadIds: [leadId] },
        { onSettled: () => setToggling(null) },
      );
    } else {
      addToLists(
        { leadId, listIds: [listId] },
        { onSettled: () => setToggling(null) },
      );
    }
  }

  const isLoading = isLoadingLists || isLoadingMemberships;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>
            {leadName ? `Add "${leadName}" to lists` : "Add to lists"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-1 max-h-72 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && (!allLists || allLists.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No lists yet.</p>
          )}
          {!isLoading &&
            allLists?.map((list) => {
              const isMember = memberListIds.has(list.id);
              const isTogglingThis = toggling === list.id;
              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => handleToggle(list.id)}
                  disabled={isTogglingThis || isAdding || isRemoving}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    isMember ? "bg-primary/8" : "hover:bg-muted",
                  )}
                >
                  <span className="text-lg leading-none">{list.icon || "📋"}</span>
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
                      isMember
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {isTogglingThis ? (
                      <Loader2 className="size-3 animate-spin text-white" />
                    ) : isMember ? (
                      <Check className="size-3 text-white" />
                    ) : null}
                  </div>
                </button>
              );
            })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
