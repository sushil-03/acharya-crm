import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, Card, StatCard } from "@/components/ui-kit";
import { CheckSquare, Clock, CheckCircle, AlertTriangle, Download, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import { getTasksColumn } from "@/components/tasks/task-column";
import { useGetTasks } from "@/components/leads/hook/query/use-get-task";
import { useGetCounsellors } from "@/components/global/hooks/use-get-counsellor";
import { useUserStore } from "@/store/use-user-store";
import InputSearch from "@/components/global/input-search";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
  head: () => ({ meta: [{ title: "Task Management — Acharya One" }] }),
});

function TasksPage() {
  const { user, counsellorId } = useUserStore();
  const { data: counsellors, isLoading: isLoadingCounsellors } = useGetCounsellors();

  const isSuperAdmin = user?.role === "super_admin";
  const isCounsellor = user?.role === "counsellor" || user?.role === "councellor";

  // Resolve counselor ID for logged-in counselor
  const resolvedCounsellorId = React.useMemo(() => {
    if (counsellorId) return counsellorId;
    if (isCounsellor && counsellors) {
      return counsellors.find((c) => c.userId === user?.id)?.id;
    }
    return undefined;
  }, [counsellorId, isCounsellor, counsellors, user?.id]);

  const [selectedCounsellor, setSelectedCounsellor] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // Set counselor query filter based on role
  const queryCounsellorId = isSuperAdmin
    ? selectedCounsellor === "all"
      ? undefined
      : selectedCounsellor
    : resolvedCounsellorId;

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    counsellorId: queryCounsellorId,
    taskStatus: statusFilter === "all" ? undefined : (statusFilter as any),
  });

  // Calculate statistics from the retrieved tasks array
  const totalTasks = tasks?.length || 0;
  const pendingTasks = tasks?.filter((t) => t.taskStatus === "pending").length || 0;
  const completedTasks = tasks?.filter((t) => t.taskStatus === "completed").length || 0;
  const overdueTasks = tasks?.filter((t) => t.taskStatus === "overdue").length || 0;

  // Filter tasks in-memory based on search queries (lead name, notes, or type)
  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((t) => {
      if (!q) return true;
      const search = q.toLowerCase();
      return (
        t.lead?.name?.toLowerCase().includes(search) ||
        t.notes?.toLowerCase().includes(search) ||
        t.taskType?.toLowerCase().includes(search)
      );
    });
  }, [tasks, q]);

  const dataGrid = useDataGrid({
    data: filteredTasks,
    columns: getTasksColumn,
    readOnly: true,
    manualPagination: false, // In-memory pagination matches /counsellor index page
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

  // Display a loading state if we are still resolving the counselor profile for a counselor
  if (isCounsellor && !resolvedCounsellorId && isLoadingCounsellors) {
    return (
      <AppShell>
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Task Management"
        subtitle="Manage and track lead engagement follow-ups, calls, reminders, and schedules."
      />
      <div className="flex flex-col h-full min-h-0 flex-1">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Tasks"
            value={totalTasks.toString()}
            icon={<CheckSquare className="size-4" />}
          />
          <StatCard
            label="Pending Tasks"
            value={pendingTasks.toString()}
            icon={<Clock className="size-4" />}
            accent="warning"
          />
          <StatCard
            label="Completed Tasks"
            value={completedTasks.toString()}
            icon={<CheckCircle className="size-4" />}
            accent="success"
          />
          <StatCard
            label="Overdue Tasks"
            value={overdueTasks.toString()}
            icon={<AlertTriangle className="size-4" />}
            accent="warning"
          />
        </div>

        <Card className="overflow-hidden h-full flex flex-col">
          <div className="p-3 border-b border-border flex flex-wrap items-center gap-3">
            <InputSearch
              searchTerm={q}
              setSearchTerm={setQ}
              className="h-7 w-[250px]"
              placeholder="Search by lead name, notes..."
            />
            <div className="flex items-center gap-2 ml-auto">
              {/* Counselor Filter Selector (Super Admin role only) */}
              {isSuperAdmin && (
                <Select value={selectedCounsellor} onValueChange={setSelectedCounsellor}>
                  <SelectTrigger size="xs" className="w-[180px]">
                    <SelectValue placeholder="All Counsellors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Counsellors</SelectItem>
                    {counsellors?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Status Selector Filter (All roles) */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger size="xs" className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <DataGridViewMenu table={dataGrid.table} />
              <DataGridRowHeightMenu table={dataGrid.table} />
            </div>
          </div>

          <DataGrid
            {...dataGrid}
            stretchColumns
            showPagination
            totalElements={filteredTasks.length}
            className="flex-1"
          />
        </Card>
      </div>
    </AppShell>
  );
}
