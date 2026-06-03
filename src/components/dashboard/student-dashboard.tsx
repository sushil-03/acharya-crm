import React from "react";
import { AppShell } from "@/components/app-shell";
import { useUserStore } from "@/store/use-user-store";
import { useQueryClient } from "@tanstack/react-query";
import { useGetStudentDetail } from "@/components/user/hook/query/use-get-student-detail";
import { useGetMyDetail } from "@/components/user/hook/query/use-get-my-detail";
import { Badge } from "@/components/ui-kit";
import {
  Loader2,
  Mail,
  Phone,
  Calendar,
  User,
  MapPin,
  Activity,
  LayoutDashboard,
  Clock,
  LogOut,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getReadableDate } from "@/lib/utils";
import { LeadStudentTimeline } from "@/components/leads/lead-detail/lead-student-timeline";
import { StudentActionCenter } from "./student-action-center";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/components/auth/hook/query/use-logout";

export function StudentDashboard() {
  const { user } = useUserStore();
  const { logout, isPending: isLogoutPending } = useLogout();
  const queryClient = useQueryClient();
  const { data: myDetail, isLoading: isMyDetailLoading } = useGetMyDetail();
  const { data: student, isLoading: isStudentLoading } = useGetStudentDetail(
    myDetail?.studentId || "",
  );

  const isLoading = isMyDetailLoading || isStudentLoading;

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-2">
        <h2 className="text-xl font-semibold">Student Not Found</h2>
        <p className="text-muted-foreground">We couldn't find your record.</p>
      </div>
    );
  }

  const offer = student.offers?.[0];
  const application = student.applications?.[0];
  const counsellor = student.lead?.assignments?.[0]?.counsellor;

  const formattedDob = student.dob ? getReadableDate(student.dob) : "N/A";

  return (
    <div className="flex flex-col bg-background w-full h-screen overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0 h-16">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-gradient-brand grid place-items-center text-white font-bold text-sm shadow-sm">
            {student.firstName[0]}
            {student.lastName && student.lastName !== "-" ? student.lastName[0] : ""}
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-semibold text-[16px] leading-tight text-foreground">
              {student.firstName} {student.lastName !== "-" ? student.lastName : ""}
            </h1>
            <span className="text-xs text-muted-foreground font-medium leading-tight mt-0.5">
              Student Dashboard
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {student.enrollmentStatus && (
            <Badge
              tone={student.enrollmentStatus === "confirmed" ? "success" : "warning"}
              className="uppercase tracking-wider font-bold text-[10px] px-2 h-6"
            >
              {student.enrollmentStatus || "Pending"}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            disabled={isLogoutPending}
            className="text-muted-foreground hover:text-foreground"
          >
            {isLogoutPending ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="size-4 mr-2" />
            )}
            {isLogoutPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar */}
        <div className="w-[300px] shrink-0 border-r border-border bg-background overflow-y-auto h-full flex flex-col">
          <div className=" space-y-2 text-sm">
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-2 text-sm font-bold mb-3 text-slate-800">
                <User className="size-4 text-primary" />
                Personal Information
              </div>
              <DetailRow icon={<Mail />} label="Email" value={student.email} />
              <DetailRow icon={<Phone />} label="Phone" value={student.mobile} />
              <DetailRow icon={<Calendar />} label="DOB" value={formattedDob} />
              <DetailRow icon={<User />} label="Gender" value={student.gender} />
              <DetailRow
                icon={<MapPin />}
                label="Location"
                value={[student.city, student.state, student.country].filter(Boolean).join(", ")}
              />
            </div>

            <div className="border-t border-border p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold mb-3 text-slate-800">
                <Activity className="size-4 text-primary" />
                Academic Status
              </div>
              <DetailRow
                icon={<Activity />}
                label="Application"
                value={
                  <Badge
                    tone="primary"
                    className="h-5 px-2 rounded text-[10px] font-bold uppercase tracking-wider"
                  >
                    {application?.status || "N/A"}
                  </Badge>
                }
              />
              <DetailRow
                icon={<Activity />}
                label="Offer"
                value={
                  <Badge
                    tone={offer?.status === "accepted" ? "success" : "info"}
                    className="h-5 px-2 rounded text-[10px] font-bold uppercase tracking-wider"
                  >
                    {offer?.status || "N/A"}
                  </Badge>
                }
              />
              <DetailRow
                icon={<Activity />}
                label="Enrolled On"
                value={
                  student.enrollments?.[0]?.confirmedAt
                    ? getReadableDate(student.enrollments[0].confirmedAt)
                    : "Not Enrolled"
                }
              />
            </div>

            <div className="border-t border-border p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold mb-3 text-slate-800">
                <User className="size-4 text-primary" />
                Assigned Counsellor
              </div>
              <DetailRow icon={<User />} label="Name" value={counsellor?.name || "Unassigned"} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-slate-50/50 h-full overflow-y-auto">
          <Tabs defaultValue="action" className="w-full flex flex-col h-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none h-14 bg-background p-0 px-6 shrink-0 shadow-sm z-10">
              <TabsTrigger
                value="action"
                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 data-[state=active]:font-semibold"
              >
                <LayoutDashboard className="size-4 mr-2" /> Action Center
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 data-[state=active]:font-semibold"
              >
                <Clock className="size-4 mr-2" /> Timeline
              </TabsTrigger>
            </TabsList>

            <div className="p-8 max-w-5xl mx-auto w-full flex-1 min-h-0">
              <TabsContent value="action" className="mt-0 outline-none">
                <StudentActionCenter student={student} />
              </TabsContent>

              <TabsContent
                value="timeline"
                className="mt-0 outline-none bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <LeadStudentTimeline leadId={student.leadId} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[90px_1fr] items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground text-[13px] font-medium">
        <div className="[&>svg]:size-3.5 [&>svg]:text-muted-foreground">{icon}</div>
        <span>{label}</span>
      </div>
      <div className="text-[13px] text-foreground flex items-center min-w-0 break-words font-medium">
        {value || "N/A"}
      </div>
    </div>
  );
}
