import { useState, useEffect } from "react";
import { ListIconBadge } from "@/components/lists/list-icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Star, Check, Search } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [selectedListIds, setSelectedListIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const { data: lists, isLoading } = useGetLists();
  const { mutateAsync: addLeads } = useAddLeadsToList();

  // Reset selected state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedListIds(new Set());
    }
  }, [open]);

  function handleToggle(listId: string) {
    setSelectedListIds((prev) => {
      const next = new Set(prev);
      if (next.has(listId)) {
        next.delete(listId);
      } else {
        next.add(listId);
      }
      return next;
    });
  }

  async function handleAdd() {
    if (selectedListIds.size === 0) {
      handleClose();
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        [...selectedListIds].map((listId) =>
          addLeads({ listId, leadIds })
        )
      );
      handleClose();
      onSuccess?.();
    } catch (err) {
      console.error("Failed to add leads to lists", err);
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setSearch("");
    onOpenChange(false);
  }

  const filtered = search.trim()
    ? (lists ?? []).filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase()),
      )
    : (lists ?? []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[360px] gap-0 p-0">
        <DialogHeader className="px-4 pt-4 pb-3">
          <DialogTitle className="text-base">
            Add {leadIds.length} lead{leadIds.length !== 1 ? "s" : ""} to lists
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
                const isSelected = selectedListIds.has(list.id);
                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => handleToggle(list.id)}
                    disabled={saving}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-colors group",
                      isSelected
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
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-border group-hover:border-muted-foreground/50",
                      )}
                    >
                      {isSelected ? <Check className="size-2.5 text-white" /> : null}
                    </div>
                  </button>
                );
              })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-3 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleAdd} loading={saving} disabled={selectedListIds.size === 0 || saving}>
            Add to List
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
