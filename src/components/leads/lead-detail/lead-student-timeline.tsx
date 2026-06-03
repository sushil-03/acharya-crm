import { useState, useMemo } from "react";
import { useGetLeadTimeline } from "@/components/leads/hook/query/use-get-lead-timeline";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  UserCheck,
  MessageSquare,
  Phone,
  Mail,
  CheckSquare,
  BadgeCheck,
  GraduationCap,
  CreditCard,
  Eye,
  FileUp,
  FileCheck,
  Award,
  Clock,
  Activity,
  User,
  Globe,
  Calendar,
  Search,
  SlidersHorizontal,
  TrendingUp,
  FileText,
  RefreshCw,
  Tag,
  CheckCircle,
} from "lucide-react";
import { capitalizeWords } from "@/lib/utils";

interface LeadStudentTimelineProps {
  leadId: string;
}

type FilterType = "all" | "communications" | "tasks" | "admissions" | "lifecycle";

export function LeadStudentTimeline({ leadId }: LeadStudentTimelineProps) {
  const { data, isLoading, error } = useGetLeadTimeline(leadId);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredTimeline = useMemo(() => {
    if (!data?.timeline) return [];

    const sortedTimeline = [...data.timeline].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return sortedTimeline.filter((item) => {
      // 1. Filter by category
      if (activeFilter === "communications" && item.type !== "interaction") return false;
      if (activeFilter === "tasks" && item.type !== "task_created") return false;
      if (
        activeFilter === "admissions" &&
        !item.type.startsWith("application") &&
        !item.type.startsWith("document") &&
        !item.type.startsWith("offer") &&
        !item.type.startsWith("payment") &&
        !item.type.startsWith("enrollment") &&
        !item.type.startsWith("scholarship") &&
        item.type !== "lead_converted"
      ) {
        return false;
      }
      if (
        activeFilter === "lifecycle" &&
        item.type !== "lead_created" &&
        item.type !== "lead_assigned" &&
        item.type !== "lead_converted"
      ) {
        return false;
      }

      // 2. Filter by search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesType = item.type?.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesType;
      }

      return true;
    });
  }, [data, activeFilter, searchQuery]);

  // Group events by day
  const groupedTimeline = useMemo(() => {
    const groups: { [dateStr: string]: typeof filteredTimeline } = {};
    filteredTimeline.forEach((item) => {
      const dateStr = format(new Date(item.timestamp), "yyyy-MM-dd");
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(item);
    });
    return groups;
  }, [filteredTimeline]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        {/* Search/Filter skeleton */}
        <Skeleton className="h-10 w-full rounded-xl" />

        {/* List skeleton */}
        <div className="space-y-6 mt-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-start gap-4">
              <Skeleton className="size-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-sm text-destructive p-6 border border-destructive/20 bg-destructive/5 rounded-lg">
        Failed to load lead timeline data. Please try again.
      </div>
    );
  }

  const getEventConfig = (type: string, eventData: any, actorName: string | null | undefined) => {
    const rawData = eventData || {};

    // Performer/Actor pill chip layout helper (Strictly neutral slate)
    const renderActorPill = () => {
      if (!actorName) return null;
      return (
        <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-650 px-3 py-1 rounded-full">
          <User className="size-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">By:</span>
          <span className="font-semibold text-slate-700 capitalize">{actorName}</span>
        </span>
      );
    };

    // Left Node Badge: all use clean neutral slate overlays and slate grey icons
    const commonConfig = {
      overlayColor: "bg-slate-400",
      iconTextColor: "text-slate-500",
    };

    switch (type) {
      case "lead_created":
        return {
          icon: Sparkles,
          ...commonConfig,
          badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-100/40",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                <Globe className="size-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Source:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {rawData.source || "N/A"}
                </span>
              </span>
              {rawData.leadScore !== undefined && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                  <TrendingUp className="size-3.5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Score:</span>
                  <span className="font-semibold text-slate-800">{rawData.leadScore}</span>
                </span>
              )}
              {renderActorPill()}
            </div>
          ),
        };
      case "lead_assigned":
        return {
          icon: UserCheck,
          ...commonConfig,
          badgeColor: "bg-blue-50 text-blue-600 border-blue-100/40",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                <User className="size-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Counsellor:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {rawData.counsellorName || "N/A"}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                <CheckCircle className="size-3.5 text-slate-400" />
                <span className="font-semibold text-slate-800">Active Assignment</span>
              </span>
              {renderActorPill()}
            </div>
          ),
        };
      case "interaction":
        const isCall = rawData.interactionType === "call";
        const isEmail = rawData.interactionType === "email";
        const isWhatsapp = rawData.interactionType === "whatsapp";
        const isSms = rawData.interactionType === "sms";
        const icon = isCall
          ? Phone
          : isEmail
            ? Mail
            : isWhatsapp || isSms
              ? MessageSquare
              : Activity;
        return {
          icon,
          ...commonConfig,
          badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100/40",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                <Phone className="size-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Channel:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {rawData.interactionType || "Interaction"}
                </span>
              </span>
              {rawData.outcome && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                  <RefreshCw className="size-3.5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Outcome:</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {rawData.outcome.replace("_", " ")}
                  </span>
                </span>
              )}
              {rawData.durationSeconds !== undefined && rawData.durationSeconds > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                  <Clock className="size-3.5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Duration:</span>
                  <span className="font-semibold text-slate-800">{rawData.durationSeconds}s</span>
                </span>
              )}
              {renderActorPill()}
            </div>
          ),
        };
      case "task_created":
        return {
          icon: CheckSquare,
          ...commonConfig,
          badgeColor: "bg-amber-50 text-amber-600 border-amber-100/40",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                <Tag className="size-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Type:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {rawData.taskType?.replace("_", " ") || "Task"}
                </span>
              </span>
              {rawData.dueDate && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                  <Calendar className="size-3.5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Due:</span>
                  <span className="font-semibold text-slate-800">
                    {format(new Date(rawData.dueDate), "MMM d, yyyy h:mm a")}
                  </span>
                </span>
              )}
              {renderActorPill()}
            </div>
          ),
        };
      case "lead_converted":
        return {
          icon: BadgeCheck,
          ...commonConfig,
          badgeColor: "bg-purple-50 text-purple-600 border-purple-100/40",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                <User className="size-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Student:</span>
                <span className="font-semibold text-slate-800">{data.leadName}</span>
              </span>
              {rawData.studentId && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                  <GraduationCap className="size-3.5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Program:</span>
                  <span className="font-semibold text-slate-800">MBA 2026</span>
                </span>
              )}
              {renderActorPill()}
            </div>
          ),
        };
      case "application_created":
        return {
          icon: GraduationCap,
          ...commonConfig,
          badgeColor: "bg-sky-50 text-sky-600 border-sky-100/40",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                <GraduationCap className="size-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Program:</span>
                <span className="font-semibold text-slate-800">{rawData.programName || "N/A"}</span>
              </span>
              {rawData.applicationId && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full font-mono">
                  <span className="text-slate-500 font-medium">App ID:</span>
                  <span className="text-slate-800">{rawData.applicationId.slice(0, 8)}...</span>
                </span>
              )}
              {renderActorPill()}
            </div>
          ),
        };
      case "application_fee_initiated":
      case "application_fee_paid":
        const isPaid = type === "application_fee_paid";
        return {
          icon: CreditCard,
          ...commonConfig,
          badgeColor: isPaid
            ? "bg-emerald-50 text-emerald-600 border-emerald-100/40"
            : "bg-amber-50 text-amber-600 border-amber-100/40",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              {rawData.amount && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full font-semibold">
                  Amount: <span>₹{rawData.amount}</span>
                </span>
              )}
              {rawData.status && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                  Status:{" "}
                  <span className="font-semibold capitalize text-slate-800">{rawData.status}</span>
                </span>
              )}
              {renderActorPill()}
            </div>
          ),
        };
      case "application_submitted":
      case "application_under_review":
      case "application_approved":
        const isAppApproved = type === "application_approved";
        return {
          icon: isAppApproved ? CheckCircle : Eye,
          ...commonConfig,
          badgeColor: isAppApproved
            ? "bg-emerald-50 text-emerald-600 border-emerald-100/40"
            : "bg-orange-50 text-orange-600 border-orange-100/40",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full font-semibold">
                Status: <span>{isAppApproved ? "Verification Successful" : "In Progress"}</span>
              </span>
              {rawData.applicationId && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full font-mono">
                  App ID: {rawData.applicationId.slice(0, 8)}...
                </span>
              )}
              {renderActorPill()}
            </div>
          ),
        };
      case "document_uploaded":
      case "document_verified":
        const isDocVerified = type === "document_verified";
        return {
          icon: isDocVerified ? FileCheck : FileUp,
          ...commonConfig,
          badgeColor: isDocVerified
            ? "bg-teal-50 text-teal-600 border-teal-100/40"
            : "bg-blue-50 text-blue-600 border-blue-100/40",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                <FileText className="size-3.5 text-slate-400" />
                Type:{" "}
                <span className="font-semibold uppercase">
                  {rawData.documentType?.replace("_", " ")}
                </span>
              </span>
              {rawData.status && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full font-semibold">
                  Status: <span>{rawData.status}</span>
                </span>
              )}
              {renderActorPill()}
            </div>
          ),
        };
      case "offer_created":
      case "offer_released":
        const isOfferReleased = type === "offer_released";
        return {
          icon: Award,
          ...commonConfig,
          badgeColor: isOfferReleased
            ? "bg-pink-50 text-pink-600 border-pink-100/40"
            : "bg-rose-50 text-rose-600 border-rose-100/40",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              {rawData.offerType && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full font-semibold">
                  Offer: {rawData.offerType}
                </span>
              )}
              {rawData.totalFee && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full font-semibold">
                  Total Fee:{" "}
                  <span className="font-semibold text-slate-800">₹{rawData.totalFee}</span>
                </span>
              )}
              {renderActorPill()}
            </div>
          ),
        };
      case "scholarship_approved":
      case "scholarship_added":
        return {
          icon: Award,
          ...commonConfig,
          badgeColor: "bg-purple-50 text-purple-600 border-purple-100/40",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              {rawData.type && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full font-semibold">
                  Type: {capitalizeWords(rawData.type)}
                </span>
              )}
              {rawData.amountValue && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full font-bold">
                  Amount: ₹{rawData.amountValue}
                </span>
              )}
              {renderActorPill()}
            </div>
          ),
        };
      case "offer_accepted":
        return {
          icon: BadgeCheck,
          ...commonConfig,
          badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100/40",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              {rawData.netFeePayable && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full font-bold">
                  Net Payable: ₹{rawData.netFeePayable}
                </span>
              )}
              {renderActorPill()}
            </div>
          ),
        };
      case "payment":
      case "payment_created":
      case "payment_completed":
      case "payment_confirmed":
        const isPaymentCompleted =
          rawData.paymentStatus === "completed" ||
          rawData.status === "completed" ||
          rawData.status === "paid" ||
          rawData.status === "confirmed" ||
          type === "payment_completed" ||
          type === "payment_confirmed";
        return {
          icon: CreditCard,
          ...commonConfig,
          badgeColor: isPaymentCompleted
            ? "bg-emerald-50 text-emerald-600 border-emerald-100/40"
            : "bg-amber-50 text-amber-600 border-amber-100/40",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              {rawData.amount && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full font-bold">
                  Amount: ₹{rawData.amount}
                </span>
              )}
              {(rawData.paymentStatus || rawData.status) && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-650 px-3 py-1 rounded-full capitalize font-semibold">
                  Status: {rawData.paymentStatus || rawData.status}
                </span>
              )}
              {(rawData.paymentType || rawData.type) && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-650 px-3 py-1 rounded-full capitalize">
                  Type: {(rawData.paymentType || rawData.type).replace("_", " ")}
                </span>
              )}
              {renderActorPill()}
            </div>
          ),
        };
      case "enrollment":
      case "enrollment_created":
      case "enrollment_confirmed":
        return {
          icon: GraduationCap,
          ...commonConfig,
          badgeColor: "bg-violet-50 text-violet-600 border-violet-100/40",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              {rawData.programName && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full font-medium">
                  Program:{" "}
                  <span className="font-semibold text-slate-800">{rawData.programName}</span>
                </span>
              )}
              {rawData.status && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full">
                  Status:{" "}
                  <span className="font-semibold capitalize text-slate-800">{rawData.status}</span>
                </span>
              )}
              {rawData.enrollmentId && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-100 text-slate-655 px-3 py-1 rounded-full font-mono">
                  Enroll ID: {rawData.enrollmentId.slice(0, 8)}...
                </span>
              )}
              {renderActorPill()}
            </div>
          ),
        };
      case "note":
      case "note_added":
        return {
          icon: FileText,
          ...commonConfig,
          badgeColor: "bg-slate-50 text-slate-600 border-slate-100/40",
          renderDetail: () => <div className="flex flex-wrap gap-2 mt-3">{renderActorPill()}</div>,
        };
      default:
        return {
          icon: Clock,
          ...commonConfig,
          badgeColor: "bg-slate-50 text-slate-500 border-slate-100/40",
          renderDetail: () => <div className="flex flex-wrap gap-2 mt-3">{renderActorPill()}</div>,
        };
    }
  };

  return (
    <div className="">
      {/* Search and Filters Segment */}

      {/* Timeline Flow */}
      {filteredTimeline.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground bg-muted/5 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2">
          <SlidersHorizontal className="size-6 text-muted-foreground opacity-60" />
          <div>
            <p className="font-semibold">No matching events found</p>
            <p className="text-xs opacity-75 mt-0.5">Try clearing filters or queries</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 -mt-3">
          {Object.entries(groupedTimeline)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .map(([dateStr, items]) => {
              const dateObj = new Date(dateStr);
              const isTodayDate = format(new Date(), "yyyy-MM-dd") === dateStr;
              const headerText = isTodayDate
                ? `TODAY — ${format(dateObj, "MMMM d, yyyy").toUpperCase()}`
                : format(dateObj, "EEEE — MMMM d, yyyy").toUpperCase();

              return (
                <div key={dateStr} className="space-y-4 ">
                  {/* Date Centered Header */}
                  <div className="flex items-center justify-center my-4">
                    <div className="h-[1px] bg-slate-100 flex-1" />
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 bg-background px-4 uppercase">
                      {headerText}
                    </span>
                    <div className="h-[1px] bg-slate-100 flex-1" />
                  </div>

                  {/* Events list of this day with reduced padding and width padding-left */}
                  <div className="relative space-y-4">
                    {/* The connecting vertical timeline line adjusted to left-20px */}
                    {items.length > 1 && (
                      <div className="absolute left-[20px] top-7 bottom-7 w-[1.5px] bg-slate-100 z-0" />
                    )}

                    {items.map((item, index) => {
                      const config = getEventConfig(item.type, item.data, item.actor);
                      const IconComponent = config.icon;
                      const relativeTime = formatDistanceToNow(new Date(item.timestamp), {
                        addSuffix: true,
                      });
                      const exactTime = format(new Date(item.timestamp), "MMM d, yyyy h:mm a");

                      return (
                        <div key={index} className="relative pl-12 flex items-start">
                          {/* Event node badge icon aligned to top-start and overlaying the vertical line */}
                          <div className="absolute left-[0px] top-1 size-10 rounded-full border border-border bg-background flex items-center justify-center z-10 overflow-hidden shadow-sm">
                            {/* Inner soft overlay colored background */}
                            <div className={`absolute inset-0 opacity-10 ${config.overlayColor}`} />
                            <IconComponent
                              className={`size-4.5 relative z-10 ${config.iconTextColor}`}
                            />
                          </div>

                          {/* Event content card with compact spacing, smaller padding and font sizes */}
                          <div className="flex-1 flex flex-col gap-1 p-3.5 rounded-md  shadow-[0px_0px_6px_0px_rgba(0,_0,_0,_0.1)]">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-slate-800 leading-tight">
                                  {capitalizeWords(item.title)}
                                </span>
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${config.badgeColor}`}
                                >
                                  {item.type.replace("_", " ")}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-400 font-medium shrink-0">
                                <Clock className="size-3.5" />
                                <span title={exactTime} className="cursor-help text-[11px]">
                                  {relativeTime} • {exactTime}
                                </span>
                              </div>
                            </div>

                            <p className="text-[13px] text-slate-500 leading-relaxed mt-0.5">
                              {item.description}
                            </p>

                            {/* Dynamic metadata pills containing the actor and exact times internally to save space */}
                            {config.renderDetail()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
