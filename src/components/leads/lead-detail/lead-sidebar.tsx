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
  Tag,
  Compass,
  Share2,
  Type,
  ListOrdered,
  Plus,
  Loader2,
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
import { useGetLeadLists } from "@/components/lists/hook/query/use-get-lead-lists";
import { AddToListDialog } from "@/components/lists/add-to-list-dialog";
import { ListIconBadge } from "@/components/lists/list-icon";
import { Link } from "@tanstack/react-router";

interface LeadSidebarProps {
  lead: LeadDetail;
  applicationData?: IApplicationDetails;
  isApplicationDataLoading: boolean;
}

export function LeadSidebar({ lead, applicationData, isApplicationDataLoading }: LeadSidebarProps) {
  const [openEditSheet, setOpenEditSheet] = useState(false);
  const [addToListOpen, setAddToListOpen] = useState(false);
  const { data: leadLists, isLoading: isLoadingLists } = useGetLeadLists(lead?.id);
  const formattedDob = lead.dob ? getReadableDate(lead.dob) : "N/A";
  const formattedCreatedAt = lead.createdAt ? getReadableDate(lead.createdAt) : "N/A";

  const { data: assignmentData } = useGetLeadAssignment(lead?.id);
  const locationString = [lead.city, lead.state, lead.country].filter(Boolean).join(", ");

  const isValueEmpty = (val: string | null | undefined) => {
    if (!val) return true;
    const lower = val.trim().toLowerCase();
    return lower === "" || lower === "n/a" || lower === "na";
  };

  const utmSource = isValueEmpty(lead.utmSource) ? null : lead.utmSource;
  const utmMedium = isValueEmpty(lead.utmMedium) ? null : lead.utmMedium;
  const utmCampaign = isValueEmpty(lead.utmCampaign) ? null : lead.utmCampaign;
  const utmContent = isValueEmpty(lead.utmContent) ? null : lead.utmContent;
  const hasAnyUtm = !!(utmSource || utmMedium || utmCampaign || utmContent);

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

          {/* Section 7: In Lists */}
          <AccordionItem value="lists" className="border-b border-border">
            <AccordionTrigger className="py-2.5 px-3 hover:no-underline [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center justify-between flex-1 mr-2">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                  <ListOrdered className="size-3.5 text-muted-foreground" />
                  <span>In Lists</span>
                  {leadLists && leadLists.length > 0 && (
                    <span className="text-[11px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                      {leadLists.length}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="size-6 rounded hover:bg-muted grid place-items-center text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAddToListOpen(true);
                  }}
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3.5 pt-1.5">
              {isLoadingLists ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : leadLists && leadLists.length > 0 ? (
                <div className="space-y-1.5">
                  {leadLists.map((membership) => (
                    <Link
                      key={membership.id}
                      to="/lists/$listId"
                      params={{ listId: membership.listId }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors group"
                    >
                      <ListIconBadge name={membership.list.icon} color={membership.list.color} size="xs" />
                      <span className="text-[13px] font-medium truncate flex-1">
                        {membership.list.name}
                      </span>
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAddToListOpen(true)}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors text-[12px] text-muted-foreground"
                  >
                    <Plus className="size-3.5" />
                    Add to another list
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-[12px] text-muted-foreground mb-2">Not in any list</p>
                  <button
                    type="button"
                    onClick={() => setAddToListOpen(true)}
                    className="text-[12px] text-primary hover:underline flex items-center gap-1 mx-auto"
                  >
                    <Plus className="size-3" />
                    Add to a list
                  </button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Section 8: Marketing Attribution (Collapsed by default) */}
          <AccordionItem value="marketing" className="border-b border-border">
            <AccordionTrigger className="py-2.5 px-3 hover:no-underline [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <Megaphone className="size-3.5 text-muted-foreground" />
                <span>Marketing Attribution</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3.5 pt-1.5 space-y-3">
              <DetailRow
                icon={<Link2 className="size-3.5 text-muted-foreground" />}
                label="Source"
                value={
                  !isValueEmpty(lead.sourceChannel) ? (
                    <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded text-[11px] border border-border/40">
                      {lead.sourceChannel}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic text-[12px]">Not specified</span>
                  )
                }
              />

              <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-0.5">
                  UTM Parameters
                </div>
                {hasAnyUtm ? (
                  <div className="space-y-2.5 pt-1">
                    {utmSource && (
                      <DetailRow
                        icon={<Compass className="size-3.5 text-blue-500 shrink-0" />}
                        label="Source"
                        value={
                          <span className="font-medium text-blue-700 dark:text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded text-[11px] border border-blue-500/20 truncate max-w-[150px]" title={utmSource}>
                            {utmSource}
                          </span>
                        }
                      />
                    )}
                    {utmMedium && (
                      <DetailRow
                        icon={<Share2 className="size-3.5 text-purple-500 shrink-0" />}
                        label="Medium"
                        value={
                          <span className="font-medium text-purple-700 dark:text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded text-[11px] border border-purple-500/20 truncate max-w-[150px]" title={utmMedium}>
                            {utmMedium}
                          </span>
                        }
                      />
                    )}
                    {utmCampaign && (
                      <DetailRow
                        icon={<Tag className="size-3.5 text-emerald-500 shrink-0" />}
                        label="Campaign"
                        value={
                          <span className="font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px] border border-emerald-500/20 truncate max-w-[150px]" title={utmCampaign}>
                            {utmCampaign}
                          </span>
                        }
                      />
                    )}
                    {utmContent && (
                      <DetailRow
                        icon={<Type className="size-3.5 text-amber-500 shrink-0" />}
                        label="Content"
                        value={
                          <span className="font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px] border border-amber-500/20 truncate max-w-[150px]" title={utmContent}>
                            {utmContent}
                          </span>
                        }
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 italic py-1 px-0.5">
                    <Info className="size-3 text-muted-foreground/50" />
                    <span>No UTM parameters captured</span>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <AddToListDialog
        open={addToListOpen}
        onOpenChange={setAddToListOpen}
        leadId={lead.id}
        leadName={lead.name}
        listItems={lead.listItems}
      />
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
