import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui-kit";
import { useCreatePayment } from "@/components/payment/hook/mutation/use-create-payment";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle, CheckSquare, FileText, Loader2, XCircle, Zap, ShieldCheck } from "lucide-react";
import { getReadableDate } from "@/lib/utils";
import { useAcceptOffer, useRejectOffer } from "@/components/offer/hook/mutation/use-update-offer";
import { StudentDetailResponse } from "@/components/user/hook/query/use-get-student-detail";

interface StudentActionCenterProps {
  student: StudentDetailResponse;
}

export function StudentActionCenter({ student }: StudentActionCenterProps) {
  const queryClient = useQueryClient();
  const { mutate: acceptOffer, isPending: isAcceptPending } = useAcceptOffer();
  const { mutate: rejectOffer, isPending: isRejectPending } = useRejectOffer();
  const { mutate: createPayment, isPending: isCreatePaymentPending } = useCreatePayment();

  const pendingPayment = student.payments?.find(
    (p) => p.paymentType !== "application_fee" && p.paymentStatus !== "completed" && !p.gatewayOrderId,
  );
  const pendingApplicationFee = student.payments?.find(
    (p) => p.paymentType === "application_fee" && p.paymentStatus !== "completed" && !p.gatewayOrderId,
  );
  const offer = student.offers?.[0];

  if (pendingApplicationFee) {
    return (
      <div className="grid lg:grid-cols-2 gap-8 items-start py-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex items-center justify-center bg-card rounded-xl border border-border p-8 min-h-[300px]">
           <div className="w-full max-w-sm mx-auto font-sans flex flex-col items-center py-4">
             <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full mb-6 flex items-center border border-blue-100 font-medium">
               <Zap className="size-3.5 mr-1.5 text-blue-500 fill-blue-500" />
               Application Fee Payment
             </div>
             
             <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
               Total Amount
             </p>
             <div className="flex items-baseline gap-1 mb-8">
               <span className="text-3xl font-bold text-slate-900">₹</span>
               <span className="text-5xl font-bold text-slate-900 tracking-tight">{pendingApplicationFee.amount}</span>
             </div>

             <button 
                onClick={() => createPayment({ id: pendingApplicationFee.id })}
                disabled={isCreatePaymentPending}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-14 flex items-center justify-center font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70 text-lg relative overflow-hidden group"
             >
                {isCreatePaymentPending ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10 flex items-center">
                      Process Payment
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out rounded-xl"></div>
                  </>
                )}
             </button>

             <div className="mt-6 flex items-center justify-center text-slate-400">
               <ShieldCheck className="size-4 mr-1.5" />
               <span className="text-[13px] font-medium">Secured Payment Environment</span>
             </div>
           </div>
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-4">
          <h3 className="font-semibold text-foreground border-b border-border/50 pb-3">
            Application Fee
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Status</span>
              <Badge
                tone="warning"
                className="uppercase font-bold tracking-wider text-[10px] px-2 h-5 rounded"
              >
                Pending
              </Badge>
            </div>
            <div className="flex justify-between items-center py-3 bg-muted/50 rounded-lg px-4 mt-4 border border-border/50">
              <span className="text-muted-foreground font-medium">Fee Payable</span>
              <span className="font-bold text-foreground text-lg">
                ₹{pendingApplicationFee.amount}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="py-6">
        <div className="max-w-md mx-auto bg-card rounded-xl shadow-sm border border-border p-8 text-center space-y-5 animate-in fade-in duration-500">
          <div className="mx-auto size-12 bg-muted text-muted-foreground rounded-lg flex items-center justify-center mb-2">
            <Activity className="size-5" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground">Application Under Review</h2>
            <p className="text-sm text-muted-foreground">
              We are currently reviewing your application. You will be notified once an offer is
              released.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (offer.status === "released") {
    return (
      <div className="py-6">
        <div className="max-w-md mx-auto bg-card rounded-xl shadow-sm border border-border p-8 text-center space-y-5 animate-in fade-in duration-500">
          <div className="mx-auto size-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-2">
            <FileText className="size-5" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground">You have an Offer!</h2>
            <p className="text-sm text-muted-foreground">
              Congratulations! An offer has been released for you. Please review and accept it.
            </p>
          </div>
          <div className="bg-background rounded-lg p-4 border border-border mt-4 text-left space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Status</span>
              <Badge
                tone="primary"
                className="uppercase font-bold tracking-wider text-[10px] px-2 h-5 rounded"
              >
                {offer.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground font-medium">Net Fee Payable</span>
              <span className="font-bold text-foreground text-base">₹{offer.netFeePayable}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 shadow-sm"
              disabled={isAcceptPending}
              onClick={() => {
                acceptOffer(offer.id, {
                  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-detail"] }),
                });
              }}
            >
              {isAcceptPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <CheckSquare className="size-4 mr-2" />
              )}
              Accept Offer
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-destructive hover:bg-destructive/10"
              disabled={isRejectPending}
              onClick={() => {
                rejectOffer(offer.id, {
                  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-detail"] }),
                });
              }}
            >
              {isRejectPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <XCircle className="size-4 mr-2" />
              )}
              Reject
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (offer.status === "accepted" && pendingPayment) {
    return (
      <div className="grid lg:grid-cols-2 gap-8 items-start py-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex items-center justify-center bg-card rounded-xl border border-border p-8 min-h-[300px]">
           <div className="w-full max-w-sm mx-auto font-sans flex flex-col items-center py-4">
             <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full mb-6 flex items-center border border-blue-100 font-medium">
               <Zap className="size-3.5 mr-1.5 text-blue-500 fill-blue-500" />
               Registration Fee Payment
             </div>
             
             <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
               Total Amount
             </p>
             <div className="flex items-baseline gap-1 mb-8">
               <span className="text-3xl font-bold text-slate-900">₹</span>
               <span className="text-5xl font-bold text-slate-900 tracking-tight">{pendingPayment.amount}</span>
             </div>

             <button 
                onClick={() => createPayment({ id: pendingPayment.id })}
                disabled={isCreatePaymentPending}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-14 flex items-center justify-center font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70 text-lg relative overflow-hidden group"
             >
                {isCreatePaymentPending ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10 flex items-center">
                      Process Payment
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out rounded-xl"></div>
                  </>
                )}
             </button>

             <div className="mt-6 flex items-center justify-center text-slate-400">
               <ShieldCheck className="size-4 mr-1.5" />
               <span className="text-[13px] font-medium">Secured Payment Environment</span>
             </div>
           </div>
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-4">
          <h3 className="font-semibold text-foreground border-b border-border/50 pb-3">
            Offer Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Status</span>
              <Badge
                tone="success"
                className="uppercase font-bold tracking-wider text-[10px] px-2 h-5 rounded"
              >
                {offer.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Date Issued</span>
              <span className="font-medium text-foreground">
                {getReadableDate(offer.createdAt)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 bg-muted/50 rounded-lg px-4 mt-4 border border-border/50">
              <span className="text-muted-foreground font-medium">Net Fee Payable</span>
              <span className="font-bold text-foreground text-lg">₹{offer.netFeePayable}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (offer.status === "accepted" && !pendingPayment) {
    return (
      <div className="py-6">
        <div className="max-w-md mx-auto bg-card rounded-xl shadow-sm border border-border p-8 text-center space-y-5 animate-in fade-in duration-500">
          <div className="mx-auto size-12 bg-success/10 text-success rounded-lg flex items-center justify-center mb-2">
            <CheckCircle className="size-5" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground">Enrollment Secured!</h2>
            <p className="text-sm text-muted-foreground">
              Your payment has been successfully processed. We are thrilled to welcome you to
              Acharya One.
            </p>
          </div>
          {student.enrollments?.[0] && (
            <div className="bg-background rounded-lg p-4 border border-border mt-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                Student ID
              </span>
              <p className="text-xl font-mono font-bold text-foreground mt-1">
                {student.enrollments[0].studentIdGenerated}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-md mx-auto bg-card rounded-xl shadow-sm border border-border p-8 text-center space-y-5 animate-in fade-in duration-500">
        <div className="mx-auto size-12 bg-muted text-muted-foreground rounded-lg flex items-center justify-center mb-2">
          <XCircle className="size-5" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-foreground">Offer {offer.status}</h2>
          <p className="text-sm text-muted-foreground">
            Your offer status is currently {offer.status}.
          </p>
        </div>
      </div>
    </div>
  );
}
