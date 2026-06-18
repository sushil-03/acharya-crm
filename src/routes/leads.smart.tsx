import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { SmartViewContainer } from "@/components/leads/smart-view";

export const Route = createFileRoute("/leads/smart")({
  component: SmartLeadsPage,
  head: () => ({ meta: [{ title: "Smart Leads — Acharya One" }] }),
});

function SmartLeadsPage() {
  return (
    <AppShell noPadding className="h-screen overflow-hidden">
      <SmartViewContainer />
    </AppShell>
  );
}
