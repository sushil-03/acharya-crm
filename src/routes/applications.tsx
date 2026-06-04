import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, StatCard, Badge } from "@/components/ui-kit";
import { applications } from "@/lib/mock-data";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Plus,
  ArrowUpRight,
  LayoutDashboard,
  Table,
} from "lucide-react";
import { ApplicationTableView } from "@/components/application/application-table-view";
import { ApplicationKanbanView } from "@/components/application/application-kanban-view";
import ViewToggle from "@/components/global/view-toggle";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/applications")({
  component: AppsPage,
  head: () => ({ meta: [{ title: "Applications — Acharya One" }] }),
});

const cols = ["Draft", "Submitted", "Under Review", "Documents Pending", "Approved", "Rejected"];

function AppsPage() {
  // const [view, setView] = useState("table");
  // const viewOptions = [
  //   {
  //     value: "kanban",
  //     label: "Kanban",
  //     icon: <LayoutDashboard className="size-4" />,
  //   },
  //   { value: "table", label: "Table", icon: <Table className="size-4" /> },
  // ];
  return (
    <AppShell className="h-screen min-h-0">
      <PageHeader
        title="Application Management"
        subtitle="Live tracker of every application, document and reviewer decision."
        actions={
          <>
            <Button asChild>
              <Link to="/application/start">
                <Plus className="size-4" /> Start Application
              </Link>
            </Button>
            {/* <ViewToggle value={view} onChange={setView} options={viewOptions} /> */}
          </>
        }
      />

      <div className="flex flex-col min-h-0 flex-1">
        <ApplicationTableView />
      </div>
      {/* {view === "table" ?  : <ApplicationKanbanView />} */}
    </AppShell>
  );
}
