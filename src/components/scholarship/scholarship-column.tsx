import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui-kit";
import {
  Hash,
  User,
  Tag,
  DollarSign,
  Milestone,
  Calendar,
  MoreHorizontal,
  Check,
  X,
  Trash2,
  Mail,
} from "lucide-react";
import { getReadableDate } from "@/lib/utils";
import { useState } from "react";
import { RejectScholarshipModal } from "./reject-scholarship-modal";
import { useApproveScholarship } from "./hook/mutation/use-update-scholarship";
import { useDeleteScholarship } from "./hook/mutation/use-delete-scholarship";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Scholarship } from "./hook/query/use-get-all-scholarship";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const getStatusTone = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "success";
    case "rejected":
      return "danger-light";
    case "pending":
    default:
      return "warning";
  }
};

const ActionsCell = ({ row }: { row: any }) => {
  const scholarship = row.original as Scholarship;
  const [rejectOpen, setRejectOpen] = useState(false);
  const { mutate: approve, isPending: isApproving } = useApproveScholarship();
  const { mutate: deleteScholarship, isPending: isDeleting } = useDeleteScholarship();

  const handleApprove = () => {
    approve(scholarship.id);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this scholarship?")) {
      deleteScholarship(scholarship.id);
    }
  };

  return (
    <div className="w-full h-full flex items-center px-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 ">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {scholarship.approvalStatus?.toLowerCase() === "pending" && (
            <>
              <DropdownMenuItem onClick={handleApprove} disabled={isApproving}>
                <Check className="mr-2 h-4 w-4 text-success" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRejectOpen(true)}>
                <X className="mr-2 h-4 w-4 text-destructive" />
                Reject
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {rejectOpen && (
        <RejectScholarshipModal
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          scholarshipId={scholarship.id}
        />
      )}
    </div>
  );
};

export const getScholarshipColumns: ColumnDef<Scholarship>[] = [
  {
    id: "sno",
    header: "S.No",
    meta: { label: "S.No", cell: { variant: "custom", headerIcon: Hash } },
    size: 60,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return (
        <span className="text-[12px] tabular-nums pl-1">
          {pageIndex * pageSize + row.index + 1}
        </span>
      );
    },
  },
  {
    accessorKey: "studentname",
    header: "Student Name",
    meta: { label: "Student Name", cell: { variant: "custom", headerIcon: User } },
    size: 150,
    cell: ({ row }) => (
      <span className="font-medium truncate">
        {row.original.student.firstName}{" "}
        {row.original.student.lastName !== "-" ? row.original.student.lastName : ""}
      </span>
    ),
  },
  {
    accessorKey: "studentEmail",
    header: "Email",
    meta: { label: "Email", cell: { variant: "custom", headerIcon: Mail } },
    size: 150,
    cell: ({ row }) => <span className="font-medium truncate">{row.original.student.email}</span>,
  },
  {
    accessorKey: "scholarshipType",
    header: "Type",
    meta: { label: "Type", cell: { variant: "custom", headerIcon: Tag } },
    size: 160,
    cell: ({ row }) => {
      const type = row.original.scholarshipType;
      return <span className="capitalize">{type?.replace(/_/g, " ")}</span>;
    },
  },
  {
    accessorKey: "amountValue",
    header: "Amount",
    meta: { label: "Amount", cell: { variant: "custom", headerIcon: DollarSign } },
    size: 140,
    cell: ({ row }) => {
      const { amountValue, amountType } = row.original;
      return (
        <span className="font-medium">
          {amountType === "percentage" ? `${amountValue}%` : `₹${amountValue}`}
        </span>
      );
    },
  },
  {
    accessorKey: "approvalStatus",
    header: "Status",
    meta: { label: "Status", cell: { variant: "custom", headerIcon: Milestone } },
    size: 140,
    cell: ({ row }) => {
      const status = row.original.approvalStatus || "pending";
      const tone = getStatusTone(status);
      const reason = (row.original as any).reason || (row.original as any).rejectionReason;

      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={
                  status.toLowerCase() === "rejected" && reason
                    ? "inline-flex cursor-help"
                    : "inline-flex"
                }
              >
                <Badge tone={tone as any} className="capitalize">
                  {status.replace(/_/g, " ")}
                </Badge>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="capitalize">Status: {status.replace(/_/g, " ")}</p>
              {status.toLowerCase() === "rejected" && reason && (
                <p className="text-xs text-muted-foreground mt-1 max-w-[250px] whitespace-normal">
                  Reason: {reason}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    meta: { label: "Created At", cell: { variant: "custom", headerIcon: Calendar } },
    size: 140,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-[12px]">
        {getReadableDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    meta: { label: "Actions", cell: { variant: "custom", noPadding: true } },
    size: 80,
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];
