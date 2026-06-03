import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Send,
  CheckSquare,
  XCircle,
  FileText,
  CheckCheckIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui-kit";
import { OfferDetail } from "../hook/query/use-get-offer-detail";
import { useReleaseOffer, useAcceptOffer, useRejectOffer } from "../hook/mutation/use-update-offer";
import { Loader2 } from "lucide-react";
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
import { getOfferStatusTone } from "@/lib/constant";
import { useConfirmPayment } from "@/components/payment/hook/mutation/use-confirm-payment";
import { useUserStore } from "@/store/use-user-store";

export function OfferHeader({ offer }: { offer: OfferDetail }) {
  const { mutate: releaseOffer, isPending: isReleasePending } = useReleaseOffer();
  const { mutate: acceptOffer, isPending: isAcceptPending } = useAcceptOffer();
  const { mutate: rejectOffer, isPending: isRejectPending } = useRejectOffer();
  const { mutate: confirmPayment, isPending: isConfirmPaymentPending } = useConfirmPayment();
  const { user } = useUserStore();
  const isAdmin = user?.role === "super_admin";
  const isStudent = user?.role === "student";

  const studentName =
    `${offer.student.firstName} ${offer.student.lastName === "-" ? "" : offer.student.lastName}`.trim();
  const initials = studentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0 h-14">
      <div className="flex items-center gap-4">
        <Link to="/offer" className="text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-gradient-brand grid place-items-center text-white font-bold text-xs uppercase">
            {initials}
          </div>
          <div className="flex flex-col">
            <h1 className="font-semibold text-[15px] leading-tight">{studentName}</h1>
            <span className="text-xs text-muted-foreground">
              Offer • {offer.offerType.charAt(0).toUpperCase() + offer.offerType.slice(1)}
            </span>
          </div>
          <Badge
            tone={getOfferStatusTone(offer.status) as any}
            className="ml-2 h-6 text-xs uppercase tracking-wider"
          >
            {offer.status}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {offer.status === "draft" &&
          (!isAdmin ? (
            <Alert variant="default" className="p-2 py-1.5 flex items-center gap-3 bg-muted/30">
              <AlertCircle className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <AlertDescription className="text-xs font-medium flex items-center justify-between">
                  <span className="text-muted-foreground">Only admin can release offers</span>
                  <Button
                    disabled
                    size="sm"
                    className="h-6 text-xs bg-primary text-white opacity-50 ml-3"
                  >
                    <Send className="size-3 mr-1.5" />
                    Release Offer
                  </Button>
                </AlertDescription>
              </div>
            </Alert>
          ) : (
            <Button
              variant="default"
              disabled={isReleasePending}
              onClick={() => releaseOffer(offer.id)}
            >
              {isReleasePending ? (
                <Loader2 className="size-4 animate-spin mr-1.5" />
              ) : (
                <Send className="size-4 mr-1.5" />
              )}
              Release Offer
            </Button>
          ))}

        {offer.status === "released" && (
          <>
            {!(isAdmin || isStudent) ? (
              <Alert variant="default" className="p-2 py-1.5 flex items-center gap-3 bg-muted/30">
                <AlertCircle className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <AlertDescription className="text-xs font-medium flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Only admin and student can accept or reject offers
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
                    <Button disabled={isAcceptPending}>
                      {isAcceptPending ? (
                        <Loader2 className="size-4 animate-spin mr-1.5" />
                      ) : (
                        <CheckSquare className="size-4 mr-1.5" />
                      )}
                      Accept
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Accept Offer</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to accept this offer for {studentName}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => acceptOffer(offer.id)}>
                        Accept
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isRejectPending}>
                      {isRejectPending ? (
                        <Loader2 className="size-4 animate-spin mr-1.5" />
                      ) : (
                        <XCircle className="size-4 mr-1.5" />
                      )}
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Offer</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject this offer for {studentName}? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => rejectOffer(offer.id)}
                      >
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </>
        )}
        {offer.status === "accepted" &&
          offer.payments.length > 0 &&
          offer.payments[0].paymentStatus === "initiated" &&
          (!isAdmin ? (
            <Alert variant="default" className="p-2 py-1.5 flex items-center gap-3 bg-muted/30">
              <AlertCircle className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <AlertDescription className="text-xs font-medium flex items-center justify-between">
                  <span className="text-muted-foreground">Only admin can confirm payments</span>
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
                <Button>
                  {" "}
                  <CheckSquare className="size-4 mr-1.5" />
                  Confirm Payment
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to confirm the payment of ₹{offer.payments[0].amount} for{" "}
                    {studentName}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const referenceNumber = `txn_mock_${Math.random().toString(36).substring(2, 12)}`;
                      confirmPayment({
                        id: offer.payments[0].id,
                        payload: {
                          referenceNumber,
                          notes: "Payment processed via 1-click simulated checkout",
                        },
                      });
                    }}
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
        {offer.status === "accepted" &&
          offer.payments.length > 0 &&
          offer.payments[0].paymentStatus === "completed" && (
            <Button
              disabled
              variant="outline"
              className="!opacity-100 bg-success/10 text-success border-success/20"
            >
              <CheckCircle2 className="size-4 mr-1.5" />
              Enrolled
            </Button>
          )}
      </div>
    </div>
  );
}
