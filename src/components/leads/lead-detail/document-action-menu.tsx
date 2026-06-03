import { useState } from "react";
import { useVerifyDocument } from "@/components/application/hook/mutation/use-verify-document";
import { useDeleteDocument } from "@/components/application/hook/mutation/use-delete-document";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Check, X, RefreshCcw, Trash2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/store/use-user-store";

export function DocumentActionMenu({ documentId }: { documentId: string }) {
  const { mutate: verifyDocument, isPending: isVerifying } = useVerifyDocument();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();
  const { user } = useUserStore();
  const isAdmin = user?.role === "super_admin";

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: "rejected" | "re_upload_requested" | null;
  }>({
    open: false,
    type: null,
  });
  const [reason, setReason] = useState("");

  const handleVerify = () => {
    verifyDocument({ documentId, status: "verified" });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocument(documentId);
    }
  };

  const handleActionWithReason = () => {
    if (!dialogState.type || !reason.trim()) return;
    verifyDocument(
      { documentId, status: dialogState.type, rejectionReason: reason },
      {
        onSuccess: () => {
          setDialogState({ open: false, type: null });
          setReason("");
        },
      },
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isAdmin && (
            <>
              <DropdownMenuLabel className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-normal">
                <AlertCircle className="size-3" />
                Only admin can verify
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={handleVerify} disabled={!isAdmin || isVerifying}>
            <Check className="size-4 mr-2" />
            Verify
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDialogState({ open: true, type: "rejected" })}
            disabled={!isAdmin || isVerifying}
          >
            <X className="size-4 mr-2" />
            Reject
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDialogState({ open: true, type: "re_upload_requested" })}
            disabled={!isAdmin || isVerifying}
          >
            <RefreshCcw className="size-4 mr-2" />
            Request Re-upload
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={!isAdmin || isDeleting}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={dialogState.open}
        onOpenChange={(open) => {
          setDialogState((prev) => ({ ...prev, open }));
          if (!open) setReason("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState.type === "rejected" ? "Reject Document" : "Request Re-upload"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Enter the reason here..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogState({ open: false, type: null });
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleActionWithReason} disabled={!reason.trim() || isVerifying}>
              {isVerifying ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
