import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Info,
  Tag,
  CheckSquare,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";
import { OfferDetail } from "../hook/query/use-get-offer-detail";
import { Badge } from "@/components/ui-kit";
import { getReadableDate } from "@/lib/utils";

export function OfferMainContent({ offer }: { offer: OfferDetail }) {
  return (
    <div className="flex-1 bg-background h-full overflow-y-auto">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b border-border rounded-none h-12 bg-transparent p-0 px-4">
          <TabsTrigger
            value="overview"
            className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4"
          >
            <Info className="size-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger
            value="scholarships"
            className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4"
          >
            <Tag className="size-4 mr-2" /> Scholarships{" "}
            <span className="ml-1.5 text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {offer.scholarships?.length || 0}
            </span>
          </TabsTrigger>
          {/* <TabsTrigger
            value="conditions"
            className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4"
          >
            <CheckSquare className="size-4 mr-2" /> Conditions{" "}
            <span className="ml-1.5 text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {offer.conditions?.length || 0}
            </span>
          </TabsTrigger> */}
        </TabsList>

        <div className="p-6">
          <TabsContent value="overview" className="mt-0 outline-none space-y-6">
            <div className="">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Clock className="size-5" /> Timeline
              </h3>
              <div className="relative border-l border-muted-foreground/30 ml-3 space-y-6">
                <TimelineItem
                  title="Offer Created"
                  date={getReadableDate(offer.createdAt)}
                  active={!!offer.createdAt}
                />
                <TimelineItem
                  title="Offer Released"
                  date={offer.releasedAt ? getReadableDate(offer.releasedAt) : "Pending"}
                  active={!!offer.releasedAt}
                />
                <TimelineItem
                  title={offer.status === "rejected" ? "Offer Rejected" : "Offer Accepted"}
                  date={offer.acceptedAt ? getReadableDate(offer.acceptedAt) : "Pending"}
                  active={!!offer.acceptedAt || offer.status === "rejected"}
                  isError={offer.status === "rejected"}
                />
                <TimelineItem
                  title="Payment Status"
                  date={
                    offer.payments?.[0]?.paymentStatus === "completed" ? "Completed" : "Pending"
                  }
                  active={offer.payments?.[0]?.paymentStatus === "completed"}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scholarships" className="mt-0 outline-none">
            {offer.scholarships && offer.scholarships.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {offer.scholarships.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-semibold capitalize text-base flex items-center gap-1.5">
                          <Award className="size-4 text-muted-foreground" />
                          {s.scholarshipType.replace(/_/g, " ")}
                        </div>
                        <div className="text-lg font-bold mt-1">₹{s.amountValue}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          tone={
                            s.approvalStatus === "approved"
                              ? "success"
                              : s.approvalStatus === "rejected"
                                ? "danger"
                                : "warning"
                          }
                          className="capitalize text-xs"
                        >
                          {s.approvalStatus}
                        </Badge>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="size-3" /> {getReadableDate(s.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm flex-1 mt-auto bg-muted/30 p-3 rounded-md">
                      <div className="flex flex-col flex-1">
                        <span className="text-muted-foreground text-xs mb-1">Reason</span>
                        <span className="font-medium">{s.criteriaMet?.reason || "N/A"}</span>
                      </div>
                      {s.rejectionReason && (
                        <div className="flex flex-col flex-1 text-destructive border-l border-destructive/20 pl-4">
                          <span className="font-semibold text-xs mb-1">Rejection Reason</span>
                          <span>{s.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-6 text-center border rounded-lg bg-muted/10">
                No scholarships have been attached to this offer.
              </div>
            )}
          </TabsContent>

          <TabsContent value="conditions" className="mt-0 outline-none">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckSquare className="size-4 text-muted-foreground" /> Offer Conditions
                </h3>
                <Badge tone={offer.conditionsFulfilled ? "success" : "warning"} className="w-fit">
                  {offer.conditionsFulfilled ? "All Conditions Met" : "Pending Conditions"}
                </Badge>
              </div>

              <div className="p-0">
                {offer.conditions && offer.conditions.length > 0 ? (
                  <div className="divide-y">
                    {offer.conditions.map((condition, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 hover:bg-muted/10 transition-colors"
                      >
                        <div className="mt-0.5 shrink-0">
                          {offer.conditionsFulfilled ? (
                            <CheckCircle2 className="size-4 text-success" />
                          ) : (
                            <CircleDashed className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-sm font-medium">{condition}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-6 text-center">
                    This offer has no specific conditions attached.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function TimelineItem({
  title,
  date,
  active,
  isError,
}: {
  title: string;
  date: string;
  active: boolean;
  isError?: boolean;
}) {
  return (
    <div className="relative pl-6 pb-2">
      <div
        className={`absolute -left-[5px] top-1 size-[9px] rounded-full ring-4 ring-background ${
          isError ? "bg-destructive" : active ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      />
      <div
        className={`font-medium text-sm ${!active ? "text-muted-foreground" : isError ? "text-destructive" : ""}`}
      >
        {title}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{date}</div>
    </div>
  );
}
