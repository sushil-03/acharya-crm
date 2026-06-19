import * as React from "react";
import { useState } from "react";
import { Plus, RefreshCw, Shield, CheckCircle2, Lock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Card, StatCard } from "@/components/ui-kit";
import { cn, capitalizeWords } from "@/lib/utils";
import { useGetCrmRoles } from "./hooks/query/use-get-crm-roles";
import { useCreateCrmRole } from "./hooks/mutation/use-create-crm-role";
import { useUpdateCrmRole } from "./hooks/mutation/use-update-crm-role";
import { useDeleteCrmRole } from "./hooks/mutation/use-delete-crm-role";
import { CrmRoleFormModal, type CrmRoleFormValues } from "./crm-role-form-modal";
import type { CrmRole } from "@/types/nav";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function CrmRolesTab() {
  const { data: roles = [], isLoading, isFetching, refetch } = useGetCrmRoles();
  const { mutateAsync: createRole, isPending: isCreating } = useCreateCrmRole();
  const { mutateAsync: updateRole, isPending: isUpdating } = useUpdateCrmRole();
  const { mutateAsync: deleteRole, isPending: isDeleting } = useDeleteCrmRole();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CrmRole | null>(null);
  const [deletingRole, setDeletingRole] = useState<CrmRole | null>(null);

  const activeCount = roles.filter((r) => r.isActive).length;
  const customCount = roles.filter((r) => !r.isSystem).length;

  const handleSubmit = async (values: CrmRoleFormValues) => {
    if (editingRole) {
      await updateRole({
        roleId: editingRole.roleId,
        payload: { description: values.description, isActive: values.isActive },
      });
      toast.success("Role updated");
    } else {
      await createRole({ roleName: values.roleName, description: values.description });
      toast.success("Role created");
    }
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    try {
      await deleteRole(deletingRole.roleId);
      toast.success("Role deleted");
    } catch {
      toast.error("Cannot delete system roles");
    } finally {
      setDeletingRole(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        <StatCard
          label="Total Roles"
          value={String(roles.length)}
          icon={<Shield className="size-4" />}
          accent="primary"
        />
        <StatCard
          label="Active"
          value={String(activeCount)}
          icon={<CheckCircle2 className="size-4" />}
          accent="success"
        />
        <StatCard
          label="Custom Roles"
          value={String(customCount)}
          icon={<Plus className="size-4" />}
          accent="info"
        />
      </div>

      {/* Table Card */}
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-semibold text-[14px]">CRM Roles</h3>
            <p className="text-xs text-muted-foreground">
              System roles are protected. Custom roles can be created and deleted.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => { setEditingRole(null); setIsFormOpen(true); }}>
              <Plus className="size-3.5" />
              New Role
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              Loading roles...
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="sticky top-0 bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-8">#</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Role Name</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Description</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {roles.map((role, i) => (
                  <tr key={role.roleId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <div>
                        <span className="font-medium">{capitalizeWords(role.roleName)}</span>
                        <p className="text-[11px] text-muted-foreground font-mono">{role.roleName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {role.description || <span className="italic opacity-50">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      {role.isSystem ? (
                        <Badge tone="muted" className="gap-1 text-[11px]">
                          <Lock className="size-3" /> System
                        </Badge>
                      ) : (
                        <Badge tone="primary" className="text-[11px]">Custom</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={role.isActive ? "success" : "muted"}>
                        {role.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Button size="xs" variant="outline" className="h-6 px-2"
                          onClick={() => { setEditingRole(role); setIsFormOpen(true); }}>
                          <Pencil className="size-3" /> Edit
                        </Button>
                        {!role.isSystem && (
                          <Button size="xs" variant="outline"
                            className="h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeletingRole(role)}>
                            <Trash2 className="size-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <CrmRoleFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingRole={editingRole}
        isPending={isCreating || isUpdating}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!deletingRole} onOpenChange={(o) => !o && setDeletingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role "{deletingRole ? capitalizeWords(deletingRole.roleName) : ""}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the role. Sub-menu assignments using this role will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
