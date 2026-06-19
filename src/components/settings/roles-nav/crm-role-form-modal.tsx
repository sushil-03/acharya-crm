import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { capitalizeWords } from "@/lib/utils";
import type { CrmRole } from "@/types/nav";

const toSnakeCase = (value: string) =>
  value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

const schema = z.object({
  roleName: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export type CrmRoleFormValues = z.infer<typeof schema>;

interface CrmRoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CrmRoleFormValues) => Promise<void>;
  editingRole: CrmRole | null;
  isPending: boolean;
}

export function CrmRoleFormModal({
  open, onOpenChange, onSubmit, editingRole, isPending,
}: CrmRoleFormModalProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
    useForm<CrmRoleFormValues>({
      resolver: zodResolver(schema),
      defaultValues: { roleName: "", description: "", isActive: true },
    });

  useEffect(() => {
    if (open) {
      if (editingRole) {
        reset({ roleName: editingRole.roleName, description: editingRole.description ?? "", isActive: editingRole.isActive });
      } else {
        reset({ roleName: "", description: "", isActive: true });
      }
    }
  }, [open, editingRole, reset]);

  const isActiveValue = watch("isActive");
  const roleNameValue = watch("roleName");

  const onFormSubmit = async (data: CrmRoleFormValues) => {
    await onSubmit({ ...data, roleName: toSnakeCase(data.roleName) });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Create Role"}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Update description or active status. Role name cannot be changed."
                : "Create a new custom CRM role."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              {editingRole ? (
                <div className="rounded-md border bg-muted px-3 py-2 cursor-not-allowed opacity-70">
                  <p className="text-sm font-medium">{capitalizeWords(editingRole.roleName)}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{editingRole.roleName}</p>
                </div>
              ) : (
                <>
                  <Input
                    id="roleName"
                    placeholder="e.g. Admission Officer"
                    {...register("roleName")}
                  />
                  {roleNameValue && (
                    <p className="text-[11px] text-muted-foreground">
                      Stored as: <code className="font-mono bg-muted px-1 rounded">{toSnakeCase(roleNameValue)}</code>
                    </p>
                  )}
                  {errors.roleName && (
                    <p className="text-xs font-semibold text-destructive">{errors.roleName.message}</p>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Optional description" rows={2} {...register("description")} />
            </div>

            {!!editingRole && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-sm font-medium">Active</Label>
                  <p className="text-xs text-muted-foreground">Inactive roles cannot be assigned.</p>
                </div>
                <Switch id="isActive" checked={isActiveValue} onCheckedChange={(v) => setValue("isActive", v)} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={isPending}>{editingRole ? "Save Changes" : "Create Role"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
