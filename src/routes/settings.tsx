import { createFileRoute, redirect } from "@tanstack/react-router";
import { SettingsContent } from "@/components/settings";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export const Route = createFileRoute("/settings")({
  beforeLoad: () => {
    const { decodedToken } = getAuthenticatedUser();
    const role = decodedToken?.role;
    if (role === "counsellor" || role === "councellor") {
      throw redirect({
        to: "/chat-settings",
      });
    }
  },
  component: SettingsContent,
});
