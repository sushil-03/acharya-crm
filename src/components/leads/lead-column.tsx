import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui-kit";
import {
  Phone,
  Mail,
  MoreHorizontal,
  MessageCircle,
  User,
  UserPlus,
  Link2,
  Milestone,
  Signal,
  Headset,
  Activity,
  List,
} from "lucide-react";
import { LeadListsCell } from "./lead-lists-cell";
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  LEAD_STATUS,
  LEAD_SOURCES,
  PROGRAMS,
  getLeadSourceTone,
  getLeadStatusTone,
} from "../../lib/constant";
import { getReadableDate } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { useReassignLead, useRetryAssignment } from "./hook/mutation/use-reassign-lead";
import { Button } from "@/components/ui/button";
import { useGetCounsellors } from "@/components/global/hooks/use-get-counsellor";

const StageCell = ({ row }: { row: any }) => {
  const stage = row.original.stage as string;
  const tone = getLeadStatusTone(stage);
  const label = LEAD_STATUS.find((s) => s.value === stage)?.label || stage;

  return <Badge tone={tone}>{label}</Badge>;
};

const ActionsCell = ({ row }: { row: any }) => {
  return (
    <div className="flex items-center gap-1">
      <button className="size-7 rounded-md hover:bg-muted grid place-items-center">
        <Phone className="size-3.5" />
      </button>
      <button className="size-7 rounded-md hover:bg-muted grid place-items-center">
        <Mail className="size-3.5" />
      </button>
      <button className="size-7 rounded-md hover:bg-muted grid place-items-center">
        <MessageCircle className="size-3.5" />
      </button>
    </div>
  );
};

const CounsellorCell = ({ row }: { row: any }) => {
  const counsellorData = row.original.counsellor;
  const { mutate: retryAssignment, isPending } = useRetryAssignment();
  const { data: counsellors } = useGetCounsellors();

  let counsellorName = "";
  if (Array.isArray(counsellorData)) {
    counsellorName = counsellorData
      .map((item) => {
        const id = typeof item === "object" ? item?.id || item?.counsellorId : item;
        return counsellors?.find((c) => c.id === id)?.name || item?.name || id;
      })
      .filter(Boolean)
      .join(", ");
  } else if (typeof counsellorData === "string") {
    counsellorName = counsellorData
      .split(",")
      .map((id) => counsellors?.find((c) => c.id === id.trim())?.name || id)
      .filter(Boolean)
      .join(", ");
  } else if (typeof counsellorData === "object" && counsellorData !== null) {
    const id = counsellorData.id || counsellorData.counsellorId;
    counsellorName = counsellors?.find((c) => c.id === id)?.name || counsellorData.name || id || "";
  } else {
    counsellorName = String(counsellorData || "");
  }

  const isCounsellorEmpty =
    !counsellorData ||
    (Array.isArray(counsellorData) && counsellorData.length === 0) ||
    (typeof counsellorData === "string" && counsellorData.trim().length === 0);

  if (isCounsellorEmpty) {
    return (
      <Button
        variant="dashed"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          retryAssignment(row.original.id);
        }}
        loading={isPending}
        disabled={isPending}
        className="group h-auto px-2.5 py-0.5 text-[11px] gap-1.5 rounded-sm"
      >
        <UserPlus className="size-3 group-hover:scale-110 transition-transform" />
        Assign
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] font-medium">{counsellorName}</span>
    </div>
  );
};

export const getLeadsColumn: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Lead",
    meta: { label: "Lead", cell: { variant: "custom", headerIcon: User } },
    size: 200,
    cell: ({ row }) => {
      const l = row.original;
      return (
        <Link to="/leads/$leadId" params={{ leadId: l.id }} className="flex items-center gap-2.5">
          <span className="font-semibold text-foreground hover:text-primary truncate">
            {l.name || "No Name"}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "city",
    header: "City",
    meta: { label: "City", cell: { variant: "short-text" } },
    size: 120,
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { label: "Email", cell: { variant: "short-text" } },
    size: 180,
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
    meta: { label: "Mobile", cell: { variant: "short-text" } },
    size: 120,
  },
  {
    accessorKey: "state",
    header: "State",
    meta: { label: "State", cell: { variant: "short-text" } },
    size: 120,
  },
  {
    accessorKey: "utmSource",
    header: "UTM Source",
    meta: { label: "UTM Source", cell: { variant: "short-text" } },
    size: 120,
  },
  {
    accessorKey: "utmMedium",
    header: "UTM Medium",
    meta: { label: "UTM Medium", cell: { variant: "short-text" } },
    size: 120,
  },
  {
    accessorKey: "utmCampaign",
    header: "UTM Campaign",
    meta: { label: "UTM Campaign", cell: { variant: "short-text" } },
    size: 120,
  },
  {
    accessorKey: "program",
    header: "Program",
    meta: {
      label: "Program",
      cell: {
        variant: "select",
        options: PROGRAMS,
      },
    },
    size: 200,
    cell: ({ row }) => {
      const l = row.original;
      return <div className="font-medium truncate max-w-[180px]">{l.program}</div>;
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    meta: {
      label: "Source",
      cell: {
        variant: "custom",
        headerIcon: Link2,
        // options: LEAD_SOURCES,
      },
    },
    size: 100,
    cell: ({ row }) => {
      const source = row.original.source as string;
      const tone = getLeadSourceTone(source);
      const label = LEAD_SOURCES.find((s) => s.value === source)?.label || source;

      return <Badge tone={tone}>{label}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      label: "Status",
      cell: {
        variant: "custom",
        headerIcon: Milestone,
        // options: LEAD_STATUS,
      },
    },
    size: 120,
    cell: ({ row }) => <StageCell row={row} />,
  },
  {
    accessorKey: "score",
    header: "Score",
    meta: { label: "Score", cell: { variant: "custom", headerIcon: Signal } },
    size: 120,
    cell: ({ row }) => {
      const score = row.original.score as number;
      return (
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full ${score > 75 ? "bg-success" : score > 55 ? "bg-warning" : "bg-muted-foreground/40"}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="font-semibold tabular-nums text-[12px]">{score}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "counsellor",
    header: "Counsellor",
    meta: {
      label: "Counsellor",
      cell: {
        variant: "custom",
        headerIcon: Headset,
      },
    },
    size: 150,
    cell: ({ row }) => <CounsellorCell row={row} />,
  },

  {
    id: "lists",
    header: "Lists",
    meta: { label: "Lists", cell: { variant: "custom", headerIcon: List } },
    size: 220,
    cell: ({ row }) => <LeadListsCell leadId={row.original.id} leadName={row.original.name} />,
  },
  {
    accessorKey: "lastActivity",
    header: "Activity",
    meta: { label: "Activity", cell: { variant: "custom", headerIcon: Activity } },
    size: 140,
    cell: ({ row }) => <span className="">{getReadableDate(row.original.lastActivity)}</span>,
  },
  {
    id: "actions",
    header: () => "",
    meta: { label: "Actions" },
    enableSorting: false,
    enableHiding: false,
    size: 100,
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];
