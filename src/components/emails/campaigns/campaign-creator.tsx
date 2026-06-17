import React, { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { useCampaignCreationStore } from "@/store/use-campaign-creation-store";
import { CampaignStepper } from "./campaign-stepper";
import { CampaignStep1 } from "./campaign-step1";
import { CampaignStep2Compose } from "./campaign-step2-compose";

export function CampaignCreator() {
  const { step, reset, setStep } = useCampaignCreationStore();

  useEffect(() => {
    reset();
    setStep(1);
  }, []);

  return (
    <AppShell className="h-screen overflow-hidden" noPadding>
      <CampaignStepper />
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {step === 1 && <CampaignStep1 />}
        {step === 2 && <CampaignStep2Compose />}
      </div>
    </AppShell>
  );
}
