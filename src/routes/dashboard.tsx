import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import { useGetMyDetail } from "@/components/user/hook/query/use-get-my-detail";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { SuperAdminDashboard } from "@/components/dashboard/super-admin";
import { CounsellorDashboard } from "@/components/dashboard/counsellor";
import { PendingRoleDashboard } from "@/components/dashboard/pending-role-dashboard";

export const Route = createFileRoute("/dashboard")({
  component: DashboardRoute,
  head: () => ({ meta: [{ title: "Executive Dashboard — Acharya One" }] }),
});

function DashboardRoute() {
  const { user, setCounsellor, setStudentId } = useUserStore();

  const { data: myDetail, isLoading: isDetailLoading } = useGetMyDetail();

  useEffect(() => {
    if (myDetail?.counsellorId) setCounsellor(myDetail.counsellorId);
    if (myDetail?.studentId) setStudentId(myDetail.studentId);
  }, [myDetail, setCounsellor, setStudentId]);

  if (!user || isDetailLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user.role === "student") return <StudentDashboard />;
  if (user.role === "counsellor") return <CounsellorDashboard />;
  if (user.role === "super_admin") return <SuperAdminDashboard />;

  return <PendingRoleDashboard />;
}
