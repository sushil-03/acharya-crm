import { Info, Mail, Phone, Calendar, IndianRupee, Tag, CheckSquare } from "lucide-react";
import { OfferDetail } from "../hook/query/use-get-offer-detail";
import { getReadableDate } from "@/lib/utils";

interface OfferSidebarProps {
  offer: OfferDetail;
}

export function OfferSidebar({ offer }: OfferSidebarProps) {
  const formattedReleasedAt = offer.releasedAt ? getReadableDate(offer.releasedAt) : "N/A";
  const formattedValidityDate = offer.validityDate ? getReadableDate(offer.validityDate) : "N/A";
  const formattedAcceptedAt = offer.acceptedAt ? getReadableDate(offer.acceptedAt) : "N/A";

  return (
    <div className="w-[300px] shrink-0 border-r border-border bg-background overflow-y-auto h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between h-12 shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Info className="size-3.5" />
          Offer Details
        </div>
      </div>
      <div className="flex-1">
        <div className="p-3 space-y-4 text-sm">
          <SectionHeader icon={<Info className="size-3.5" />} title="Student Info" />
          <DetailRow
            icon={<Mail className="size-3.5 text-muted-foreground" />}
            label="Email"
            value={offer.student.email || "N/A"}
          />
          <DetailRow
            icon={<Phone className="size-3.5 text-muted-foreground" />}
            label="Phone"
            value={offer.student.mobile || "N/A"}
          />
        </div>

        <div className="p-3 border-t border-border space-y-4 text-sm">
          <SectionHeader icon={<IndianRupee className="size-3.5" />} title="Financial Summary" />
          <DetailRow
            icon={<Tag className="size-3.5 text-muted-foreground" />}
            label="Total Fee"
            value={`₹${offer.totalFee}`}
            valueClass="font-semibold text-foreground"
          />
          <DetailRow
            icon={<Tag className="size-3.5 text-muted-foreground" />}
            label="Scholarship"
            value={`₹${offer.scholarshipAmount || "0"}`}
            valueClass="text-success"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-border">
            <span className="text-[13px] font-medium text-muted-foreground">Net Fee Payable</span>
            <span className="text-[15px] font-bold text-foreground">₹{offer.netFeePayable}</span>
          </div>
        </div>

        <div className="p-3 border-t border-border space-y-4 text-sm">
          <SectionHeader icon={<Calendar className="size-3.5" />} title="Timeline" />
          <DetailRow
            icon={<Calendar className="size-3.5 text-muted-foreground" />}
            label="Created"
            value={getReadableDate(offer.createdAt)}
          />
          <DetailRow
            icon={<Calendar className="size-3.5 text-muted-foreground" />}
            label="Released"
            value={formattedReleasedAt}
          />
          <DetailRow
            icon={<Calendar className="size-3.5 text-muted-foreground" />}
            label="Valid Until"
            value={formattedValidityDate}
            valueClass={offer.status === "expired" ? "text-destructive font-medium" : ""}
          />
          {offer.acceptedAt && (
            <DetailRow
              icon={<CheckSquare className="size-3.5 text-success" />}
              label="Accepted"
              value={formattedAcceptedAt}
              valueClass="text-success font-medium"
            />
          )}
          {offer.payments && offer.payments.length > 0 && (
            <DetailRow
              icon={<IndianRupee className="size-3.5 text-muted-foreground" />}
              label="Payment"
              value={offer.payments[0].paymentStatus === "completed" ? "Completed" : "Pending"}
              valueClass={
                offer.payments[0].paymentStatus === "completed"
                  ? "text-success font-medium"
                  : "text-warning font-medium"
              }
            />
          )}
        </div>

        {offer.conditions && offer.conditions.length > 0 && (
          <div className="p-3 border-t border-border space-y-4 text-sm">
            <SectionHeader icon={<CheckSquare className="size-3.5" />} title="Conditions" />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[12px] mb-2">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={
                    offer.conditionsFulfilled
                      ? "text-success font-medium"
                      : "text-warning font-medium"
                  }
                >
                  {offer.conditionsFulfilled ? "Fulfilled" : "Pending"}
                </span>
              </div>
              <ul className="list-disc pl-4 text-[13px] text-muted-foreground space-y-1">
                {offer.conditions.map((condition, idx) => (
                  <li key={idx}>{condition}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, valueClass }: any) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground text-[13px]">
        {icon}
        <span>{label}</span>
      </div>
      <div
        className={`text-[13px] text-foreground flex items-center min-w-0 break-words ${valueClass || ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: any) {
  return (
    <div className="flex items-center gap-2 text-[13px] font-semibold">
      {icon}
      <span>{title}</span>
    </div>
  );
}
