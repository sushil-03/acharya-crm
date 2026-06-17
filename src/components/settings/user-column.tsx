import React, { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { User, Shield, School, ToggleLeft, Edit, Hash, Settings, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui-kit";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { PaginatedUser } from "./hook/query/use-get-users-paginated";

interface UserColumnsOptions {
  roleLabelMap: Record<string, string>;
  onEditUser: (user: PaginatedUser) => void;
  updateUser: (params: { id: string; payload: any }) => Promise<any>;
  refetchUsers: () => void;
  refetchRoles: () => void;
}

export const getUserColumns = ({
  roleLabelMap,
  onEditUser,
  updateUser,
  refetchUsers,
  refetchRoles,
}: UserColumnsOptions): ColumnDef<PaginatedUser>[] => [
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
        <span className="text-[12px] tabular-nums pl-1">{pageIndex * pageSize + index + 1}</span>
      );
    },
  },
  {
    accessorKey: "username",
    header: "Name",
    meta: { label: "Name", cell: { variant: "custom", headerIcon: User } },
    size: 180,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <span className="font-medium text-foreground leading-tight">
          {user.counsellor?.name ?? user.username ?? "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { label: "Email", cell: { variant: "custom", headerIcon: Mail } },
    size: 220,
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono select-all">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    meta: { label: "Role", cell: { variant: "custom", headerIcon: Shield } },
    size: 150,
    cell: ({ row }) => {
      const role = row.original.role;
      return <span className="text-muted-foreground">{roleLabelMap[role] ?? role}</span>;
    },
  },
  {
    accessorKey: "campus",
    header: "Campus",
    meta: { label: "Campus", cell: { variant: "custom", headerIcon: School } },
    size: 250,
    cell: ({ row }) => {
      const campus = row.original.campus;
      return campus ? (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <span>{campus.name}</span>
          {/* <span className="text-[11px] bg-muted rounded px-1.5 py-0.5">
            {campus.code}
          </span> */}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    meta: { label: "Status", cell: { variant: "custom", headerIcon: ToggleLeft } },
    size: 150,
    cell: ({ row }) => {
      const user = row.original;
      const isActive = user.isActive;
      const [confirmOpen, setConfirmOpen] = useState(false);

      return (
        <div className="flex items-center gap-2 px-1" onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={isActive}
            onCheckedChange={() => setConfirmOpen(true)}
            className="cursor-pointer"
          />
          <span
            className={
              isActive
                ? "text-primary font-medium text-xs"
                : "text-muted-foreground font-medium text-xs"
            }
          >
            {isActive ? "Active" : "Inactive"}
          </span>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isActive ? "Deactivate User?" : "Activate User?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to {isActive ? "deactivate" : "activate"}{" "}
                  <strong className="text-foreground">
                    {user.counsellor?.name ?? user.username ?? user.email}
                  </strong>
                  ?{isActive && " This user will no longer be able to log in to the CRM."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      await updateUser({
                        id: user.id,
                        payload: {
                          role: user.role,
                          campusId: user.campusId,
                          isActive: !isActive,
                        },
                      });
                      refetchUsers();
                      refetchRoles();
                      toast.success(`User ${isActive ? "deactivated" : "activated"} successfully`);
                    } catch (err) {
                      toast.error("Failed to update status");
                    }
                  }}
                  className={isActive ? "bg-destructive hover:bg-destructive/90 text-white" : ""}
                >
                  {isActive ? "Deactivate" : "Activate"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    meta: { label: "Action", cell: { variant: "custom", headerIcon: Settings, noPadding: true } },
    size: 100,
    cell: ({ row }) => (
      <div className="flex items-center h-full w-full px-3">
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onEditUser(row.original);
          }}
        >
          <Edit className="size-3.5" />
        </Button>
      </div>
    ),
  },
];
