import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, StatCard, Badge } from "@/components/ui-kit";
import { PhoneCall, Mail, MessageSquare, PlusCircle, CheckCircle2, Clock, Calendar, Search, Loader2 } from "lucide-react";
import React, { useState, useMemo } from "react";
import { useGetTasks } from "@/components/leads/hook/query/use-get-task";
import { useUserStore } from "@/store/use-user-store";
import { useGetCounsellors } from "@/components/global/hooks/use-get-counsellor";
import { getReadableDate } from "@/lib/utils";

export const Route = createFileRoute("/activities")({
  component: ActivitiesPage,
  head: () => ({ meta: [{ title: "Activities Log — Acharya One" }] }),
});

function ActivitiesPage() {
  const { user, counsellorId } = useUserStore();
  const { data: counsellors, isLoading: isLoadingCounsellors } = useGetCounsellors();
  const [filterType, setFilterType] = useState<string>("all");
  const [q, setQ] = useState("");

  const isCounsellor = user?.role === "counsellor" || user?.role === "councellor";

  const resolvedCounsellorId = React.useMemo(() => {
    if (counsellorId) return counsellorId;
    if (isCounsellor && counsellors) {
      return counsellors.find((c) => c.userId === user?.id)?.id;
    }
    return undefined;
  }, [counsellorId, isCounsellor, counsellors, user?.id]);

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    counsellorId: isCounsellor ? resolvedCounsellorId : undefined,
  });

  // Filter tasks to build the activities feed
  const activities = useMemo(() => {
    if (!tasks) return [];
    
    return tasks
      .filter((t) => {
        // Apply text search
        if (q) {
          const search = q.toLowerCase();
          const matchesSearch = 
            t.lead?.name?.toLowerCase().includes(search) ||
            t.notes?.toLowerCase().includes(search) ||
            t.taskType?.toLowerCase().includes(search);
          if (!matchesSearch) return false;
        }

        // Apply type filter
        if (filterType !== "all") {
          if (filterType === "call" && !(t.taskType === "follow_up" || t.taskType === "call_back")) return false;
          if (filterType === "docs" && t.taskType !== "send_documents") return false;
          if (filterType === "reminder" && !t.taskType.includes("reminder")) return false;
        }

        return true;
      })
      .map((t) => {
        // Determine type-specific fields for visual appeal
        let typeLabel = "Activity";
        let icon = <PlusCircle className="size-4 text-primary" />;
        let bgClass = "bg-primary/10 border-primary/20";
        let textClass = "text-primary";

        if (t.taskType === "follow_up" || t.taskType === "call_back") {
          typeLabel = "Outbound Call";
          icon = <PhoneCall className="size-4 text-emerald-500" />;
          bgClass = "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30";
          textClass = "text-emerald-700 dark:text-emerald-400";
        } else if (t.taskType === "send_documents") {
          typeLabel = "Document Request";
          icon = <Mail className="size-4 text-blue-500" />;
          bgClass = "bg-blue-50/70 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30";
          textClass = "text-blue-700 dark:text-blue-400";
        } else if (t.taskType.includes("reminder")) {
          typeLabel = "System Notification";
          icon = <MessageSquare className="size-4 text-amber-500" />;
          bgClass = "bg-amber-50/70 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30";
          textClass = "text-amber-700 dark:text-amber-400";
        }

        return {
          ...t,
          typeLabel,
          icon,
          bgClass,
          textClass,
        };
      });
  }, [tasks, filterType, q]);

  if (isLoadingTasks || (isCounsellor && !resolvedCounsellorId && isLoadingCounsellors)) {
    return (
      <AppShell>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  const callsCount = tasks?.filter((t) => t.taskType === "follow_up" || t.taskType === "call_back").length || 0;
  const docsCount = tasks?.filter((t) => t.taskType === "send_documents").length || 0;
  const completedCount = tasks?.filter((t) => t.taskStatus === "completed").length || 0;

  return (
    <AppShell className="h-screen overflow-hidden" noPadding>
      <PageHeader
        title="Activities Log"
        subtitle="Chronological feed of lead engagements, tasks, calls, and follow-up activities."
      />
      <div className="flex flex-col min-h-0 flex-1 border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 shrink-0 bg-muted/10">
          <StatCard
            label="Total Logged Activities"
            value={(tasks?.length || 0).toString()}
            icon={<Calendar className="size-4" />}
            accent="primary"
          />
          <StatCard
            label="Calls Attempted"
            value={callsCount.toString()}
            icon={<PhoneCall className="size-4" />}
            accent="success"
          />
          <StatCard
            label="Activities Completed"
            value={completedCount.toString()}
            icon={<CheckCircle2 className="size-4" />}
            accent="info"
          />
        </div>

        <div className="flex flex-col md:flex-row min-h-0 flex-1">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 border-r border-border p-4 bg-background shrink-0 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Search Activities
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by lead, notes..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-border bg-muted/30 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Activity Types
              </label>
              <div className="space-y-1">
                {[
                  { value: "all", label: "All Engagements" },
                  { value: "call", label: "Calls Made" },
                  { value: "docs", label: "Document Tasks" },
                  { value: "reminder", label: "Reminders & Alerts" },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFilterType(type.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                      filterType === type.value
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Activities Timeline Feed */}
          <div className="flex-1 overflow-y-auto p-6 bg-muted/5 scrollbar-thin">
            {activities.length === 0 ? (
              <Card className="p-12 text-center max-w-lg mx-auto mt-8">
                <div className="text-4xl mb-3">💬</div>
                <div className="font-semibold text-foreground mb-1">No activities found</div>
                <div className="text-sm text-muted-foreground">
                  Try adjusting your search criteria or activity type filters.
                </div>
              </Card>
            ) : (
              <div className="relative pl-6 border-l border-border space-y-6 max-w-3xl mx-auto">
                {activities.map((act) => {
                  const leadName = act.lead?.name || "Unknown Lead";
                  return (
                    <div key={act.id} className="relative group">
                      {/* Timeline Dot with Icon */}
                      <div className={`absolute -left-[39px] top-1.5 size-6 rounded-full border bg-background flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105 ${act.bgClass}`}>
                        {act.icon}
                      </div>

                      {/* Timeline Content Card */}
                      <Card className="p-4 transition-all duration-200 group-hover:border-primary/30 group-hover:shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${act.bgClass} ${act.textClass}`}>
                              {act.typeLabel}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="size-3" />
                              {getReadableDate(act.dueDate)}
                            </span>
                          </div>
                          <Badge tone={act.taskStatus === "completed" ? "success" : "warning"}>
                            {act.taskStatus.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="text-sm font-semibold text-foreground mb-1">
                          Lead engagement with{" "}
                          <Link
                            to="/leads/$leadId"
                            params={{ leadId: act.leadId }}
                            className="text-primary hover:underline font-semibold"
                          >
                            {leadName}
                          </Link>
                        </div>

                        {act.notes && (
                          <div className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-md border border-border/30 mt-2 font-medium">
                            {act.notes}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/40 text-[11px] text-muted-foreground">
                          <span>Counsellor: {act.counsellor?.name || "Unassigned"}</span>
                          {act.completedAt && (
                            <span className="text-success">Done at: {getReadableDate(act.completedAt)}</span>
                          )}
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
