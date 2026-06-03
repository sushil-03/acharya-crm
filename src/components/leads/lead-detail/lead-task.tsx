import { useState } from "react";
import { format } from "date-fns";
import { CheckSquare, Calendar, Edit, PhoneCall, FileText, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateTaskModal } from "./create-task-modal";
import { UpdateTaskModal } from "./update-task-modal";
import { useGetTasks, Task } from "../hook/query/use-get-task";
import { LeadDetail } from "@/types/lead";
import { Skeleton } from "@/components/ui/skeleton";

export function LeadTask({ lead }: { lead: LeadDetail }) {
  const { data: tasks, isLoading } = useGetTasks({ leadId: lead.id });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const handleUpdateClick = (task: Task) => {
    setSelectedTask(task);
    setIsUpdateModalOpen(true);
  };

  const getTaskStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "overdue":
        return "bg-danger/10 text-danger border-danger/20";
      case "pending":
      default:
        return "bg-warning/10 text-warning border-warning/20";
    }
  };

  const getTaskIcon = (type: string, status: string) => {
    const isCompleted = status.toLowerCase() === "completed";
    const className = `size-4 ${isCompleted ? "text-success" : "text-muted-foreground"}`;
    
    switch (type.toLowerCase()) {
      case "follow_up":
      case "call_back":
        return <PhoneCall className={className} />;
      case "send_documents":
        return <FileText className={className} />;
      case "application_reminder":
      case "payment_reminder":
        return <Bell className={className} />;
      default:
        return <CheckSquare className={className} />;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    return type.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const sortedTasks = tasks ? [...tasks].sort((a, b) => {
    if (a.taskStatus === "completed" && b.taskStatus !== "completed") return 1;
    if (a.taskStatus !== "completed" && b.taskStatus === "completed") return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }) : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Upcoming Tasks</h3>
        <CreateTaskModal lead={lead} />
      </div>

      <div className="pt-1">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            No tasks found. Create one to get started.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />
            <div className="space-y-6">
              {sortedTasks.map((task) => (
                <div key={task.id} className="relative flex items-start gap-4 group">
                  <div
                    className={`size-8 rounded-full border grid place-items-center shrink-0 z-10 transition-colors ${
                      task.taskStatus === "completed"
                        ? "bg-success/10 border-success/30"
                        : "bg-background border-border group-hover:border-primary/50"
                    }`}
                  >
                    {getTaskIcon(task.taskType, task.taskStatus)}
                  </div>

                  <div className="flex-1 mt-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-[13px] font-semibold flex items-center gap-1.5 ${
                            task.taskStatus === "completed"
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {getTaskTypeLabel(task.taskType)}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0 border ${getTaskStatusColor(
                            task.taskStatus
                          )}`}
                        >
                          {task.taskStatus}
                        </Badge>
                      </div>
                    </div>

                    {task.notes && (
                      <p className="text-[13px] text-muted-foreground leading-relaxed mb-2">
                        {task.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      <div
                        className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                          task.taskStatus === "overdue"
                            ? "bg-danger/10 text-danger"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <Calendar className="size-3.5" />
                        Due: {format(new Date(task.dueDate), "MMM d, yyyy h:mm a")}
                      </div>

                      {task.completedAt && (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-md">
                          <CheckSquare className="size-3.5" />
                          Completed: {format(new Date(task.completedAt), "MMM d, yyyy")}
                        </div>
                      )}

                      {task.taskStatus !== "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-3 ml-1 text-[11px] font-medium bg-background"
                          onClick={() => handleUpdateClick(task)}
                        >
                          Update Task
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <UpdateTaskModal
        task={selectedTask}
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
      />
    </div>
  );
}
