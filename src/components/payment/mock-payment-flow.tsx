import React, { useState } from "react";
import { useConfirmPayment } from "@/components/payment/hook/mutation/use-confirm-payment";
import { Loader2, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

interface MockPaymentFlowProps {
  paymentId: string;
  amount: string;
  onComplete?: () => void;
  onCancel?: () => void; // kept for compatibility but not rendered here
}

export const MockPaymentFlow: React.FC<MockPaymentFlowProps> = ({
  paymentId,
  amount,
  onComplete,
}) => {
  const { mutate: confirmPayment, isPending } = useConfirmPayment();
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = () => {
    const referenceNumber = `txn_mock_${Math.random().toString(36).substring(2, 12)}`;

    confirmPayment(
      {
        id: paymentId,
        payload: {
          referenceNumber,
          notes: "Payment processed via 1-click simulated checkout",
        },
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            onComplete?.();
          }, 1500);
        },
      },
    );
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in-95 duration-500 w-full max-w-sm mx-auto text-center">
        <div className="size-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-1">Payment Successful</h3>
        <p className="text-slate-500 text-sm">The registration fee has been collected.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-white font-sans flex flex-col items-center py-4">
      
      <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full mb-6 flex items-center border border-blue-100 font-medium">
        <Zap className="size-3.5 mr-1.5 text-blue-500 fill-blue-500" />
        1-Click Demo Checkout
      </div>

      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
        Total Amount
      </p>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-3xl font-bold text-slate-900">₹</span>
        <span className="text-5xl font-bold text-slate-900 tracking-tight">{amount}</span>
      </div>

      <button
        onClick={handlePayment}
        disabled={isPending}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-14 flex items-center justify-center font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70 text-lg relative overflow-hidden group"
      >
        {isPending ? (
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
        <span className="text-[13px] font-medium">Secured Mock Environment</span>
      </div>
    </div>
  );
};
