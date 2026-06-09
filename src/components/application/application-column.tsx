import { ColumnDef, Row } from "@tanstack/react-table";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui-kit";
import {
  Hash,
  User,
  Link2,
  MapPin,
  Milestone,
  Activity,
  DollarSign,
  Calendar,
  FilePlus,
  CheckSquare,
  Loader2,
  Lock,
} from "lucide-react";
import { getReadableDate } from "@/lib/utils";
import { useGetCampuses } from "@/components/global/hooks/use-get-campuses";
import {
  getApplicationStatusTone,
  getApplicationStatusLabel,
  getOfferStatusTone,
} from "../../lib/constant";
import { useState, ComponentProps } from "react";
import { CreateOfferModal } from "./create-offer-modal";
import { Button } from "../ui/button";
// import { useSubmitApplication } from "./hook/mutation/use-submit-application";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSubmitApplication } from "./hook/mutation/use-update-application";
import { Link } from "@tanstack/react-router";
import { useUserStore } from "@/store/use-user-store";

export interface ApplicationTableRow {
  id: string;
  student: string;
  program: string;
  campus: string;
  status: string;
  progress: number;
  submitted: string;
  offers: Array<{ id: string; status: string; [key: string]: unknown }>;
  fee?: number;
  payments?: {
    id: string;
    paymentType: string;
    paymentStatus: string;
    amount: string;
    gatewayOrderId?: string;
  }[];
}

const CampusCell = ({ row }: { row: Row<ApplicationTableRow> }) => {
  const { data: campuses } = useGetCampuses();
  const campusId = row.original.campus;
  const campus = campuses?.find(
    (c: { id: string; name: string; value?: string }) => c.id === campusId || c.value === campusId,
  );
  const campusLabel = campus?.name || campusId;

  return <span>{campusLabel}</span>;
};

const CreateOfferCell = ({ row }: { row: Row<ApplicationTableRow> }) => {
  const { user } = useUserStore();
  const isAdmin = user?.role === "super_admin";
  const [open, setOpen] = useState(false);
  const applicationId = row.original.id;
  const offers = row.original.offers || [];
  const status = row.original.status;
  const initiatedApplicationFeePayment =
    row.original.payments?.find(
      (p) => p.paymentType === "application_fee" && p.paymentStatus === "initiated",
    ) || null;
  const { mutate: submitApplication, isPending: isSubmitPending } = useSubmitApplication();
  if (status === "rejected") {
    return null;
  }
  if (status === "submitted") {
    return (
      <AppLink id={applicationId} className="flex w-full items-center justify-center h-full">
        <Badge tone={"danger-light"} className="capitalize">
          Upload Documents
        </Badge>
      </AppLink>
    );
  }
  if (status === "verified") {
    return (
      <AppLink id={applicationId} className="flex w-full items-center justify-center h-full">
        <Badge tone={"warning-light"} className="capitalize">
          Verification Required
        </Badge>
      </AppLink>
    );
  }
  if (status === "docs_pending") {
    return (
      <AppLink id={applicationId} className="flex w-full items-center justify-center h-full">
        <Badge tone={"warning-light"} className="capitalize">
          Document Verification Pending
        </Badge>
      </AppLink>
    );
  }
  if (status === "under_review") {
    return (
      <AppLink id={applicationId} className="flex w-full items-center justify-center h-full">
        <Badge tone={"warning-light"} className="capitalize">
          Under Review
        </Badge>
      </AppLink>
    );
  }
  if (status === "started") {
    return (
      <div className="flex w-full items-center justify-center h-full">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              disabled={isSubmitPending}
              className="h-7 text-xs px-3 rounded-full"
              onClick={(e) => e.stopPropagation()}
            >
              {isSubmitPending ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
              ) : (
                <CheckSquare className="size-3 " />
              )}
              Submit
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Application</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit this application? This action will formally submit
                it for review.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => submitApplication(applicationId)}>
                Confirm Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  if (status === "payment_pending") {
    if (initiatedApplicationFeePayment && initiatedApplicationFeePayment.gatewayOrderId) {
      return (
        <div className="flex w-full items-center justify-center h-full">
          <Badge tone={"info"} className="capitalize">
            Pending Verification
          </Badge>
        </div>
      );
    }
    return (
      <div className="flex w-full items-center justify-center h-full">
        <Badge tone={"warning"} className="capitalize">
          Registration Fee Pending
        </Badge>
      </div>
    );
  }
  if (offers.length > 0) {
    const offer = offers[0]; // Assuming we show the first offer or the latest
    return (
      <div className="flex w-full items-center justify-center h-full">
        <Badge
          tone={getOfferStatusTone(offer.status) as ComponentProps<typeof Badge>["tone"]}
          className="capitalize"
        >
          {offer.status}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center h-full">
      {!isAdmin ? (
        <Button
          size="sm"
          variant="secondary"
          className="h-7 text-xs px-3 rounded-full opacity-80 cursor-not-allowed"
          tooltip="Only admins can create offers"
        >
          <Lock className="w-3 h-3 mr-1" />
          Create Offer
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className="h-7 text-xs px-3 rounded-full"
        >
          <FilePlus className="w-3 h-3 mr-1" />
          Create Offer
        </Button>
      )}
      {open && (
        <CreateOfferModal open={open} onOpenChange={setOpen} applicationId={applicationId} />
      )}
    </div>
  );
};

const AppLink = ({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate({ to: "/application/$applicationId", params: { applicationId: id } });
      }}
      className={`cursor-pointer w-full h-full min-h-8 flex items-center group ${className || ""}`}
    >
      {children}
    </div>
  );
};

