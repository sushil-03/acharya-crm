import {
  Search,
  Filter,
  Calendar,
  LayoutGrid,
  Download,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateInteractionModal } from "./create-interaction-modal";
import { format } from "date-fns";
import { LeadDetail } from "@/types/lead";

export function LeadInteraction({ lead }: { lead: LeadDetail }) {
  const interactions = lead.interactions || [];

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "call":
        return <Phone className="size-3.5 text-muted-foreground" />;
      case "email":
        return <Mail className="size-3.5 text-muted-foreground" />;
      case "whatsapp":
      case "sms":
        return <MessageSquare className="size-3.5 text-muted-foreground" />;
      case "visit":
        return <MapPin className="size-3.5 text-muted-foreground" />;
      default:
        return <MessageSquare className="size-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold ">Interaction Timeline</h3>
        <CreateInteractionModal lead={lead} />
      </div>

      <div className="pt-1">
        {interactions.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            No interactions found.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />
            <div className="space-y-6">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="relative flex items-start gap-4 group">
                  <div className="size-8 rounded-full border border-border bg-background grid place-items-center shrink-0 z-10 transition-colors group-hover:border-primary/50 ">
                    {getIcon(interaction.interactionType)}
                  </div>
                  <div className="flex-1 mt-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[13px] font-semibold text-foreground capitalize flex items-center gap-1.5">
                        {interaction.interactionType}
                        {interaction.outcome && (
                          <span className="text-muted-foreground font-normal">
                            • {interaction.outcome.replace(/_/g, " ")}
                          </span>
                        )}
                      </h4>
                      <span className="text-[11px] text-muted-foreground">
                        {format(new Date(interaction.createdAt), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    {interaction.notes && (
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        {interaction.notes}
                      </p>
                    )}
                    {(interaction.durationSeconds || interaction.followUpDate) && (
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {interaction.interactionType === "call" && interaction.durationSeconds && (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                            <Clock className="size-3.5" />
                            Duration: {interaction.durationSeconds}s
                          </div>
                        )}
                        {interaction.followUpDate && (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            <Calendar className="size-3.5" />
                            Follow up: {format(new Date(interaction.followUpDate), "MMM d, yyyy")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-muted-foreground">
          Showing {interactions.length} activities
        </div>
      </div>
    </div>
  );
}
