import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, Card } from "@/components/ui-kit";
import { PlayCircle, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import { getLeadsColumn } from "@/components/leads/lead-column";
import { useGetLeads } from "@/components/leads/hook/query/use-get-leads";
import InputSearch from "@/components/global/input-search";
import { useStartApplication } from "@/components/application/hook/mutation/use-start-application";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { AutocompleteField } from "@/components/ui/form-fields/autocomplete-field";
import { useGetPrograms } from "@/components/global/hooks/use-get-programs";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LEAD_STATUS, LEAD_SOURCES } from "@/lib/constant";

export const Route = createFileRoute("/application/start")({
  component: ApplicationStartPage,
  head: () => ({ meta: [{ title: "Start Application — Acharya One" }] }),
});

const ActionsCell = ({ row }: { row: any }) => {
  const { mutate: startApplication, isPending } = useStartApplication();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: programs, isLoading: programsLoading } = useGetPrograms();

  const form = useForm({
    defaultValues: {
      programId: row.original.courseInterest || "",
    },
  });

  const handleStart = form.handleSubmit((data) => {
    startApplication(
      {
        studentId: row.original.student.id,
        programId: data.programId,
        formData: {},
      },
      {
        onSuccess: () => {
          setOpen(false);
          // navigate({ to: "/applications" }); // or wherever appropriate
        },
      },
    );
  });

  const hasStarted = row.original.applications?.length > 0;
  const hasApproved = hasStarted && row.original.applications[0].status === "approved";
  const hasRejected = hasStarted && row.original.applications[0].status === "rejected";
  if (hasApproved) {
    return (
      <Button
        size="xs"
        variant="secondary"
        className=" text-[11px] gap-1 px-2.5 bg-success/15 text-success hover:bg-success/15 cursor-default"
      >
        <CheckCircle2 className="size-3" />
        Approved
      </Button>
    );
  }

  if (hasRejected) {
    return (
      <Button
        size="xs"
        variant="secondary"
        className=" text-[11px] gap-1 px-2.5 bg-destructive/15 text-destructive hover:bg-destructive/15 cursor-default"
      >
        <XCircle className="size-3" />
        Rejected
      </Button>
    );
  }

  if (hasStarted) {
    return (
      <Button
        size="xs"
        variant="secondary"
        className=" text-[11px] gap-1 px-2.5 bg-primary/15 text-primary hover:bg-primary/15 cursor-default"
      >
        <CheckCircle2 className="size-3" />
        Started
      </Button>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="xs" variant="default" className=" text-[11px] gap-1 px-2.5">
          <PlayCircle className="size-3" />
          Start
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start Application for {row.original.name}</AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col space-y-1">
            <span>Select a program to begin the application process.</span>
            <span>
              If there is no program available, you can{" "}
              <Link to="/programs/new" className="text-primary hover:underline font-medium">
                create a new program
              </Link>
              .
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form id={`start-app-form-${row.original.id}`} onSubmit={handleStart} className="py-4">
            <AutocompleteField
              control={form.control}
              name="programId"
              label="Program"
              placeholder="Select Program"
              isLoading={programsLoading}
              options={
                programs?.map((p) => ({
                  value: p.id,
                  label: p.name,
                  searchKeys: [p.code],
                })) || []
              }
              required
            />
          </form>
        </Form>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="submit"
            form={`start-app-form-${row.original.id}`}
            loading={isPending}
            disabled={isPending || !form.formState.isValid}
          >
            Confirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

function ApplicationStartPage() {
  const [tab, setTab] = useState("all");
  const [sourceChannel, setSourceChannel] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const { data, isLoading } = useGetLeads({
    search: q || undefined,
    status: tab === "all" ? undefined : tab,
    sourceChannel: sourceChannel === "all" ? undefined : sourceChannel,
    page,
    pageSize,
  });

  const totalPages = data?.meta ? Math.ceil(data.meta.total / data.meta.pageSize) : 1;

  const filtered = React.useMemo(() => {
    if (!data) return [];
    const filtered = data.data.filter((l) => l.student && l.applications.length === 0);
    return filtered.map((l) => ({
      ...l,
      program: l.courseInterest,
      campus: l.campusId,
      city: l.city,
      source: l.sourceChannel,
      stage: l.status,
      score: l.leadScore,
      counsellor: l.assignments,
      lastActivity: l.lastContactedAt ?? l.createdAt,
    }));
  }, [data]);
  console.log("filtered", filtered);
  const columns = React.useMemo(() => {
    const baseColumns = getLeadsColumn.filter((c: any) => c.id !== "actions");
    return [
      ...baseColumns,
      {
        id: "actions",
        header: () => "",
        accessorKey: "actions",
        meta: { label: "Actions" },
        enableSorting: false,
        enableHiding: false,
        size: 100,
        cell: ({ row }: any) => <ActionsCell row={row} />,
      },
    ];
  }, []);

  const dataGrid = useDataGrid({
    data: filtered,
    columns: columns,
    readOnly: true,
    manualPagination: true,
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

  return (
    <AppShell>
      <div className="mb-2 w-fit">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="px-2 -ml-2 text-muted-foreground h-auto py-1"
        >
          <Link to="/applications" className="flex items-center gap-1.5">
            <ArrowLeft className="size-4" /> Back to Applications
          </Link>
        </Button>
      </div>
      <PageHeader
        title="Start Application"
        subtitle="Select a lead to begin the application process."
      />
      <div className="flex flex-col h-full min-h-0 flex-1 ">
        <Card className="overflow-hidden h-full flex flex-col">
          <div className="p-3 border-b border-border flex flex-wrap items-center gap-3">
            <InputSearch
              searchTerm={q}
              setSearchTerm={setQ}
              className="h-7"
              placeholder="Search by name or ID..."
            />
            <div className="flex items-center gap-2 ml-auto">
              <Select value={tab} onValueChange={setTab}>
                <SelectTrigger size="xs" className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {LEAD_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sourceChannel} onValueChange={setSourceChannel}>
                <SelectTrigger size="xs" className="w-[140px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
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
            totalElements={data?.meta?.total ?? 0}
            className="flex-1"
          />
        </Card>
      </div>
    </AppShell>
  );
}
