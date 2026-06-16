import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLES } from "@/lib/constant";
import type { ErpRole } from "@/components/user/hook/query/use-get-erp-roles";

const erpRoleSchema = z.object({
  label: z.string().min(1, "Label is required"),
  crmStatus: z.string().min(1, "CRM Status is required"),
  crmRole: z.string().min(1, "CRM Role is required"),
  isActive: z.boolean(),
});

export type ErpRoleFormValues = z.infer<typeof erpRoleSchema>;

interface ErpRoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ErpRoleFormValues) => Promise<void>;
  editingRole: ErpRole | null;
  isPending: boolean;
}

export function ErpRoleFormModal({
  open,
  onOpenChange,
  onSubmit,
  editingRole,
  isPending,
}: ErpRoleFormModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ErpRoleFormValues>({
    resolver: zodResolver(erpRoleSchema),
    defaultValues: {
      label: "",
      crmStatus: "",
      crmRole: USER_ROLES[0]?.value ?? "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (editingRole) {
        reset({
          label: editingRole.label,
          crmStatus: editingRole.crmStatus,
          crmRole: editingRole.crmRole,
          isActive: editingRole.isActive,
        });
      } else {
        reset({
          label: "",
          crmStatus: "",
          crmRole: USER_ROLES[0]?.value ?? "",
          isActive: true,
        });
      }
    }
  }, [open, editingRole, reset]);

  const crmRoleValue = watch("crmRole");
  const isActiveValue = watch("isActive");

  const onFormSubmit = async (data: ErpRoleFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role Mapping" : "Create Role Mapping"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Update the ERP role mapping, CRM status, and active status."
                : "Create a new mapping between ERP status and CRM role."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                placeholder="e.g. Telecaller"
                {...register("label")}
              />
              {errors.label && (
                <p className="text-xs font-semibold text-danger">{errors.label.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="crmStatus">CRM Status</Label>
              <Input
                id="crmStatus"
                placeholder="e.g. Telecaller"
                {...register("crmStatus")}
                readOnly={!!editingRole}
                className={editingRole ? "bg-muted cursor-not-allowed opacity-70" : ""}
              />
              {errors.crmStatus && (
                <p className="text-xs font-semibold text-danger">{errors.crmStatus.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="crmRole">CRM Role</Label>
              <Select
                value={crmRoleValue}
                onValueChange={(val) => setValue("crmRole", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select CRM Role" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.crmRole && (
                <p className="text-xs font-semibold text-danger">{errors.crmRole.message}</p>
              )}
            </div>

            {!!editingRole && (
              <div className="flex items-center space-x-3 rounded-lg border p-3 shadow-xs">
                <div className="flex-1 space-y-0.5">
                  <Label htmlFor="isActive" className="text-sm font-medium">
                    Active Status
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Determine if this role mapping is available for assignments.
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActiveValue}
                  onCheckedChange={(val) => setValue("isActive", val)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {editingRole ? "Save Changes" : "Create Mapping"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
