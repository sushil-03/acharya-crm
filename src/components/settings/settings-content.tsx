import { useMemo, useState, useRef } from "react";
import { RefreshCw, Shield, CheckCircle2, AlertCircle, Plus, Users, Network } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader, StatCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { USER_ROLES } from "@/lib/constant";
import { useGetErpRoles, type ErpRole } from "@/components/user/hook/query/use-get-erp-roles";
import { useCreateErpRole } from "@/components/user/hook/mutation/use-create-erp-role";
import { useUpdateErpRole } from "@/components/user/hook/mutation/use-update-erp-role";
import { ErpRolesTable } from "./erp-roles-table";
import { ErpRoleFormModal } from "./erp-role-form-modal";
import { UsersPermissionsTab } from "./users-permissions-tab";

type SettingsTab = "users" | "erp-roles";

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "users", label: "Users & Permissions", icon: Users },
  { id: "erp-roles", label: "ERP Role Mapping", icon: Network },
];

export function SettingsContent() {
  const { data: roles, isLoading, isFetching, refetch } = useGetErpRoles();
  const { mutateAsync: createErpRole, isPending: isCreatingRole } = useCreateErpRole();
  const { mutateAsync: updateErpRole, isPending: isUpdatingRole } = useUpdateErpRole();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<ErpRole | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("users");

  const onAddUserRef = useRef<(() => void) | null>(null);
  const onRefetchUsersRef = useRef<(() => void) | null>(null);
  const [isUsersFetching, setIsUsersFetching] = useState(false);

  const roleLabelMap = useMemo(
    () => Object.fromEntries(USER_ROLES.map((role) => [role.value, role.label])),
    [],
  );

  const activeRolesCount = (roles || []).filter((role) => role.isActive).length;
  const inactiveRolesCount = (roles || []).length - activeRolesCount;

  return (
    <AppShell noPadding className="h-screen overflow-hidden">
      <PageHeader
        title="Settings & Roles"
        actions={
          activeTab === "users" ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => onRefetchUsersRef.current?.()}
                disabled={isUsersFetching}
              >
                <RefreshCw className={cn("size-4", isUsersFetching ? "animate-spin" : "")} />
                Refresh
              </Button>
              <Button
                onClick={() => {
                  onAddUserRef.current?.();
                }}
              >
                <Plus className="size-4" />
                New User
              </Button>
            </div>
          ) : activeTab === "erp-roles" ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={cn("size-4", isFetching ? "animate-spin" : "")} />
                Refresh
              </Button>
              <Button
                onClick={() => {
                  setEditingRole(null);
                  setIsFormModalOpen(true);
                }}
              >
                <Plus className="size-4" />
                Create Mapping
              </Button>
            </div>
          ) : null
        }
      />

      {/* Tab bar */}
      <div className="border-y border-border bg-background shrink-0">
        <div className="flex items-center gap-4 px-4 pt-3 pb-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-t-lg border border-b-0 transition-all cursor-pointer select-none",
                  isActive
                    ? "bg-background text-foreground border-border shadow-sm z-10 -mb-px"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className={cn("size-3.5 shrink-0", isActive ? "text-primary" : "")} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {activeTab === "users" && (
          <div className="flex-1 min-h-0 p-4 overflow-hidden">
            <UsersPermissionsTab
              onAddUserRef={onAddUserRef}
              onRefetchRef={onRefetchUsersRef}
              onFetchingChange={setIsUsersFetching}
            />
          </div>
        )}

        {activeTab === "erp-roles" && (
          <div className="flex-1 min-h-0 p-4 flex flex-col overflow-hidden">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4 shrink-0">
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
        )}
      </div>
    </AppShell>
  );
}
