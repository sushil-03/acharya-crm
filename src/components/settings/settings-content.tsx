import { useMemo, useState } from "react";
import { RefreshCw, Shield, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader, StatCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { USER_ROLES } from "@/lib/constant";
import { useGetErpRoles, type ErpRole } from "@/components/user/hook/query/use-get-erp-roles";
import { useCreateErpRole } from "@/components/user/hook/mutation/use-create-erp-role";
import { useUpdateErpRole } from "@/components/user/hook/mutation/use-update-erp-role";
import { ErpRolesTable } from "./erp-roles-table";
import { ErpRoleFormModal } from "./erp-role-form-modal";

export function SettingsContent() {
  const { data: roles, isLoading, isFetching, refetch } = useGetErpRoles();
  const { mutateAsync: createErpRole, isPending: isCreatingRole } = useCreateErpRole();
  const { mutateAsync: updateErpRole, isPending: isUpdatingRole } = useUpdateErpRole();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<ErpRole | null>(null);

  const roleLabelMap = useMemo(
    () => Object.fromEntries(USER_ROLES.map((role) => [role.value, role.label])),
    [],
  );

  const activeRolesCount = (roles || []).filter((role) => role.isActive).length;
  const inactiveRolesCount = (roles || []).length - activeRolesCount;

  return (
    <AppShell noPadding className="h-screen overflow-hidden">
      <PageHeader
        // breadcrumb="Workspace"
        title="Settings & Roles"
        // subtitle="Manage CRM access, ERP role mappings, and workspace controls."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={isFetching ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button
              onClick={() => {
                setEditingRole(null);
                setIsFormModalOpen(true);
              }}
            >
              <Plus className="size-4" />
              Create Role Mapping
            </Button>
          </div>
        }
      />
      <div className="p-3 border-t flex flex-col flex-1 min-h-0">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-5">
          <StatCard
            label="Total Mapped Roles"
            value={(roles || []).length.toString()}
            icon={<Shield className="size-4" />}
            accent="primary"
          />
          <StatCard
            label="Active Mappings"
            value={activeRolesCount.toString()}
            icon={<CheckCircle2 className="size-4" />}
            accent="success"
          />
          <StatCard
            label="Inactive Mappings"
            value={inactiveRolesCount.toString()}
            icon={<AlertCircle className="size-4" />}
            accent="warning"
          />
        </div>

        <div className="flex-1 min-h-0">
          <ErpRolesTable
            roles={roles || []}
            isLoading={isLoading}
            roleLabelMap={roleLabelMap}
            onEditRole={(role) => {
              setEditingRole(role);
              setIsFormModalOpen(true);
            }}
          />
        </div>

        <ErpRoleFormModal
          open={isFormModalOpen}
          onOpenChange={setIsFormModalOpen}
          editingRole={editingRole}
          isPending={isCreatingRole || isUpdatingRole}
          onSubmit={async (values) => {
            if (editingRole) {
              await updateErpRole({
                id: editingRole.id,
                payload: {
                  label: values.label.trim(),
                  crmRole: values.crmRole,
                  isActive: values.isActive,
                },
              });
            } else {
              await createErpRole({
                crmStatus: values.crmStatus.trim(),
                crmRole: values.crmRole,
                label: values.label.trim(),
              });
            }
          }}
        />
      </div>
    </AppShell>
  );
}
