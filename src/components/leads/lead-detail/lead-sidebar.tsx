import { Badge } from "@/components/ui-kit";
import {
  Phone,
  Mail,
  MapPin,
  Info,
  Calendar,
  User,
  Globe,
  BookOpen,
  Building,
  Activity,
  Link2,
  Clock,
  Megaphone,
  FileText,
  Edit2,
} from "lucide-react";
import { getReadableDate } from "@/lib/utils";
import { useGetLeadAssignment } from "../hook/query/use-get-lead";
import { LeadDetail } from "@/types/lead";
import { getLeadStatusTone } from "@/lib/constant";
import { IApplicationDetails } from "@/components/application/hook/query/use-get-application";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { LeadEditSheet } from "./lead-edit-sheet";

interface LeadSidebarProps {
  lead: LeadDetail;
  applicationData?: IApplicationDetails;
  isApplicationDataLoading: boolean;
}

export function LeadSidebar({ lead, applicationData, isApplicationDataLoading }: LeadSidebarProps) {
  const [openEditSheet, setOpenEditSheet] = useState(false);
  const formattedDob = lead.dob ? getReadableDate(lead.dob) : "N/A";
  const formattedCreatedAt = lead.createdAt ? getReadableDate(lead.createdAt) : "N/A";

  const { data: assignmentData } = useGetLeadAssignment(lead?.id);
  const locationString = [lead.city, lead.state, lead.country].filter(Boolean).join(", ");

  return (
    <div className="w-[300px] shrink-0 border-r border-border bg-background overflow-y-auto h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between h-12 shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Info className="size-3.5" />
          Details
        </div>
      </div>
      <div className="flex-1">
        <Accordion
          type="multiple"
          defaultValue={["contact", "personal", "info", "counsellor"]}
          className="w-full"
        >
          {/* Section 1: Contact Details */}
          <AccordionItem value="contact" className="border-b border-border">
            <AccordionTrigger className="py-2.5 px-3 hover:no-underline [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <Phone className="size-3.5 text-muted-foreground" />
                <span>Contact Details</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3.5 pt-1.5 space-y-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-primary hover:underline transition-colors font-medium truncate"
                  >
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Add email</span>
                )}
              </div>
              <div className="flex items-center gap-2.5 min-w-0">
                <Phone className="size-4 text-muted-foreground shrink-0" />
                {lead.mobile ? (
                  <a
                    href={`tel:${lead.mobile}`}
                    className="text-primary hover:underline transition-colors font-medium"
                  >
                    {lead.mobile}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Add phone</span>
                )}
              </div>
              <div className="flex items-center gap-2.5 min-w-0">
                <MapPin className="size-4 text-muted-foreground shrink-0" />
                {locationString ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationString)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline transition-colors font-medium break-all"
                  >
                    {locationString}
                  </a>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 2: Personal Details */}
          <AccordionItem value="personal" className="border-b border-border">
            <AccordionTrigger className="py-2.5 px-3 hover:no-underline [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <User className="size-3.5 text-muted-foreground" />
                <span>Personal Details</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3.5 pt-1.5 space-y-4">
              <DetailRow
                icon={<Calendar className="size-3.5 text-muted-foreground" />}
                label="DOB"
                value={formattedDob}
              />
              <DetailRow
                icon={<User className="size-3.5 text-muted-foreground" />}
                label="Gender"
                value={
                  lead.gender ? lead.gender.charAt(0).toUpperCase() + lead.gender.slice(1) : "N/A"
                }
              />
              <DetailRow
                icon={<Globe className="size-3.5 text-muted-foreground" />}
                label="Language"
                value={lead.languagePreference || "N/A"}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Section 3: Lead Info */}
          <AccordionItem value="info" className="border-b border-border">
            <AccordionTrigger className="py-2.5 px-3 hover:no-underline [&[data-state=open]]:bg-muted/30 w-full flex-1">
              <div className="flex items-center justify-between flex-1 mr-2">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                  <Activity className="size-3.5 text-muted-foreground" />
                  <span>Lead Info</span>
                  <LeadEditSheet lead={lead} open={openEditSheet} onOpenChange={setOpenEditSheet}>
                    <span
                      role="button"
                      tabIndex={0}
                      className="size-6 rounded hover:bg-muted grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenEditSheet(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenEditSheet(true);
                        }
                      }}
                    >
                      <Edit2 className="size-3.5" />
                    </span>
                  </LeadEditSheet>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3.5 pt-1.5 space-y-4">
              <DetailRow
                icon={<Info className="size-3.5 text-muted-foreground" />}
                label="Status"
                value={
                  <Badge
                    tone={getLeadStatusTone(lead.status)}
                    className="h-5 px-2 rounded-full text-[11px] font-medium"
                  >
                    <div className="size-1.5 rounded-full bg-current mr-1" />{" "}
                    {lead.status?.charAt(0).toUpperCase() + lead.status.slice(1) || "N/A"}
                  </Badge>
                }
              />
              <DetailRow
                icon={<Activity className="size-3.5 text-muted-foreground" />}
                label="Lead Score"
                value={lead.leadScore || "0"}
              />
              <DetailRow
                icon={<Clock className="size-3.5 text-muted-foreground" />}
                label="Created At"
                value={formattedCreatedAt}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Section 4: Assigned Counsellor */}
          <AccordionItem value="counsellor" className="border-b border-border">
            <AccordionTrigger className="py-2.5 px-3 hover:no-underline [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <User className="size-3.5 text-muted-foreground" />
                <span>Assigned Counsellor</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3.5 pt-1.5 space-y-4">
              <DetailRow
                icon={<User className="size-3.5 text-muted-foreground" />}
                label="Name"
                value={assignmentData?.active?.counsellor?.name || "Unassigned"}
                valueClass={
                  !assignmentData?.active?.counsellor?.name ? "text-muted-foreground" : ""
                }
              />
              {assignmentData?.active?.counsellor && (
                <DetailRow
                  icon={<Mail className="size-3.5 text-muted-foreground" />}
                  label="Email"
                  value={assignmentData.active.counsellor.email || "N/A"}
                />
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Section 5: Academic Interest */}
          <AccordionItem value="academic" className="border-b border-border">
            <AccordionTrigger className="py-2.5 px-3 hover:no-underline [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <BookOpen className="size-3.5 text-muted-foreground" />
                <span>Academic Interest</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3.5 pt-1.5 space-y-4">
              <DetailRow
                icon={<Info className="size-3.5 text-muted-foreground" />}
                label="Course"
                value={lead.courseInterest || "N/A"}
              />
              <DetailRow
                icon={<Building className="size-3.5 text-muted-foreground" />}
                label="Campus"
                value={lead.campusInterest || "N/A"}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Section 6: Notes */}
          <AccordionItem value="notes" className="border-b border-border">
            <AccordionTrigger className="py-2.5 px-3 hover:no-underline [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <FileText className="size-3.5 text-muted-foreground" />
                <span>Notes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3.5 pt-1.5">
              <div className="text-[13px] text-muted-foreground break-words leading-relaxed">
                {lead.notes || "No notes available."}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 7: Marketing Attribution (Collapsed by default) */}
          <AccordionItem value="marketing" className="border-b border-border">
            <AccordionTrigger className="py-2.5 px-3 hover:no-underline [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <Megaphone className="size-3.5 text-muted-foreground" />
                <span>Marketing Attribution</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3.5 pt-1.5 space-y-4">
              <DetailRow
                icon={<Link2 className="size-3.5 text-muted-foreground" />}
                label="Source"
                value={lead.sourceChannel || "N/A"}
              />
              <DetailRow
                icon={<Info className="size-3.5 text-muted-foreground" />}
                label="UTM Source"
                value={lead.utmSource || "N/A"}
              />
              <DetailRow
                icon={<Info className="size-3.5 text-muted-foreground" />}
                label="UTM Medium"
                value={lead.utmMedium || "N/A"}
              />
              <DetailRow
                icon={<Info className="size-3.5 text-muted-foreground" />}
                label="UTM Campaign"
                value={lead.utmCampaign || "N/A"}
              />
              <DetailRow
                icon={<Info className="size-3.5 text-muted-foreground" />}
                label="UTM Content"
                value={lead.utmContent || "N/A"}
              />
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
