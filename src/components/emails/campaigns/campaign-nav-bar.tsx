import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCampaignCreationStore } from "@/store/use-campaign-creation-store";
import { cn } from "@/lib/utils";

interface CampaignNavBarProps {
  statusText?: string;
  onNext?: () => void;
  canNext?: boolean;
  nextLabel?: string;
}

export function CampaignNavBar({
  statusText,
  onNext,
  canNext = true,
  nextLabel = "Next Step",
}: CampaignNavBarProps) {
  const { step, setStep } = useCampaignCreationStore();

  const isFirstStep = step <= 1;
  const nextEnabled = !!onNext && canNext;

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="shrink-0 border-t border-border bg-background px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {!isFirstStep && (
          <Button variant="outline" size="sm" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="size-3.5 mr-1.5" /> Back
          </Button>
        )}
        {statusText && (
          <span className={cn("text-xs truncate", nextEnabled ? "text-foreground font-medium" : "text-muted-foreground")}>
            {statusText}
          </span>
        )}
      </div>

      <Button
        onClick={onNext}
        disabled={!nextEnabled}
        className="shrink-0 bg-primary hover:bg-primary/90 text-white gap-1.5"
      >
        {nextLabel} <ArrowRight className="size-3.5" />
      </Button>
    </div>
  );
}
