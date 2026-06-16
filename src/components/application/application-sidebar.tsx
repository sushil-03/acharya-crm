import { Badge } from "@/components/ui-kit";
import {
  Phone,
  Mail,
  Info,
  Calendar,
  User,
  BookOpen,
  Building,
  GraduationCap,
  Clock,
  Activity,
  CheckSquare,
  ShieldCheck,
  CreditCard,
  XCircle,
  FileCheck,
  MapPin,
} from "lucide-react";
import { getReadableDate } from "@/lib/utils";
import { IApplicationDetails } from "./hook/query/use-get-application";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getApplicationStatusTone, getApplicationStatusLabel } from "@/lib/constant";

interface ApplicationSidebarProps {
  applicationData?: IApplicationDetails;
  isLoading: boolean;
}

export function ApplicationSidebar({ applicationData, isLoading }: ApplicationSidebarProps) {
  if (isLoading || !applicationData) {
    return (
      <div className="w-[300px] shrink-0 border-r border-border bg-background flex flex-col items-center justify-center p-6 text-muted-foreground text-sm gap-2">
        <Clock className="size-5 animate-spin text-primary" />
        <span>Loading application...</span>
      </div>
    );
  }

  const formattedCreatedAt = applicationData.createdAt
    ? getReadableDate(applicationData.createdAt)
    : "N/A";
  const formattedUpdatedAt = applicationData.updatedAt
    ? getReadableDate(applicationData.updatedAt)
    : "N/A";

  const student = applicationData.student;

  return (
    <div className="w-[300px] shrink-0 border-r border-border bg-background overflow-y-auto h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between h-12 shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Info className="size-3.5" />
          Application Details
        </div>
      </div>
      <div className="flex-1">
        <Accordion
          type="multiple"
          defaultValue={["student", "academic", "status", "payments", "declaration"]}
          className="w-full"
        >
          {/* Section 1: Student Details */}
          <AccordionItem value="student" className="border-b border-border">
            <AccordionTrigger className="py-2.5 px-3 hover:no-underline [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <User className="size-3.5 text-muted-foreground" />
                <span>Student Info</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3.5 pt-1.5 space-y-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <User className="size-4 text-muted-foreground shrink-0" />
                <span className="text-[13px] font-medium text-foreground truncate">
                  {student?.firstName} {student?.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2.5 min-w-0">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                {student?.email ? (
                  <a
                    href={`mailto:${student.email}`}
                    className="text-primary hover:underline transition-colors text-[13px] font-medium truncate"
                  >
                    {student.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground text-[13px]">N/A</span>
                )}
              </div>
              <div className="flex items-center gap-2.5 min-w-0">
                <Phone className="size-4 text-muted-foreground shrink-0" />
                {student?.mobile ? (
                  <a
                    href={`tel:${student.mobile}`}
                    className="text-primary hover:underline transition-colors text-[13px] font-medium"
                  >
                    {student.mobile}
                  </a>
                ) : (
                  <span className="text-muted-foreground text-[13px]">N/A</span>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 2: Academic Program */}
          <AccordionItem value="academic" className="border-b border-border">
            <AccordionTrigger className="py-2.5 px-3 hover:no-underline [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <GraduationCap className="size-3.5 text-muted-foreground" />
                <span>Program Details</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3.5 pt-1.5 space-y-4">
              <DetailRow
                icon={<BookOpen className="size-3.5 text-muted-foreground" />}
                label="Program"
                value={applicationData.programName || "N/A"}
              />
              <DetailRow
                icon={<Building className="size-3.5 text-muted-foreground" />}
                label="Specialization"
                value={applicationData.specializationName || "N/A"}
              />
              <DetailRow
                icon={<Building className="size-3.5 text-muted-foreground" />}
                label="School"
                value={applicationData.schoolName || "N/A"}
              />
              <DetailRow
                icon={<GraduationCap className="size-3.5 text-muted-foreground" />}
                label="Level"
                value={applicationData.graduationName || "N/A"}
              />
              <DetailRow
                icon={<Activity className="size-3.5 text-muted-foreground" />}
                label="Core"
                value={applicationData.coreName || "N/A"}
              />
              <DetailRow
                icon={<Calendar className="size-3.5 text-muted-foreground" />}
                label="Acad Year"
                value={applicationData.academicYearName || "N/A"}
              />
              <DetailRow
                icon={<Building className="size-3.5 text-muted-foreground" />}
                label="Campus"
                value={applicationData.campusId || "Bengaluru Main"}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Section 3: Application Status */}
          <AccordionItem value="status" className="border-b border-border">
            <AccordionTrigger className="py-2.5 px-3 hover:no-underline [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <Activity className="size-3.5 text-muted-foreground" />
                <span>Status & Timeline</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3.5 pt-1.5 space-y-4">
              <DetailRow
                icon={<Info className="size-3.5 text-muted-foreground" />}
                label="Status"
                value={
                  <Badge
                    tone={getApplicationStatusTone(applicationData.status) as any}
                    className="h-5 px-2 rounded-full text-[11px] font-semibold"
                  >
                    {getApplicationStatusLabel(applicationData.status)}
                  </Badge>
                }
              />
              <DetailRow
                icon={<CheckSquare className="size-3.5 text-muted-foreground" />}
                label="Progress"
                value={
                  <span className="font-semibold text-foreground">
                    {applicationData.completionPercent || 0}%
                  </span>
                }
              />
              {applicationData.eligibilityStatus && (
                <DetailRow
                  icon={<ShieldCheck className="size-3.5 text-muted-foreground" />}
                  label="Eligibility"
                  value={applicationData.eligibilityStatus}
                />
              )}
              {applicationData.rejectionReason && (
                <DetailRow
                  icon={<XCircle className="size-3.5 text-destructive shrink-0" />}
                  label="Rejection"
                  value={
                    <span className="text-destructive font-medium text-xs leading-normal">
                      {applicationData.rejectionReason}
                    </span>
                  }
                />
              )}
              <DetailRow
                icon={<Clock className="size-3.5 text-muted-foreground" />}
                label="Created At"
                value={formattedCreatedAt}
              />
              <DetailRow
                icon={<Clock className="size-3.5 text-muted-foreground" />}
                label="Updated At"
                value={formattedUpdatedAt}
              />
              {applicationData.assignedReviewerId && (
                <DetailRow
                  icon={<User className="size-3.5 text-muted-foreground" />}
                  label="Reviewer ID"
                  value={
                    <span className="font-mono text-[10px] break-all">
                      {applicationData.assignedReviewerId}
                    </span>
                  }
                />
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Section 5: Payments */}
          <AccordionItem value="payments" className="border-b border-border">
            <AccordionTrigger className="py-2.5 px-3 hover:no-underline [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <CreditCard className="size-3.5 text-muted-foreground" />
                <span>Payments</span>
                {applicationData.payments && applicationData.payments.length > 0 && (
                  <span className="text-[11px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                    {applicationData.payments.length}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3.5 pt-1.5">
              {!applicationData.payments || applicationData.payments.length === 0 ? (
                <div className="text-center py-2">
                  <p className="text-[12px] text-muted-foreground">No payments found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applicationData.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-2 border border-border rounded-lg bg-card flex flex-col gap-1.5 shadow-sm"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground uppercase tracking-wide">
                          {payment.paymentType?.replace(/_/g, " ")}
                        </span>
                        <span className="font-bold text-foreground">₹{payment.amount}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span
                          className="text-muted-foreground font-mono truncate max-w-[120px]"
                          title={payment.id}
                        >
                          {payment.id}
                        </span>
                        <Badge
                          tone={
                            payment.paymentStatus === "completed"
                              ? "success"
                              : payment.paymentStatus === "failed"
                                ? "danger"
                                : "warning"
                          }
                          className="px-1.5 py-0 capitalize text-[9px] font-bold"
                        >
                          {payment.paymentStatus}
                        </Badge>
                      </div>
                      {payment.gatewayOrderId && (
                        <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/50 truncate">
                          Order ID:{" "}
                          <span className="font-mono text-foreground">
                            {payment.gatewayOrderId}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, valueClass }: any) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground text-[13px]">
        {icon}
        <span>{label}</span>
      </div>
      <div
        className={`text-[13px] text-foreground flex items-center min-w-0 break-words ${valueClass || ""}`}
      >
        {value}
      </div>
    </div>
  );
}
