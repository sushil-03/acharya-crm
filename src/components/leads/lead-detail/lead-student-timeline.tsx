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
        <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
          <User className="size-3 text-muted-foreground/70" />
          <span className="font-medium">By:</span>
          <span className="font-semibold text-foreground capitalize">{actorName}</span>
        </span>
      );
    };

    // Left Node Badge: all use clean neutral slate overlays and slate grey icons
    const commonConfig = {
      overlayColor: "bg-muted-foreground",
      iconTextColor: "text-muted-foreground dark:text-foreground/80",
    };

    switch (type) {
      case "lead_created":
        return {
          icon: Sparkles,
          ...commonConfig,
          badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-100/40 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                <Globe className="size-3 text-muted-foreground/70" />
                <span className="font-medium">Source:</span>
                <span className="font-semibold text-foreground capitalize">
                  {rawData.source || "N/A"}
                </span>
              </span>
              {rawData.leadScore !== undefined && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                  <TrendingUp className="size-3 text-muted-foreground/70" />
                  <span className="font-medium">Score:</span>
                  <span className="font-semibold text-foreground">{rawData.leadScore}</span>
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
          badgeColor: "bg-blue-50 text-blue-600 border-blue-100/40 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                <User className="size-3 text-muted-foreground/70" />
                <span className="font-medium">Counsellor:</span>
                <span className="font-semibold text-foreground capitalize">
                  {rawData.counsellorName || "N/A"}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                <CheckCircle className="size-3 text-muted-foreground/70" />
                <span className="font-semibold text-foreground">Active Assignment</span>
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
          badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100/40 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                <Phone className="size-3 text-muted-foreground/70" />
                <span className="font-medium">Channel:</span>
                <span className="font-semibold text-foreground capitalize">
                  {rawData.interactionType || "Interaction"}
                </span>
              </span>
              {rawData.outcome && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                  <RefreshCw className="size-3 text-muted-foreground/70" />
                  <span className="font-medium">Outcome:</span>
                  <span className="font-semibold text-foreground capitalize">
                    {rawData.outcome.replace("_", " ")}
                  </span>
                </span>
              )}
              {rawData.durationSeconds !== undefined && rawData.durationSeconds > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                  <Clock className="size-3 text-muted-foreground/70" />
                  <span className="font-medium">Duration:</span>
                  <span className="font-semibold text-foreground">{rawData.durationSeconds}s</span>
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
          badgeColor: "bg-amber-50 text-amber-600 border-amber-100/40 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                <Tag className="size-3 text-muted-foreground/70" />
                <span className="font-medium">Type:</span>
                <span className="font-semibold text-foreground capitalize">
                  {rawData.taskType?.replace("_", " ") || "Task"}
                </span>
              </span>
              {rawData.dueDate && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                  <Calendar className="size-3 text-muted-foreground/70" />
                  <span className="font-medium">Due:</span>
                  <span className="font-semibold text-foreground">
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
          badgeColor: "bg-purple-50 text-purple-600 border-purple-100/40 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                <User className="size-3 text-muted-foreground/70" />
                <span className="font-medium">Student:</span>
                <span className="font-semibold text-foreground">{data.leadName}</span>
              </span>
              {rawData.studentId && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full font-mono">
                  <span className="font-medium">Program:</span>
                  <span className="font-semibold text-foreground">MBA 2026</span>
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
          badgeColor: "bg-sky-50 text-sky-600 border-sky-100/40 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                <GraduationCap className="size-3 text-muted-foreground/70" />
                <span className="font-medium">Program:</span>
                <span className="font-semibold text-foreground">{rawData.programName || "N/A"}</span>
              </span>
              {rawData.applicationId && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full font-mono">
                  <span className="font-medium">App ID:</span>
                  <span className="text-foreground">{rawData.applicationId.slice(0, 8)}...</span>
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
            ? "bg-emerald-50 text-emerald-600 border-emerald-100/40 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
            : "bg-amber-50 text-amber-600 border-amber-100/40 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              {rawData.amount && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full font-semibold">
                  Amount: <span className="text-foreground">₹{rawData.amount}</span>
                </span>
              )}
              {rawData.status && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                  Status:{" "}
                  <span className="font-semibold capitalize text-foreground">{rawData.status}</span>
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
            ? "bg-emerald-50 text-emerald-600 border-emerald-100/40 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
            : "bg-orange-50 text-orange-600 border-orange-100/40 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full font-semibold">
                Status: <span className="text-foreground">{isAppApproved ? "Verification Successful" : "In Progress"}</span>
              </span>
              {rawData.applicationId && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full font-mono">
                  App ID: <span className="text-foreground">{rawData.applicationId.slice(0, 8)}...</span>
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
            ? "bg-teal-50 text-teal-600 border-teal-100/40 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20"
            : "bg-blue-50 text-blue-600 border-blue-100/40 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                <FileText className="size-3 text-muted-foreground/70" />
                Type:{" "}
                <span className="font-semibold uppercase text-foreground">
                  {rawData.documentType?.replace("_", " ")}
                </span>
              </span>
              {rawData.status && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full font-semibold">
                  Status: <span className="text-foreground">{rawData.status}</span>
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
            ? "bg-pink-50 text-pink-600 border-pink-100/40 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20"
            : "bg-rose-50 text-rose-600 border-rose-100/40 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              {rawData.offerType && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full font-semibold">
                  Offer: <span className="text-foreground">{rawData.offerType}</span>
                </span>
              )}
              {rawData.totalFee && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full font-semibold">
                  Total Fee:{" "}
                  <span className="font-semibold text-foreground">₹{rawData.totalFee}</span>
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
          badgeColor: "bg-purple-50 text-purple-600 border-purple-100/40 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              {rawData.type && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full font-semibold">
                  Type: <span className="text-foreground">{capitalizeWords(rawData.type)}</span>
                </span>
              )}
              {rawData.amountValue && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full font-bold">
                  Amount: <span className="text-foreground">₹{rawData.amountValue}</span>
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
          badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100/40 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              {rawData.netFeePayable && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full font-bold">
                  Net Payable: <span className="text-foreground">₹{rawData.netFeePayable}</span>
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
            ? "bg-emerald-50 text-emerald-600 border-emerald-100/40 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
            : "bg-amber-50 text-amber-600 border-amber-100/40 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              {rawData.amount && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full font-bold">
                  Amount: <span className="text-foreground">₹{rawData.amount}</span>
                </span>
              )}
              {(rawData.paymentStatus || rawData.status) && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full capitalize font-semibold">
                  Status: <span className="text-foreground">{rawData.paymentStatus || rawData.status}</span>
                </span>
              )}
              {(rawData.paymentType || rawData.type) && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full capitalize">
                  Type: <span className="text-foreground">{(rawData.paymentType || rawData.type).replace("_", " ")}</span>
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
          badgeColor: "bg-violet-50 text-violet-600 border-violet-100/40 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
          renderDetail: () => (
            <div className="flex flex-wrap gap-2 mt-3">
              {rawData.programName && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full font-medium">
                  Program:{" "}
                  <span className="font-semibold text-foreground">{rawData.programName}</span>
                </span>
              )}
              {rawData.status && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                  Status:{" "}
                  <span className="font-semibold capitalize text-foreground">{rawData.status}</span>
                </span>
              )}
              {rawData.enrollmentId && (
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-muted/60 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full font-mono">
                  Enroll ID: <span className="text-foreground">{rawData.enrollmentId.slice(0, 8)}...</span>
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
          badgeColor: "bg-slate-50 text-slate-600 border-slate-100/40 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
          renderDetail: () => <div className="flex flex-wrap gap-2 mt-3">{renderActorPill()}</div>,
        };
      default:
        return {
          icon: Clock,
          ...commonConfig,
          badgeColor: "bg-slate-50 text-slate-500 border-slate-100/40 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
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
                    <div className="h-[1px] bg-border flex-1" />
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground bg-background px-4 uppercase">
                      {headerText}
                    </span>
                    <div className="h-[1px] bg-border flex-1" />
                  </div>

                  {/* Events list of this day with reduced padding and width padding-left */}
                  <div className="relative space-y-4">
                    {/* The connecting vertical timeline line adjusted to left-20px */}
                    {items.length > 1 && (
                      <div className="absolute left-[20px] top-7 bottom-7 w-[1.5px] bg-border z-0" />
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
                          <div className="flex-1 flex flex-col gap-1 p-3.5 rounded-md bg-card border border-border shadow-sm">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-foreground leading-tight">
                                  {capitalizeWords(item.title)}
                                </span>
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${config.badgeColor}`}
                                >
                                  {item.type.replace("_", " ")}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium shrink-0">
                                <Clock className="size-3.5" />
                                <span title={exactTime} className="cursor-help text-[11px]">
                                  {relativeTime} • {exactTime}
                                </span>
                              </div>
                            </div>

                            <p className="text-[13px] text-muted-foreground leading-relaxed mt-0.5">
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
