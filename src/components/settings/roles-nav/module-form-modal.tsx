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
import type { NavModuleFull } from "@/types/nav";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  shortName: z.string().min(1, "Short name is required").max(6, "Max 6 chars"),
  icon: z.string().min(1, "Icon is required"),
  position: z.coerce.number().min(1, "Position must be ≥ 1"),
});

export type ModuleFormValues = z.infer<typeof schema>;

interface ModuleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ModuleFormValues) => Promise<void>;
  editingModule: NavModuleFull | null;
  isPending: boolean;
  nextPosition?: number;
}

export function ModuleFormModal({
  open, onOpenChange, onSubmit, editingModule, isPending, nextPosition = 1,
}: ModuleFormModalProps) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ModuleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", shortName: "", icon: "", position: nextPosition },
  });

  useEffect(() => {
    if (open) {
      if (editingModule) {
        reset({
          name: editingModule.name,
          shortName: editingModule.shortName,
          icon: editingModule.icon,
          position: editingModule.position,
        });
      } else {
        reset({ name: "", shortName: "", icon: "", position: nextPosition });
      }
    }
  }, [open, editingModule, nextPosition, reset]);

  const onFormSubmit = async (data: ModuleFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Module" : "Create Module"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            {/* Icon — hero placement at top */}
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
              <Input placeholder="e.g. Admissions" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Short Name</Label>
              <Input placeholder="e.g. ADM" {...register("shortName")} />
              {errors.shortName && <p className="text-xs text-destructive">{errors.shortName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Position</Label>
              <Input type="number" min={1} {...register("position")} />
              {errors.position && <p className="text-xs text-destructive">{errors.position.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={isPending}>{editingModule ? "Save" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
