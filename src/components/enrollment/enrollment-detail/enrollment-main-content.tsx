import { Enrollment } from "../hook/query/use-get-enrollment";
import { Card } from "@/components/ui-kit";
import { CheckCircle2, Clock, CalendarClock, Building2, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui-kit";
import { formatDate } from "@/lib/format";
import { getReadableDate } from "@/lib/utils";

export function EnrollmentMainContent({ enrollment }: { enrollment: Enrollment }) {
  return (
    <div className="flex-1 bg-muted/30 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">Enrollment Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 grid place-items-center text-primary">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[15px]">Enrollment Status</h3>
                <p className="text-sm text-muted-foreground">Current state of confirmation</p>
              </div>
            </div>
            <div className="mt-2 bg-muted/50 rounded-md p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge
                tone={
                  enrollment.enrollmentStatus === "confirmed"
                    ? "success"
                    : enrollment.enrollmentStatus === "pending"
                      ? "warning"
                      : "danger"
                }
                className="uppercase text-xs"
              >
                {enrollment.enrollmentStatus}
              </Badge>
            </div>
          </Card>

          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-blue-500/10 grid place-items-center text-blue-600">
                <Clock className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[15px]">ERP Synchronization</h3>
                <p className="text-sm text-muted-foreground">Status of sync with main ERP</p>
              </div>
            </div>
            <div className="mt-2 bg-muted/50 rounded-md p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sync Status</span>
                <Badge
                  tone={enrollment.erpSyncStatus === "synced" ? "success" : "warning"}
                  className="uppercase text-xs"
                >
                  {enrollment.erpSyncStatus}
                </Badge>
              </div>
              {enrollment.erpStudentRef && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ERP Reference</span>
                  <span className="text-sm font-mono">{enrollment.erpStudentRef}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-orange-500/10 grid place-items-center text-orange-600">
              <CalendarClock className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[15px]">Orientation & Onboarding</h3>
              <p className="text-sm text-muted-foreground">Scheduled orientation details</p>
            </div>
          </div>
          <div className="mt-2 bg-muted/50 rounded-md p-4">
            {enrollment.orientationAt ? (
              <div className="flex items-center gap-3">
                <CalendarClock className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  Scheduled for: <strong>{getReadableDate(enrollment.orientationAt)}</strong>
                </span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                Orientation has not been scheduled yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
