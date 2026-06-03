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
    <AppShell>
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

      {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Applications"
          value="3,210"
          delta="+12.4%"
          icon={<FileText className="size-4" />}
        />
        <StatCard
          label="Approved"
          value="1,840"
          delta="+18%"
          icon={<CheckCircle2 className="size-4" />}
          accent="success"
        />
        <StatCard
          label="Pending Review"
          value="412"
          icon={<Clock className="size-4" />}
          accent="warning"
        />
        <StatCard
          label="Avg Decision Time"
          value="2.4d"
          delta="-0.6d"
          icon={<ArrowUpRight className="size-4" />}
          accent="info"
        />
      </div> */}
      <ApplicationTableView />
      {/* {view === "table" ?  : <ApplicationKanbanView />} */}
    </AppShell>
  );
}
