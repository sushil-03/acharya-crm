import { KanbanBoard } from "@/components/kanban-board";
import { Card } from "@/components/ui-kit";
import { useGetApplications } from "./hook/query/use-get-applications";
import { useMemo, useState } from "react";
import { APPLICATION_STATUS, getApplicationStatusLabel } from "@/lib/constant";
import InputSearch from "@/components/global/input-search";

const cols = APPLICATION_STATUS.map((s) => s.label);

export function ApplicationKanbanView() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useGetApplications();

  const formattedData = useMemo(() => {
    if (!data) return [];
    const formatted = data.map((app) => ({
      ...app,
      id: app.id,
      student:
        `${app.student?.firstName || ""} ${app.student?.lastName === "-" ? "" : app.student?.lastName || ""}`.trim(),
      program: app.program?.name || app.programId,
      campus: app.campusId,
      status: getApplicationStatusLabel(app.status || "started"),
      progress: app.completionPercent || 0,
      fee: 0,
      submitted: app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "-",
    }));

    return formatted.filter((app) => {
      const matchesSearch =
        app.student.toLowerCase().includes(q.toLowerCase()) ||
        app.id.toLowerCase().includes(q.toLowerCase());
      return matchesSearch;
    });
  }, [data, q]);

  return (
    <Card className="h-[calc(100vh-280px)] overflow-hidden flex flex-col">
      <div className="p-3 border-b border-border flex flex-wrap items-center gap-3 shrink-0">
        <InputSearch
          searchTerm={q}
          setSearchTerm={setQ}
          className="h-7 w-[250px]"
          placeholder="Search by student or ID..."
        />
      </div>
      <div className="p-5 flex-1 overflow-auto">
        <KanbanBoard initialItems={formattedData} columns={cols} readOnly />
      </div>
    </Card>
  );
}
