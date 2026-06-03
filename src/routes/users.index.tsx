import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, StatCard } from "@/components/ui-kit";
import { Users, UserCheck, Shield, Activity, Download, Plus } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import { getUsersColumn } from "@/components/user/user-column";
import { useGetUsers } from "@/components/user/hook/query/use-get-users";
import InputSearch from "@/components/global/input-search";

export const Route = createFileRoute("/users/")({
  component: UsersPage,
  head: () => ({ meta: [{ title: "User Management — Acharya One" }] }),
});

function UsersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const navigate = useNavigate();

  const { data, isLoading } = useGetUsers();

  const filtered = React.useMemo(() => {
    if (!data) return [];
    return data.filter((u) => {
      if (!q) return true;
      const search = q.toLowerCase();
      return (
        (u.username && u.username.toLowerCase().includes(search)) ||
        (u.email && u.email.toLowerCase().includes(search)) ||
        (u.role && u.role.toLowerCase().includes(search))
      );
    });
  }, [data, q]);

  const dataGrid = useDataGrid({
    data: filtered,
    columns: getUsersColumn,
    readOnly: true,
    manualPagination: false, // Since API returns all users
    initialState: {
      columnPinning: { right: ["actions"] },
    },
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

  const activeUsers = data?.filter((u) => u.isActive).length || 0;
  const adminUsers = data?.filter((u) => u.role.toLowerCase().includes("admin")).length || 0;

  return (
    <AppShell>
      <PageHeader
        title="User Management"
        subtitle="Manage user access, roles, and platform permissions."
        actions={
          <>
            <Button onClick={() => navigate({ to: "/users/new" })}>
              <Plus className="size-4" /> Create User
            </Button>
          </>
        }
      />
      <div className="flex flex-col h-full min-h-0 flex-1">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Users"
            value={(data?.length || 0).toString()}
            icon={<Users className="size-4" />}
          />
          <StatCard
            label="Active Users"
            value={activeUsers.toString()}
            icon={<UserCheck className="size-4" />}
            accent="success"
          />
          <StatCard
            label="Administrators"
            value={adminUsers.toString()}
            icon={<Shield className="size-4" />}
            accent="info"
          />
          <StatCard
            label="Recent Logins"
            value={(
              data?.filter(
                (u) =>
                  u.lastLoginAt &&
                  new Date(u.lastLoginAt).getTime() > Date.now() - 24 * 60 * 60 * 1000,
              ).length || 0
            ).toString()}
            icon={<Activity className="size-4" />}
            accent="warning"
          />
        </div>

        <Card className="overflow-hidden h-full flex flex-col">
          <div className="p-3 border-b border-border flex flex-wrap items-center gap-3">
            <InputSearch
              searchTerm={q}
              setSearchTerm={setQ}
              className="h-7"
              placeholder="Search by name, email, or role..."
            />
            <div className="flex items-center gap-2 ml-auto">
              <DataGridViewMenu table={dataGrid.table} />
              <DataGridRowHeightMenu table={dataGrid.table} />
            </div>
          </div>

          <DataGrid
            {...dataGrid}
            stretchColumns
            showPagination
            totalElements={filtered.length}
            className="flex-1"
          />
        </Card>
      </div>
    </AppShell>
  );
}
