import { createFileRoute } from "@tanstack/react-router";
import { SettingsContent } from "@/components/settings";

export const Route = createFileRoute("/settings")({
  component: SettingsContent,
});
