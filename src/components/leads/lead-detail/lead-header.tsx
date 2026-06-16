import { Button } from "@/components/ui/button";
import {
  Star,
  Mail,
  MessageSquare,
  CheckSquare,
  FileText,
  File,
  Loader2,
  GraduationCap,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useStarLead, useUnstarLead } from "@/components/lists/hook/mutation/use-star-lead";
import { useGetLeadLists } from "@/components/lists/hook/query/use-get-lead-lists";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useConvertLead } from "../hook/mutation/use-update-lead";
import {
  useSubmitApplication,
  useApproveApplication,
  useRejectApplication,
} from "@/components/application/hook/mutation/use-update-application";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { LeadDetail } from "@/types/lead";
import { IApplicationDetails } from "@/components/application/hook/query/use-get-application";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getApplicationStatusLabel,
  getApplicationStatusTone,
  getLeadStatusTone,
  getOfferAlertConfig,
} from "@/lib/constant";
import { useConfirmPayment } from "@/components/payment/hook/mutation/use-confirm-payment";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui-kit";
import { useUserStore } from "@/store/use-user-store";

export function LeadHeader({
  lead,
  applicationData,
  isApplicationDataLoading,
}: {
  lead: LeadDetail;
  applicationData?: IApplicationDetails;
  isApplicationDataLoading?: boolean;
}) {
  const { user } = useUserStore();
  const isCounsellor = user?.role === "counsellor" || user?.role === "councellor";
  const queryClient = useQueryClient();
  const { mutate: convertLead, isPending } = useConvertLead();
  const { mutate: starLead, isPending: isStarring } = useStarLead();
  const { mutate: unstarLead, isPending: isUnstarring } = useUnstarLead();
  const { data: leadLists } = useGetLeadLists(lead.id);
  const isStarred = leadLists?.some((m) => m.list.isSystem && m.list.name === "Starred") ?? false;
  const { mutate: confirmPayment, isPending: isConfirmPaymentPending } = useConfirmPayment();
  const { mutate: submitApplication, isPending: isSubmitPending } = useSubmitApplication();
  const { mutate: approveApplication, isPending: isApprovePending } = useApproveApplication();
  const { mutate: rejectApplication, isPending: isRejectPending } = useRejectApplication();

  const [rejectReason, setRejectReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const applicationStatus = useMemo(() => {
    if (!applicationData) return null;
    return applicationData?.status || null;
  }, [applicationData]);

  const initiatedApplicationFeePayment = useMemo(() => {
    if (!applicationData || !applicationData.payments || applicationData.payments.length === 0)
      return null;
    return (
      applicationData.payments.find(
        (p) => p.paymentType === "application_fee" && p.paymentStatus === "initiated",
      ) || null
    );
  }, [applicationData]);

  const offer = applicationData?.offers?.[0];
  const offerClasses = useMemo(() => getOfferAlertConfig(offer?.status), [offer?.status]);

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background shrink-0 ">
      <div className="flex items-center gap-4">
        <Link to="/applications" className="text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-gradient-brand grid place-items-center text-white font-bold text-xs">
            {lead.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-[15px] leading-none">{lead.name}</h1>
              <button
                className="text-muted-foreground hover:text-amber-500 transition"
                disabled={isStarring || isUnstarring}
                onClick={() => (isStarred ? unstarLead(lead.id) : starLead(lead.id))}
                title={isStarred ? "Remove from Starred" : "Add to Starred"}
              >
                <Star
                  className={`size-4 transition-colors ${isStarred ? "fill-amber-500 text-amber-500" : ""}`}
                />
              </button>
            </div>
            {applicationData?.status && (
              <Badge
                tone={getApplicationStatusTone(applicationData.status) as any}
                className="h-5 px-2 rounded-full text-[9px] font-bold w-fit  mt-0.5 tracking-wider"
              >
                Application{" "}
                <span className="uppercase">
                  {getApplicationStatusLabel(applicationData.status)}
                </span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {lead.status === "assigned" && lead.interactions.length === 0 && (
          <Alert variant="default" className="p-2 py-1.5 flex items-center gap-3">
            <AlertCircle className="size-4" />
            <div className="flex-1">
              <AlertDescription className="text-xs font-medium flex items-center justify-between">
                <span>
                  You need to start interaction to be able to convert this lead to a student.
                </span>
              </AlertDescription>
            </div>
          </Alert>
        )}
        {lead.status === "converted" &&
          lead.interactions.length > 0 &&
          lead.applications.length === 0 && (
            <Alert variant="default" className="p-2 py-1.5 flex items-center gap-3">
              <AlertCircle className="size-4" />
              <div className="flex-1">
                <AlertDescription className="text-xs font-medium flex items-center justify-between">
                  <span>You need to start an application.</span>
                  <Button size="sm" className="h-6 text-xs ml-3" asChild>
                    <Link to="/application/start">Start Application</Link>
                  </Button>
                </AlertDescription>
              </div>
            </Alert>
          )}
        {lead.status !== "converted" &&
          lead.interactions.length > 0 &&
          lead.applications.length === 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="light-success"
                  disabled={isPending}
                  // className="bg-success hover:bg-success/90 text-success-foreground"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin mr-1.5" />
                  ) : (
                    <GraduationCap className="size-4 mr-1.5" />
                  )}
                  Promote to Student
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Promote to Student</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to promote this lead to a student? This action will
                    formally convert their status.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => convertLead(lead.id)}>
                    Confirm Promotion
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

        {initiatedApplicationFeePayment && !initiatedApplicationFeePayment.gatewayOrderId && (
          <Alert
            variant="default"
            className="p-2 py-1.5 flex items-center gap-3 bg-amber-500/10 border-amber-500/20 text-amber-600"
          >
            <AlertCircle className="size-4 text-amber-600" />
            <div className="flex-1">
              <AlertDescription className="text-xs font-medium">
                Pending Payment: Student needs to pay the registration fee.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {initiatedApplicationFeePayment && initiatedApplicationFeePayment.gatewayOrderId && (
          <>
            {isCounsellor ? (
              <Alert variant="default" className="p-2 py-1.5 flex items-center gap-3 bg-muted/30">
                <AlertCircle className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <AlertDescription className="text-xs font-medium flex items-center justify-between">
                    <span className="text-muted-foreground">Only admin can confirm payment</span>
                    <Button
                      disabled
                      size="sm"
                      className="h-6 text-xs bg-primary text-white opacity-50 ml-3"
                    >
                      <CheckSquare className="size-3 mr-1.5" />
                      Confirm Payment
                    </Button>
                  </AlertDescription>
                </div>
              </Alert>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={isConfirmPaymentPending}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {isConfirmPaymentPending ? (
                      <Loader2 className="size-4 animate-spin mr-1.5" />
                    ) : (
                      <CheckSquare className="size-4 mr-1.5" />
                    )}
                    Confirm Payment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to confirm the payment of ₹
                      {initiatedApplicationFeePayment.amount} for {lead.name}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        const referenceNumber = `txn_mock_${Math.random().toString(36).substring(2, 12)}`;
                        confirmPayment(
                          {
                            id: initiatedApplicationFeePayment.id,
                            payload: {
                              referenceNumber,
                              notes: "Payment processed via confirmation",
                            },
                          },
                          {
                            onSuccess: () => {
                              queryClient.invalidateQueries({
                                queryKey: [QUERY_KEYS.GET_APPLICATION_BY_ID, applicationData?.id],
                              });
                            },
                          },
                        );
                      }}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        )}

        {applicationStatus === "started" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={isSubmitPending}>
                {isSubmitPending ? (
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                ) : (
                  <CheckSquare className="size-4 mr-1.5" />
                )}
                Submit Application
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Application</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to submit this application? This action will formally submit
                  it for review.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => submitApplication(lead.applications[0].id)}>
                  Confirm Submit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {applicationStatus === "verified" && (
          <>
            {isCounsellor ? (
              <Alert variant="default" className="p-2 py-1.5 flex items-center gap-3 bg-muted/30">
                <AlertCircle className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <AlertDescription className="text-xs font-medium flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Only admin can accept or reject application
                    </span>
                    <div className="flex items-center gap-2 ml-3">
                      <Button
                        disabled
                        size="sm"
                        className="h-6 text-xs bg-primary text-white opacity-50"
                      >
                        <CheckSquare className="size-3 mr-1.5" />
                        Accept
                      </Button>
                      <Button
                        disabled
                        variant="destructive"
                        size="sm"
                        className="h-6 text-xs opacity-50"
                      >
                        <XCircle className="size-3 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
            ) : (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={isApprovePending}>
                      {isApprovePending ? (
                        <Loader2 className="size-4 animate-spin mr-1.5" />
                      ) : (
                        <CheckSquare className="size-4 mr-1.5" />
                      )}
                      Accept
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Accept Application</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to accept this application?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => approveApplication(lead.applications[0].id)}
                      >
                        Confirm Accept
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={isRejectPending}>
                      {isRejectPending ? (
                        <Loader2 className="size-4 animate-spin mr-1.5" />
                      ) : (
                        <XCircle className="size-4 mr-1.5" />
                      )}
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Application</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to reject this application? Please provide a reason.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="reason">Reason for Rejection</Label>
                        <Textarea
                          id="reason"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Enter reason for rejection"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={isRejectPending || !rejectReason.trim()}
                        onClick={() => {
                          rejectApplication(
                            { id: lead.applications[0].id, payload: { reason: rejectReason } },
                            {
                              onSuccess: () => {
                                setIsRejectDialogOpen(false);
                                setRejectReason("");
                              },
                            },
                          );
                        }}
                      >
                        {isRejectPending ? "Rejecting..." : "Confirm Reject"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </>
        )}

        {applicationStatus === "submitted" && (
          <>
            <Alert variant="destructive" className="p-1">
              <AlertCircle className="size-4 " />
              <AlertTitle>Upload Document</AlertTitle>
              <AlertDescription className="text-xs font-medium">
                You need to upload required document before accepting the application.
              </AlertDescription>
            </Alert>
          </>
        )}
        {applicationStatus === "docs_pending" && (
          <>
            <Alert variant="destructive" className="p-1">
              <AlertCircle className="size-4 " />
              <AlertTitle>Verify Documents</AlertTitle>
              <AlertDescription className="text-xs font-medium">
                You need to approve all documents to proceed further.
              </AlertDescription>
            </Alert>
          </>
        )}
        {applicationStatus === "under_review" && (
          <>
            <Alert variant="destructive" className="p-1">
              <AlertCircle className="size-4 " />
              <AlertTitle>Under Review</AlertTitle>
              <AlertDescription className="text-xs font-medium">
                All the documents need to be verified.
              </AlertDescription>
            </Alert>
          </>
        )}
        {applicationStatus === "approved" && !offer && (
          <Alert
            variant="default"
            className="p-2 py-1.5 border-success text-success bg-success/10 flex items-center gap-3"
          >
            <CheckSquare className="size-4 text-success" />
            <div className="flex-1">
              <AlertDescription className="text-xs font-medium flex items-center justify-between">
                <span>Application is approved. You can create an offer.</span>
                <Button
                  size="sm"
                  className="h-6 text-xs bg-success hover:bg-success/90 text-white ml-3"
                  asChild
                >
                  <Link to="/applications">Create Offers</Link>
                </Button>
              </AlertDescription>
            </div>
          </Alert>
        )}
        {applicationStatus === "approved" && offer && (
          <Alert
            variant="default"
            className={`p-2 py-1.5 flex items-center gap-3 ${offerClasses.alert}`}
          >
            <CheckSquare className={`size-4 ${offerClasses.icon}`} />
            <div className="flex-1">
              <AlertDescription className="text-xs font-medium flex items-center justify-between">
                <span className="capitalize">Offer Status: {offer.status.replace(/_/g, " ")}</span>
                <Button
                  size="sm"
                  className={`h-6 text-xs text-white ml-3 ${offerClasses.button}`}
                  asChild
                >
                  <Link to="/offer/$offerId" params={{ offerId: offer.id }}>
                    View Offer
                  </Link>
                </Button>
              </AlertDescription>
            </div>
          </Alert>
        )}
        {/* <Button variant="outline" size="icon" className="size-8">
          <MessageSquare className="size-3.5" />
        </Button>

        <Button variant="outline" size="icon" className="size-8">
          <FileText className="size-3.5" />
        </Button> */}
      </div>
    </div>
  );
}
