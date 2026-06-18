import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, StatCard } from "@/components/ui-kit";
import { UserCheck, GraduationCap, Building2 } from "lucide-react";
import React, { useState } from "react";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import InputSearch from "@/components/global/input-search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetEnrollments } from "@/components/enrollment/hook/query/use-get-enrollment";
import { getEnrollmentColumns } from "@/components/enrollment/enrollment-column";

export const Route = createFileRoute("/enrollment/")({
  component: EnrollmentPage,
});

function EnrollmentPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const { data: enrollmentsData, isLoading } = useGetEnrollments({
    enrollmentStatus: status === "all" ? undefined : status,
    // Add campusId if needed, using a static string for demonstration or based on state
  });

  const enrollments = enrollmentsData || [];

  const confirmedCount = enrollments.filter((e) => e.enrollmentStatus?.toLowerCase() === "confirmed").length;
  const pendingCount = enrollments.filter((e) => e.enrollmentStatus?.toLowerCase() === "pending").length;
  const syncedCount = enrollments.filter((e) => e.erpSyncStatus?.toLowerCase() === "synced").length;
  const syncPercentage = enrollments.length > 0 ? ((syncedCount / enrollments.length) * 100).toFixed(1) + "%" : "0%";
  const orientationBookedCount = enrollments.filter((e) => !!e.orientationAt).length;

  const filteredData = React.useMemo(() => {
    let data = enrollments;
    if (q) {
      const lowerQ = q.toLowerCase();
      data = data.filter((e) => {
        const name = `${e.student?.firstName || ""} ${e.student?.lastName || ""}`.toLowerCase();
        return (
          name.includes(lowerQ) ||
          e.studentIdGenerated?.toLowerCase().includes(lowerQ) ||
          e.student?.email?.toLowerCase().includes(lowerQ)
        );
      });
    }
    return data;
  }, [enrollments, q]);

  const dataGrid = useDataGrid({
    data: filteredData,
    columns: getEnrollmentColumns,
    readOnly: true,
    manualPagination: false, // Set to true if API supports pagination
    initialState: {
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
    <AppShell>
      <PageHeader
        // breadcrumb="Conversion"
        title="Enrollment Engine"
        subtitle="Confirmation tracker, student ID generation and ERP sync."
      />
      <div className="flex flex-col h-full min-h-0 flex-1">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Confirmed Enrollments"
            value={confirmedCount.toString()}
            icon={<UserCheck className="size-4" />}
            accent="success"
          />
          <StatCard
            label="Pending Confirmation"
            value={pendingCount.toString()}
            icon={<GraduationCap className="size-4" />}
            accent="warning"
          />
          <StatCard
            label="ERP Sync Status"
            value={syncPercentage}
            accent="info"
            icon={<Building2 className="size-4" />}
          />
          <StatCard label="Orientation Booked" value={orientationBookedCount.toString()} accent="primary" />
        </div>

        <Card className="overflow-hidden h-full flex flex-col">
          <div className="p-3 border-b border-border flex flex-wrap items-center gap-3">
            <InputSearch
              searchTerm={q}
              setSearchTerm={setQ}
              className="h-7"
              placeholder="Search by name, ID or email..."
            />
            <div className="flex items-center gap-2 ml-auto">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger size="xs" className="w-[140px] ">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
            loading={isLoading}
            totalElements={filteredData.length}
            className="flex-1"
          />
        </Card>
      </div>
    </AppShell>
  );
}
