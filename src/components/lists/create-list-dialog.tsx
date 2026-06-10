import { useRef, useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pipette, Search } from "lucide-react";
import { useCreateList } from "./hook/mutation/use-create-list";
import { useUpdateList } from "./hook/mutation/use-update-list";
import type { LeadList } from "./hook/query/use-get-lists";
import {
  LIST_ICONS,
  PRESET_COLORS,
  DEFAULT_ICON,
  DEFAULT_COLOR,
  getListIconComponent,
} from "./list-icons";

interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editList?: LeadList;
}

function resolveIcon(stored?: string) {
  if (!stored) return DEFAULT_ICON;
  return LIST_ICONS.some((i) => i.name === stored) ? stored : DEFAULT_ICON;
}

export function CreateListDialog({ open, onOpenChange, editList }: CreateListDialogProps) {
  const isEdit = !!editList;
  const { mutate: createList, isPending: isCreating } = useCreateList();
  const { mutate: updateList, isPending: isUpdating } = useUpdateList();

  const [name, setName] = useState(editList?.name ?? "");
  const [description, setDescription] = useState(editList?.description ?? "");
  const [color, setColor] = useState(editList?.color ?? DEFAULT_COLOR);
  const [icon, setIcon] = useState(resolveIcon(editList?.icon ?? undefined));
  const [iconSearch, setIconSearch] = useState("");

  const colorInputRef = useRef<HTMLInputElement>(null);
  const isPending = isCreating || isUpdating;
  const isCustomColor = !PRESET_COLORS.includes(color);

  const filteredIcons = iconSearch.trim()
    ? LIST_ICONS.filter((i) =>
        i.label.toLowerCase().includes(iconSearch.toLowerCase())
      )
    : LIST_ICONS;

  function handleOpen(val: boolean) {
    if (!val) {
      setName(editList?.name ?? "");
      setDescription(editList?.description ?? "");
      setColor(editList?.color ?? DEFAULT_COLOR);
      setIcon(resolveIcon(editList?.icon ?? undefined));
      setIconSearch("");
    }
    onOpenChange(val);
  }

  function handleSubmit() {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      icon,
    };
    if (isEdit && editList) {
      updateList({ id: editList.id, payload }, { onSuccess: () => handleOpen(false) });
    } else {
      createList(payload, { onSuccess: () => handleOpen(false) });
    }
  }

  const SelectedIcon = getListIconComponent(icon);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[500px] gap-0">
        <DialogHeader className="pb-4">
          <DialogTitle>{isEdit ? "Edit List" : "Create List"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Icon preview + Name + Description */}
          <div className="flex gap-3 items-start">
            <div
              className="shrink-0 size-[68px] rounded-xl flex items-center justify-center cursor-default"
              style={{ backgroundColor: color + "22" }}
            >
              <SelectedIcon className="size-7" style={{ color }} />
            </div>
            <div className="flex-1 space-y-2">
              <Input
                placeholder="List name…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                disabled={isEdit && editList?.isSystem}
                className="font-medium"
              />
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                className="resize-none h-[52px] text-sm"
              />
            </div>
          </div>

          {/* Icon + Color in two columns */}
          <div className="grid grid-cols-[1fr_156px] gap-3 items-start">
            {/* Icon picker */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Icon
                </Label>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search…"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  className="pl-7 h-7 text-xs"
                />
              </div>
              <ScrollArea className="h-[140px] rounded-lg border bg-muted/20">
                {filteredIcons.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-10">
                    No icons found
                  </p>
                ) : (
                  <div className="grid grid-cols-7 gap-0.5 p-1.5">
                    {filteredIcons.map((item) => {
                      const Icon = item.icon;
                      const isSelected = icon === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          title={item.label}
                          onClick={() => setIcon(item.name)}
                          className={`size-8 rounded-md flex items-center justify-center transition-colors ${
                            isSelected
                              ? "text-primary ring-1 ring-primary"
                              : "hover:bg-background text-muted-foreground hover:text-foreground"
                          }`}
                          style={isSelected ? { backgroundColor: color + "18" } : undefined}
                        >
                          <Icon className="size-[14px]" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Color picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Color
              </Label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`h-7 rounded-md transition-all ${
                      color === c
                        ? "ring-2 ring-offset-1 ring-foreground"
                        : "hover:brightness-110 hover:scale-105"
                    }`}
                  />
                ))}
              </div>
              {/* Custom color row */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  title="Custom color"
                  className={`h-7 w-7 shrink-0 rounded-md border transition-all flex items-center justify-center ${
                    isCustomColor
                      ? "ring-2 ring-offset-1 ring-foreground"
                      : "border-dashed border-border hover:border-foreground"
                  }`}
                  style={isCustomColor ? { backgroundColor: color } : undefined}
                >
                  {!isCustomColor && <Pipette className="size-3 text-muted-foreground" />}
                </button>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="sr-only"
                />
                <span className="text-[11px] font-mono text-muted-foreground truncate">
                  {color}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-5">
          <Button variant="outline" size="sm" onClick={() => handleOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            loading={isPending}
          >
            {isEdit ? "Save Changes" : "Create List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
