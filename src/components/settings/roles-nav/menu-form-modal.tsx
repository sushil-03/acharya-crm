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
import type { NavMenuFull } from "@/types/nav";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  position: z.coerce.number().min(1),
});

export type MenuFormValues = z.infer<typeof schema>;

interface MenuFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MenuFormValues) => Promise<void>;
  editingMenu: NavMenuFull | null;
  isPending: boolean;
  moduleName?: string;
  nextPosition?: number;
}

export function MenuFormModal({
  open, onOpenChange, onSubmit, editingMenu, isPending, moduleName, nextPosition = 1,
}: MenuFormModalProps) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<MenuFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", icon: "", position: nextPosition },
  });

  useEffect(() => {
    if (open) {
      if (editingMenu) {
        reset({ name: editingMenu.name, icon: editingMenu.icon, position: editingMenu.position });
      } else {
        reset({ name: "", icon: "", position: nextPosition });
      }
    }
  }, [open, editingMenu, nextPosition, reset]);

  const onFormSubmit = async (data: MenuFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {editingMenu ? "Edit Menu" : `Add Menu${moduleName ? ` to "${moduleName}"` : ""}`}
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
              <Input placeholder="e.g. Applications" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Position</Label>
              <Input type="number" min={1} {...register("position")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={isPending}>{editingMenu ? "Save" : "Add Menu"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
