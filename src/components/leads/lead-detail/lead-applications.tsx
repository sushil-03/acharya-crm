import { Link } from "@tanstack/react-router";
import { useGetApplications } from "@/components/application/hook/query/use-get-applications";
import { LeadDetail } from "@/types/lead";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui-kit";
import { Progress } from "@/components/ui/progress";
import { getApplicationStatusTone } from "@/lib/constant";
import {
  Loader2,
  Plus,
  Calendar,
  Building,
  School,
  ClipboardList,
  ArrowRight,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeadApplicationsProps {
  lead: LeadDetail;
}

// Logic to determine active step based on status and completion percentage
const getActiveStepIndex = (status: string, completionPercent: number): number => {
  const lowerStatus = (status || "").toLowerCase();
  const isAppCompleted =
    lowerStatus === "submitted" ||
    lowerStatus === "completed" ||
    lowerStatus === "approved" ||
    lowerStatus === "verified" ||
    lowerStatus === "enrolled";

  const appActiveStep = isAppCompleted
    ? 5
    : Math.floor((completionPercent || 10) / 10);
  return Math.min(appActiveStep - 1, 4); // 0-indexed step: 0 to 4
};

// Theme configuration based on active step index
const getThemeClasses = (activeStepIndex: number) => {
  if (activeStepIndex <= 2) {
    return {
      glow: "bg-blue-600",
      progressClass: "[&>div]:bg-blue-600",
      textClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40",
      indicatorColor: "bg-blue-600",
    };
  } else if (activeStepIndex === 3) {
    return {
      glow: "bg-orange-500",
      progressClass: "[&>div]:bg-orange-500",
      textClass: "text-orange-600 dark:text-orange-400",
      bgClass: "bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/40",
      indicatorColor: "bg-orange-500",
    };
  } else {
    return {
      glow: "bg-emerald-600",
      progressClass: "[&>div]:bg-emerald-600",
      textClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40",
      indicatorColor: "bg-emerald-600",
    };
  }
};

// Status mapping and styling
const getStatusBadge = (status: string) => {
  const normalizedStatus = status?.toLowerCase().replace(/_/g, "-").trim();
  switch (normalizedStatus) {
    case "payment-pending":
      return {
        label: "Payment Pending",
        tone: "gold" as const,
      };
    case "started":
      return {
        label: "Started",
        tone: "primary" as const,
      };
    case "in-progress":
      return {
        label: "In Progress",
        tone: "primary" as const,
      };
    default:
      return {
        label: status || "Initiated",
        tone: getApplicationStatusTone(status) as any,
      };
  }
};

// Footer banner based on status
export function LeadApplications({ lead }: LeadApplicationsProps) {
  const { data: allApplications, isLoading } = useGetApplications();

  // Filter applications that belong to this lead
  const applications = allApplications?.filter((app) => app.leadId === lead.id) || [];
  console.log("application", applications);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading applications...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-xl p-8 text-center max-w-md mx-auto my-6 bg-muted/10">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <ClipboardList className="size-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base text-foreground mb-1">No Applications</h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-[280px]">
          This lead has not started any applications yet.
        </p>
        <Button asChild size="sm">
          <Link to="/application/start">
            <Plus className="size-4 mr-2" /> Start Application
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ClipboardList className="size-4 text-muted-foreground" />
          <span>Applications ({applications.length})</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {applications.map((app) => {
          const statusBadge = getStatusBadge(app.status || "Initiated");

          const appActiveStepIndex = getActiveStepIndex(app.status, app.completionPercent);
          const theme = getThemeClasses(appActiveStepIndex);

          const formattedDate = app.createdAt
            ? new Date(app.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A";

          // Use provided field names programName and specializationName with fallbacks
          const programTitle = app.programName || app.program?.name || lead.courseInterest || "N/A";

          return (
            <Card
              key={app.id}
              className="group relative overflow-hidden hover:shadow-md transition-all duration-200 border-border bg-card flex flex-col justify-between"
            >
              {/* Top dynamic border-glow on hover */}
              <div className={`absolute top-0 left-0 w-full h-[3px] bg-transparent group-hover:${theme.glow} transition-colors duration-200`} />

              <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between space-y-0 gap-2">
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="font-mono text-[10px] text-muted-foreground font-semibold block truncate">
                    {app.id}
                  </span>
                  <CardTitle
                    className="text-sm font-bold truncate text-foreground"
                    title={programTitle}
                  >
                    {programTitle}
                  </CardTitle>
                </div>
                <Badge tone={statusBadge.tone} className="capitalize text-[10px] font-semibold shrink-0">
                  {statusBadge.label}
                </Badge>
              </CardHeader>

              <CardContent className="p-4 pt-0 pb-3 space-y-3.5 flex-1">
                {/* Academic/Campus detailed list */}
                <div className="space-y-2 text-xs text-muted-foreground">
                  {app.schoolName && (
                    <div className="flex items-center gap-2">
                      <Building className="size-3.5 shrink-0 text-muted-foreground/70" />
                      <span className="truncate" title={app.schoolName}>
                        School: <span className="text-foreground font-medium">{app.schoolName}</span>
                      </span>
                    </div>
                  )}
                  {app.graduationName && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="size-3.5 shrink-0 text-muted-foreground/70" />
                      <span className="truncate" title={app.graduationName}>
                        Level: <span className="text-foreground font-medium">{app.graduationName}</span>
                      </span>
                    </div>
                  )}
                  {app.specializationName && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-3.5 shrink-0 text-muted-foreground/70" />
                      <span className="truncate" title={app.specializationName}>
                        Specialization: <span className="text-foreground font-medium">{app.specializationName}</span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <School className="size-3.5 shrink-0 text-muted-foreground/70" />
                    <span className="truncate">
                      Campus: <span className="text-foreground font-medium">{app.campusId || "Bengaluru Main"}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3.5 shrink-0 text-muted-foreground/70" />
                    <span>
                      Created: <span className="text-foreground font-medium">{formattedDate}</span>
                    </span>
                  </div>
                </div>

                {/* Progress bar with theme styling */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-medium">Completion Progress</span>
                    <span className={`font-bold ${theme.textClass}`}>{app.completionPercent || 0}%</span>
                  </div>
                  <Progress value={app.completionPercent || 0} className={`h-1.5 ${theme.progressClass}`} />
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex justify-end">
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs font-semibold group-hover:text-primary transition-colors"
                >
                  <Link to="/application/$applicationId" params={{ applicationId: app.id }}>
                    View Details
                    <ArrowRight className="size-3.5 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
