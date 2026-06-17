import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useCampaignCreationStore } from "@/store/use-campaign-creation-store";

export const CAMPAIGN_STEPS = [
  { id: 1, label: "Select Message Template" },
  { id: 2, label: "Compose Message" },
  { id: 3, label: "Select Recipients & Tags" },
  { id: 4, label: "Review Campaign" },
  { id: 5, label: "Schedule Campaign" },
];

export function CampaignStepper() {
  const { step, setStep } = useCampaignCreationStore();

  const goToStep = (targetStep: number) => {
    if (targetStep >= step) return;
    setStep(targetStep);
  };

  return (
    <div className="flex shrink-0 border-b border-border bg-background overflow-hidden">
      {CAMPAIGN_STEPS.map((s, i) => {
        const isDone = s.id < step;
        const isActive = s.id === step;
        const isFirst = i === 0;
        const isLast = i === CAMPAIGN_STEPS.length - 1;

        return (
          <div
            key={s.id}
            role={isDone ? "button" : undefined}
            tabIndex={isDone ? 0 : undefined}
            onClick={() => isDone && goToStep(s.id)}
            onKeyDown={(e) => isDone && e.key === "Enter" && goToStep(s.id)}
            className={cn(
              "flex-1 relative flex flex-col justify-center py-2.5 px-5 select-none transition-colors",
              !isFirst && "pl-9",
              isFirst && "pl-5",
              isActive
                ? "bg-primary text-white"
                : isDone
                  ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 active:bg-primary/30"
                  : "bg-muted/50 text-muted-foreground cursor-default",
            )}
            style={{
              clipPath: isFirst
                ? isLast
                  ? undefined
                  : "polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)"
                : isLast
                  ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 16px 50%)"
                  : "polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)",
              marginLeft: isFirst ? 0 : -16,
            }}
          >
            <div className="flex items-center gap-1 mb-0.5">
              {isDone && <Check className="size-2.5 shrink-0" />}
              <span className={cn("text-[10px] font-semibold uppercase tracking-widest", isActive ? "opacity-80" : "opacity-60")}>
                Step {String(s.id).padStart(2, "0")}
              </span>
            </div>
            <p className={cn("text-xs font-semibold leading-tight truncate", !isActive && !isDone && "opacity-50")}>
              {s.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
