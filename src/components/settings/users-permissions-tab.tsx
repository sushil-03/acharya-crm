import { useState, useMemo, useEffect } from "react";
import { RefreshCw, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, Card } from "@/components/ui-kit";
import { USER_ROLES } from "@/lib/constant";
import { useGetRolesSummary } from "./hook/query/use-get-roles-summary";
import { useGetUsersPaginated, type PaginatedUser } from "./hook/query/use-get-users-paginated";
import { useCreateUser } from "@/components/user/hook/mutation/use-create-user";
import { useUpdateUser } from "@/components/user/hook/mutation/use-update-user";
import { UserFormModal } from "./user-form-modal";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import { getUserColumns } from "./user-column";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import { cn } from "@/lib/utils";

const roleLabelMap = Object.fromEntries(USER_ROLES.map((r) => [r.value, r.label]));

function RoleCard({
  role,
  totalUsers,
  activeUsers,
  isSelected,
  onClick,
}: {
  role: string;
  totalUsers: number;
  activeUsers: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const label = role ? (roleLabelMap[role] ?? role) : "All Roles";
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-lg border transition-all",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-background hover:border-primary/40 hover:bg-muted/50",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-[13px] font-medium leading-tight truncate",
            isSelected ? "text-primary" : "text-foreground",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "text-[11px] font-semibold tabular-nums shrink-0 rounded-full px-2 py-0.5",
            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {totalUsers}
        </span>
      </div>
      {totalUsers > 0 && (
        <div className="mt-1 text-[11px] text-muted-foreground">
          {activeUsers} active
          {totalUsers - activeUsers > 0 && `, ${totalUsers - activeUsers} inactive`}
        </div>
      )}
    </button>
  );
}

export interface UsersPermissionsTabProps {
  onAddUserRef?: React.MutableRefObject<(() => void) | null>;
  onRefetchRef?: React.MutableRefObject<(() => void) | null>;
  onFetchingChange?: (isFetching: boolean) => void;
}

export function UsersPermissionsTab({
  onAddUserRef,
  onRefetchRef,
  onFetchingChange,
}: UsersPermissionsTabProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PaginatedUser | null>(null);

  const {
    data: rolesSummary,
    isLoading: isLoadingRoles,
    refetch: refetchRoles,
  } = useGetRolesSummary();
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    refetch: refetchUsers,
  } = useGetUsersPaginated({
    role: selectedRole ?? undefined,
    search: search || undefined,
    page,
    pageSize,
  });

  const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

  useEffect(() => {
    if (onAddUserRef) {
      onAddUserRef.current = () => {
        setEditingUser(null);
        setIsModalOpen(true);
      };
    }
    return () => {
      if (onAddUserRef) onAddUserRef.current = null;
    };
  }, [onAddUserRef]);

  useEffect(() => {
    if (onRefetchRef) {
      onRefetchRef.current = () => {
        refetchRoles();
        refetchUsers();
      };
    }
    return () => {
      if (onRefetchRef) onRefetchRef.current = null;
    };
  }, [onRefetchRef, refetchRoles, refetchUsers]);

  const isFetching = isFetchingUsers || isLoadingUsers || isLoadingRoles;
  useEffect(() => {
    onFetchingChange?.(isFetching);
  }, [isFetching, onFetchingChange]);

  const summaryMap = useMemo(() => {
    if (!rolesSummary) return {} as Record<string, { totalUsers: number; activeUsers: number }>;
    return Object.fromEntries(
      rolesSummary.map((r) => [r.role, { totalUsers: r.totalUsers, activeUsers: r.activeUsers }]),
    );
  }, [rolesSummary]);

  const handleRoleClick = (role: string) => {
    setSelectedRole((prev) => (prev === role ? null : role));
    setSearch("");
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const users = usersData?.data ?? [];
  const total = usersData?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const columns = useMemo(
    () =>
      getUserColumns({
        roleLabelMap,
        onEditUser: (user) => {
          setEditingUser(user);
          setIsModalOpen(true);
        },
        updateUser,
        refetchUsers,
        refetchRoles,
      }),
    [updateUser, refetchUsers, refetchRoles],
  );

  const dataGrid = useDataGrid({
    data: users,
    columns,
    readOnly: true,
    manualPagination: true,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex: page - 1, pageSize });
        setPage(newState.pageIndex + 1);
        setPageSize(newState.pageSize);
      } else {
        setPage(updater.pageIndex + 1);
        setPageSize(updater.pageSize);
      }
    },
  });

  return (
    <div className="flex gap-4 h-full min-h-0">
      {/* Left — Role cards */}
      <div className="w-56 shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
        {isLoadingRoles ? (
          <div className="space-y-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <RoleCard
              role=""
              totalUsers={rolesSummary?.reduce((s, r) => s + r.totalUsers, 0) ?? 0}
              activeUsers={rolesSummary?.reduce((s, r) => s + r.activeUsers, 0) ?? 0}
              isSelected={selectedRole === null}
              onClick={() => {
                setSelectedRole(null);
                setSearch("");
                setPage(1);
              }}
            />
            <div className="h-px bg-border my-1" />
            {USER_ROLES.map((r) => {
              const stats = summaryMap[r.value] ?? { totalUsers: 0, activeUsers: 0 };
              return (
                <RoleCard
                  key={r.value}
                  role={r.value}
                  totalUsers={stats.totalUsers}
                  activeUsers={stats.activeUsers}
                  isSelected={selectedRole === r.value}
                  onClick={() => handleRoleClick(r.value)}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Right — Users list */}
      <Card className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-3 shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name or email…"
              className="pl-8 h-8 text-[13px]"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isFetchingUsers && !isLoadingUsers && (
              <RefreshCw className="size-3.5 text-muted-foreground animate-spin" />
            )}

            <DataGridViewMenu table={dataGrid.table} />
            <DataGridRowHeightMenu table={dataGrid.table} />
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          {isLoadingUsers ? (
            <div className="space-y-0 divide-y divide-border p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="size-8 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
              <div className="size-12 rounded-2xl bg-muted grid place-items-center">
                <Users className="size-5 text-muted-foreground" />
              </div>
              <div className="font-semibold text-[14px]">No users found</div>
              <p className="text-[13px] text-muted-foreground max-w-xs">
                {selectedRole
                  ? `No users with the "${roleLabelMap[selectedRole]}" role yet.`
                  : "No users match your search."}
              </p>
            </div>
          ) : (
            <DataGrid
              {...dataGrid}
              stretchColumns
              showPagination
              totalElements={total}
              className="h-full"
            />
          )}
        </div>
      </Card>

      <UserFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingUser={editingUser}
        isPending={isCreating || isUpdating}
        onSubmit={async (values) => {
          if (editingUser) {
            await updateUser({
              id: editingUser.id,
              payload: {
                role: values.role,
                campusId: values.campusId || null,
                isActive: values.isActive,
              },
            });
          } else {
            await createUser({
              email: values.email,
              password: values.password,
              role: values.role,
              campusId: values.campusId || undefined,
            });
          }
          refetchUsers();
          refetchRoles();
        }}
      />
    </div>
  );
}
