import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPicker } from "./icon-picker";
import type { NavSubMenuWithRoles } from "@/types/nav";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  path: z.string().min(1, "Path is required").startsWith("/", "Must start with /"),
  icon: z.string().min(1, "Icon is required"),
  position: z.coerce.number().min(1),
});

export type SubmenuFormValues = z.infer<typeof schema>;

interface SubmenuFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SubmenuFormValues) => Promise<void>;
  editingSubmenu: NavSubMenuWithRoles | null;
  isPending: boolean;
  menuName?: string;
  nextPosition?: number;
}

export function SubmenuFormModal({
  open, onOpenChange, onSubmit, editingSubmenu, isPending, menuName, nextPosition = 1,
}: SubmenuFormModalProps) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<SubmenuFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", path: "/", icon: "", position: nextPosition },
  });

  useEffect(() => {
    if (open) {
      if (editingSubmenu) {
        reset({
          name: editingSubmenu.name,
          path: editingSubmenu.path,
          icon: editingSubmenu.icon,
          position: editingSubmenu.position,
        });
      } else {
        reset({ name: "", path: "/", icon: "", position: nextPosition });
      }
    }
  }, [open, editingSubmenu, nextPosition, reset]);

  const onFormSubmit = async (data: SubmenuFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {editingSubmenu ? "Edit Sub-menu" : `Add Sub-menu${menuName ? ` to "${menuName}"` : ""}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="flex flex-col items-center gap-1.5 pb-2">
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <IconPicker value={field.value} onChange={field.onChange} />
                )}
              />
              <p className="text-[11px] text-muted-foreground">Click to pick an icon</p>
              {errors.icon && <p className="text-xs text-destructive">{errors.icon.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="e.g. All Applications" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Path</Label>
              <Input placeholder="e.g. /applications" {...register("path")} />
              {errors.path && <p className="text-xs text-destructive">{errors.path.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Position</Label>
              <Input type="number" min={1} {...register("position")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={isPending}>{editingSubmenu ? "Save" : "Add Sub-menu"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
