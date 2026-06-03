import { Enrollment } from "../hook/query/use-get-enrollment";
import { Mail, Phone, Calendar, Hash, BookOpen, Building2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { getReadableDate } from "@/lib/utils";
import { useGetPrograms } from "@/components/global/hooks/use-get-programs";
import { useGetCampuses } from "@/components/global/hooks/use-get-campuses";
import { Link } from "@tanstack/react-router";

export function EnrollmentSidebar({ enrollment }: { enrollment: Enrollment }) {
  const { student } = enrollment;
  const { data: programs } = useGetPrograms();
  const { data: campuses } = useGetCampuses();

  const programName =
    programs?.find((p) => p.id === enrollment.programId)?.name || enrollment.programId;
  const campusName =
    campuses?.find((c) => c.id === enrollment.campusId)?.name || enrollment.campusId;

  return (
    <div className="w-80 border-r border-border bg-card overflow-y-auto shrink-0 custom-scrollbar">
      <div className="p-5 flex flex-col gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
            Student Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="size-7 rounded bg-muted grid place-items-center shrink-0">
                <Mail className="size-3.5 text-muted-foreground" />
              </div>
              <span className="truncate">{student.email}</span>
            </div>
            {student.mobile && (
              <div className="flex items-center gap-3 text-sm">
                <div className="size-7 rounded bg-muted grid place-items-center shrink-0">
                  <Phone className="size-3.5 text-muted-foreground" />
                </div>
                <span>{student.mobile}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <div className="size-7 rounded bg-muted grid place-items-center shrink-0">
                <Hash className="size-3.5 text-muted-foreground" />
              </div>
              <span className="truncate text-xs" title={student.id}>
                Student Ref: {student.id.split("-")[0]}
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border w-full" />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
            Enrollment Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <div className="size-7 rounded bg-muted grid place-items-center shrink-0 mt-0.5">
                <BookOpen className="size-3.5 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Program</span>
                <span className="font-medium text-xs break-all">{programName}</span>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="size-7 rounded bg-muted grid place-items-center shrink-0 mt-0.5">
                <Building2 className="size-3.5 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Campus</span>
                <span className="font-medium text-xs break-all">{campusName}</span>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="size-7 rounded bg-muted grid place-items-center shrink-0 mt-0.5">
                <Hash className="size-3.5 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Application</span>
                <Link
                  to="/application/$applicationId"
                  params={{ applicationId: enrollment.applicationId }}
                  className="font-medium text-xs text-primary hover:underline mt-0.5"
                >
                  View Application
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-border w-full" />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
            Timeline
          </h3>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />

            <div className="space-y-5">
              <div className="relative flex items-start gap-4">
                <div className="size-6 rounded-full bg-muted border-2 border-background grid place-items-center shrink-0 z-10 mt-0.5">
                  <div className="size-2 rounded-full bg-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-xs text-muted-foreground">
                    {getReadableDate(enrollment.createdAt)}
                  </span>
                </div>
              </div>

              {enrollment.confirmedAt && (
                <div className="relative flex items-start gap-4">
                  <div className="size-6 rounded-full bg-success/20 border-2 border-background grid place-items-center shrink-0 z-10 mt-0.5">
                    <div className="size-2 rounded-full bg-success" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Confirmed</span>
                    <span className="text-xs text-muted-foreground">
                      {getReadableDate(enrollment.confirmedAt)}
                    </span>
                  </div>
                </div>
              )}

              {enrollment.erpSyncAt && (
                <div className="relative flex items-start gap-4">
                  <div className="size-6 rounded-full bg-blue-500/20 border-2 border-background grid place-items-center shrink-0 z-10 mt-0.5">
                    <div className="size-2 rounded-full bg-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">ERP Synced</span>
                    <span className="text-xs text-muted-foreground">
                      {getReadableDate(enrollment.erpSyncAt)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
