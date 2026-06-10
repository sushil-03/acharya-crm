import { useState } from "react";
import { ListIconBadge } from "./list-icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Star, Check, Search } from "lucide-react";
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

  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  const memberListIds = new Set((memberships || []).map((m) => m.listId));
  const isLoading = isLoadingLists || isLoadingMemberships;

  const filtered = search.trim()
    ? (allLists ?? []).filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase()),
      )
    : (allLists ?? []);

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

  function handleClose() {
    setSearch("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[360px] gap-0 p-0">
        <DialogHeader className="px-4 pt-4 pb-3">
          <DialogTitle className="text-base">
            {leadName ? `Add "${leadName}" to lists` : "Add to lists"}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search lists…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
              autoFocus={false}
            />
          </div>
        </div>

        {/* List */}
        <ScrollArea className="h-[260px] border-y border-border">
          <div className="px-2 py-1.5">
            {isLoading && (
              <div className="flex justify-center py-10">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-10">
                {search ? "No matching lists" : "No lists yet"}
              </p>
            )}
            {!isLoading &&
              filtered.map((list) => {
                const isMember = memberListIds.has(list.id);
                const isTogglingThis = toggling === list.id;
                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => handleToggle(list.id)}
                    disabled={isTogglingThis || isAdding || isRemoving}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-colors group",
                      isMember
                        ? "bg-primary/8 hover:bg-primary/12"
                        : "hover:bg-muted",
                    )}
                  >
                    <ListIconBadge name={list.icon} color={list.color} size="xs" />
                    <span className="flex-1 min-w-0 flex items-center gap-1">
                      <span className="text-[13px] font-medium truncate">{list.name}</span>
                      {list.isSystem && (
                        <Star className="size-2.5 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                      {list.leadCount}
                    </span>
                    <div
                      className={cn(
                        "size-4 rounded border flex items-center justify-center transition-colors shrink-0",
                        isMember
                          ? "bg-primary border-primary"
                          : "border-border group-hover:border-muted-foreground/50",
                      )}
                    >
                      {isTogglingThis ? (
                        <Loader2 className="size-2.5 animate-spin text-white" />
                      ) : isMember ? (
                        <Check className="size-2.5 text-white" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {memberListIds.size > 0
              ? `In ${memberListIds.size} list${memberListIds.size > 1 ? "s" : ""}`
              : "Not in any list"}
          </span>
          <Button size="sm" onClick={handleClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
