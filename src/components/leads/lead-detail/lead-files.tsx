import { LeadDetail } from "@/types/lead";
import { IApplicationDetails } from "@/components/application/hook/query/use-get-application";
import { Card } from "@/components/ui/card";
import { File, CheckCircle2, Clock, XCircle, AlertCircle, UploadIcon } from "lucide-react";
import { Badge } from "@/components/ui-kit";
import { getReadableDate } from "@/lib/utils";
import { UploadDocumentModal } from "./upload-document-modal";
import { DocumentActionMenu } from "./document-action-menu";
import { useUserStore } from "@/store/use-user-store";

const getStatusTone = (status: string) => {
  switch (status?.toLowerCase()) {
    case "verified":
      return "success";
    case "rejected":
      return "danger";
    case "pending":
      return "warning";
    case "uploaded":
      return "primary";
    default:
      return "muted";
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case "verified":
      return <CheckCircle2 className="size-3 mr-1" />;
    case "rejected":
      return <XCircle className="size-3 mr-1" />;
    case "pending":
      return <Clock className="size-3 mr-1" />;
    case "uploaded":
      return <UploadIcon className="size-3 mr-1" />;
    default:
      return <AlertCircle className="size-3 mr-1" />;
  }
};

export function LeadFiles({
  application,
  lead,
  isLoading,
}: {
  lead: LeadDetail;
  application?: IApplicationDetails;
  isLoading: boolean;
}) {
  const { user } = useUserStore();
  const isAdmin = user?.role === "super_admin";

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="text-sm text-muted-foreground p-4 text-center">Loading files...</div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold ">Student Documents</h3>
            {application && <UploadDocumentModal applicationId={application.id} />}
          </div>

          {!application?.documents || application.documents.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 text-center">No files found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {application.documents.map((doc: any) => (
                <Card key={doc.id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                      <File className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold truncate" title={doc.fileName}>
                        {doc.fileName || "Untitled Document"}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {doc.documentType?.replace(/_/g, " ").toUpperCase() || "UNKNOWN TYPE"}
                      </div>
                    </div>
                    <div className="-mt-1 -mr-2">
                      <DocumentActionMenu documentId={doc.id} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                    <div className="text-[11px] text-muted-foreground">
                      {doc.createdAt ? getReadableDate(doc.createdAt) : "N/A"}
                    </div>
                    <Badge
                      tone={getStatusTone(doc.verificationStatus) as any}
                      className="px-1.5 py-0"
                    >
                      <div className="flex items-center text-[10px]">
                        {getStatusIcon(doc.verificationStatus)}
                        <span className="capitalize">
                          {doc.verificationStatus?.replace(/_/g, " ") || "Unknown"}
                        </span>
                      </div>
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
