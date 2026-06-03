import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useGetEnrollment } from "@/components/enrollment/hook/query/use-get-enrollment";
import { EnrollmentHeader } from "@/components/enrollment/enrollment-detail/enrollment-header";
import { EnrollmentSidebar } from "@/components/enrollment/enrollment-detail/enrollment-sidebar";
import { EnrollmentMainContent } from "@/components/enrollment/enrollment-detail/enrollment-main-content";

export const Route = createFileRoute("/enrollment/$enrollmentId")({
  component: EnrollmentDetail,
});

function EnrollmentDetail() {
  const { enrollmentId } = Route.useParams();
  const { data: enrollmentData, isLoading } = useGetEnrollment(enrollmentId);

  if (isLoading || !enrollmentData) {
    return (
      <AppShell>
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell noPadding>
      <div className="flex flex-col h-full bg-background overflow-hidden w-full">
        <EnrollmentHeader enrollment={enrollmentData} />
        <div className="flex flex-1 overflow-hidden min-h-0">
          <EnrollmentSidebar enrollment={enrollmentData} />
          <EnrollmentMainContent enrollment={enrollmentData} />
        </div>
      </div>
    </AppShell>
  );
}