export const getApplicationColumns: ColumnDef<ApplicationTableRow>[] = [
  {
    id: "sno",
    header: "S.No",
    meta: { label: "S.No", cell: { variant: "custom", headerIcon: Hash } },
    size: 60,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      const sortedIndex = table.getRowModel().rows.findIndex((r) => r.id === row.id);
      const index = sortedIndex !== -1 ? sortedIndex : row.index;
      return (
        <span className="text-[12px] tabular-nums pl-1">
          {pageIndex * pageSize + index + 1}
        </span>
      );
    },
  },
  {
    accessorKey: "student",
    header: "Student",
    meta: { label: "Student", cell: { variant: "custom", headerIcon: User } },
    size: 180,
    cell: ({ row }) => (
      <Link
        to="/application/$applicationId"
        params={{ applicationId: row.original.id }}
        className="flex items-center gap-2.5"
      >
        <span className="font-semibold text-foreground hover:text-primary truncate">
          {" "}
          {row.original.student}
        </span>
      </Link>
    ),
  },
  {
    accessorKey: "program",
    header: "Program",
    meta: { label: "Program", cell: { variant: "custom", headerIcon: Link2 } },
    size: 200,
    cell: ({ row }) => <span className="truncate">{row.original.program}</span>,
  },
  {
    accessorKey: "campus",
    header: "Campus",
    meta: { label: "Campus", cell: { variant: "custom", headerIcon: MapPin } },
    size: 200,
    cell: ({ row }) => <CampusCell row={row} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { label: "Status", cell: { variant: "custom", headerIcon: Milestone } },
    size: 140,
    cell: ({ row }) => {
      const status = row.original.status;
      const tone = getApplicationStatusTone(status);
      const label = getApplicationStatusLabel(status);
      return (
        <Badge tone={tone as ComponentProps<typeof Badge>["tone"]}>
          {label
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </Badge>
      );
    },
  },
  // {
  //   accessorKey: "progress",
  //   header: "Progress",
  //   meta: { label: "Progress", cell: { variant: "custom", headerIcon: Activity } },
  //   size: 140,
  //   cell: ({ row }) => {
  //     const progress = row.original.progress;
  //     return (
  //       <div className="flex items-center gap-2">
  //         <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
  //           <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
  //         </div>
  //         <span className="text-[11px] font-semibold tabular-nums">{progress}%</span>
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "fee",
  //   header: "Fee",
  //   meta: { label: "Fee", cell: { variant: "custom", headerIcon: DollarSign } },
  //   size: 100,
  //   cell: ({ row }) => {
  //     const fee = row.original.fee;
  //     return <span className="font-semibold">₹{(fee / 1000).toFixed(0)}K</span>;
  //   },
  // },
  {
    accessorKey: "submitted",
    header: "Submitted",
    meta: { label: "Submitted", cell: { variant: "custom", headerIcon: Calendar } },
    size: 140,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-[12px]">
        {getReadableDate(row.original.submitted)}
      </span>
    ),
  },
  {
    id: "actions",
    accessorFn: (row) => `${row.status}-${JSON.stringify(row.offers)}`,
    header: "actions",
    meta: { label: "Action", cell: { variant: "custom", headerIcon: FilePlus, noPadding: true } },
    size: 140,
    cell: ({ row }) => <CreateOfferCell row={row} />,
  },
];
