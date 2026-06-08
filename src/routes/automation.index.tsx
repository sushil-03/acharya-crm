import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Settings2, Search, ChevronRight, Trash2, Copy, Zap } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { PageHeader, Card, Badge } from "../components/ui-kit";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { TemplateSelectModal } from "../components/automation/TemplateSelectModal";
import { getAutomations, deleteAutomation, saveAutomation } from "../store/automation-store";
import type { AutomationFlow } from "../types/automation-types";

export const Route = createFileRoute("/automation/")({
  component: AutomationPage,
});

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export default function AutomationPage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [triggerFilter, setTriggerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [automations, setAutomations] = useState<AutomationFlow[]>(() => getAutomations());

  const triggerTypes = useMemo(() => {
    const types = [...new Set(automations.map((a) => a.triggerType).filter(Boolean))];
    return types;
  }, [automations]);

  const filtered = useMemo(() => {
    return automations.filter((a) => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (triggerFilter !== "all" && a.triggerType !== triggerFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      return true;
    });
  }, [automations, search, triggerFilter, statusFilter]);

  function refresh() {
    setAutomations(getAutomations());
  }

  function handleDelete(id: string) {
    deleteAutomation(id);
    refresh();
  }

  function handleToggleStatus(flow: AutomationFlow) {
    const updated: AutomationFlow = {
      ...flow,
      status: flow.status === "published" ? "draft" : "published",
      lastPublishedOn: flow.status === "draft" ? new Date().toISOString() : flow.lastPublishedOn,
      modifiedOn: new Date().toISOString(),
    };
    saveAutomation(updated);
    refresh();
  }

  function handleClone(flow: AutomationFlow) {
    import("../store/automation-store").then(({ cloneAutomation }) => {
      const cloned = cloneAutomation(flow);
      saveAutomation(cloned);
      refresh();
    });
  }

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Automation"
        title="Automation"
        subtitle="Create and manage event-driven workflows across the admissions funnel."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="size-4 mr-1.5" /> Create Automation
          </Button>
        }
      />

      <div className="flex gap-6">
        {/* main table */}
        <div className="flex-1 min-w-0">
          {/* filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-48 max-w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search Automation"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={triggerFilter} onValueChange={setTriggerFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Trigger Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Triggers</SelectItem>
                {triggerTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground text-[12px] uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">Trigger Type</th>
                    <th className="text-right px-4 py-3 font-medium">Trigger Count</th>
                    <th className="text-left px-4 py-3 font-medium">Last Published On</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Modified On</th>
                    <th className="text-left px-4 py-3 font-medium">Modified By</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-muted-foreground">
                        No automations found.
                      </td>
                    </tr>
                  )}
                  {filtered.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            navigate({
                              to: "/automation/$automationId",
                              params: { automationId: a.id },
                            })
                          }
                          className="font-medium text-primary hover:underline text-left"
                        >
                          {a.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.triggerType || "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCount(a.triggerCount)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(a.lastPublishedOn)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={a.status === "published" ? "success" : "muted"}>
                          {a.status === "published" ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(a.modifiedOn)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.modifiedBy}</td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <Settings2 className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate({
                                  to: "/automation/$automationId",
                                  params: { automationId: a.id },
                                })
                              }
                            >
                              <ChevronRight className="size-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleClone(a)}>
                              <Copy className="size-4 mr-2" /> Clone
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(a)}>
                              <Zap className="size-4 mr-2" />
                              {a.status === "published" ? "Unpublish" : "Publish"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(a.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* right panel */}
        {/* <aside className="w-64 shrink-0 hidden xl:block">
          <Card className="p-4">
            <Button className="w-full mb-4" onClick={() => setShowCreate(true)}>
              <Plus className="size-4 mr-1.5" /> Create Automation
            </Button>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Related Settings
            </div>
            <ul className="space-y-1.5">
              {["Automation Failure Report", "Automation Termination Report"].map((s) => (
                <li key={s}>
                  <button className="text-sm text-primary hover:underline text-left">{s}</button>
                </li>
              ))}
            </ul>
          </Card>
        </aside> */}
      </div>

      <TemplateSelectModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(id) =>
          navigate({ to: "/automation/$automationId", params: { automationId: id } })
        }
      />
    </AppShell>
  );
}
