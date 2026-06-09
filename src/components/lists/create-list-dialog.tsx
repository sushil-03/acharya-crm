import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateList } from "./hook/mutation/use-create-list";
import { useUpdateList } from "./hook/mutation/use-update-list";
import type { LeadList } from "./hook/query/use-get-lists";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f97316",
  "#eab308", "#22c55e", "#06b6d4", "#3b82f6",
];
const ICONS = ["📋", "⭐", "🔥", "🎯", "💼", "📌", "🚀", "💡", "✅", "📞"];

interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editList?: LeadList;
}

export function CreateListDialog({ open, onOpenChange, editList }: CreateListDialogProps) {
  const isEdit = !!editList;
  const { mutate: createList, isPending: isCreating } = useCreateList();
  const { mutate: updateList, isPending: isUpdating } = useUpdateList();

  const [name, setName] = useState(editList?.name || "");
  const [description, setDescription] = useState(editList?.description || "");
  const [color, setColor] = useState(editList?.color || COLORS[0]);
  const [icon, setIcon] = useState(editList?.icon || "📋");

  const isPending = isCreating || isUpdating;

  function handleOpen(val: boolean) {
    if (!val) {
      setName(editList?.name || "");
      setDescription(editList?.description || "");
      setColor(editList?.color || COLORS[0]);
      setIcon(editList?.icon || "📋");
    }
    onOpenChange(val);
  }

  function handleSubmit() {
    if (!name.trim()) return;
    const payload = { name: name.trim(), description: description.trim() || undefined, color, icon };
    if (isEdit && editList) {
      updateList({ id: editList.id, payload }, { onSuccess: () => handleOpen(false) });
    } else {
      createList(payload, { onSuccess: () => handleOpen(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit List" : "Create List"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Hot Prospects"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              disabled={isEdit && editList?.isSystem}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              placeholder="What's this list for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              className="resize-none h-20"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`size-8 rounded-md text-base grid place-items-center border transition-colors ${
                    icon === ic ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`size-7 rounded-full transition-transform ${
                    color === c ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()} loading={isPending}>
            {isEdit ? "Save Changes" : "Create List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
