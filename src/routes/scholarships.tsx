import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, StatCard } from "@/components/ui-kit";
import { Award, FileText, Sparkles } from "lucide-react";
import { ScholarshipTableView } from "@/components/scholarship/scholarship-table-view";

export const Route = createFileRoute("/scholarships")({
  component: () => (
    <AppShell>
      <PageHeader title="Scholarships" subtitle="View all scholarship applications." />
      {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Offers Issued"
          value="1,840"
          delta="+18%"
          icon={<FileText className="size-4" />}
        />
        <StatCard
          label="Scholarships Granted"
          value="412"
          icon={<Award className="size-4" />}
          accent="gold"
        />
        <StatCard
          label="Avg Discount"
          value="22%"
          icon={<Sparkles className="size-4" />}
          accent="info"
        />
        <StatCard label="Acceptance Rate" value="68%" delta="+4pp" accent="success" />
      </div> */}

      <ScholarshipTableView />
    </AppShell>
  ),
});
