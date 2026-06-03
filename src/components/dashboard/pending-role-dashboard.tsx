import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui-kit";
import { LogOut, Loader2, Clock } from "lucide-react";
import { useLogout } from "@/components/auth/hook/query/use-logout";
import { useUserStore } from "@/store/use-user-store";
import { capitalizeWords } from "@/lib/utils";

export function PendingRoleDashboard() {
  const { logout, isPending } = useLogout();
  const { user } = useUserStore();

  const roleName = user?.role || "This";

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="max-w-md w-full p-8 flex flex-col items-center text-center shadow-sm">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <Clock className="size-8 text-muted-foreground" />
        </div>

        <h2 className="text-xl font-semibold mb-2 text-foreground">
          {capitalizeWords(roleName)} role is under progress
        </h2>

        <p className="text-muted-foreground text-sm mb-8">
          Please check back later or contact your administrator.
        </p>

        <button
          className="flex items-center justify-center gap-2 w-full h-10 rounded-md border border-border bg-background hover:bg-muted text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => logout()}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
          Sign Out
        </button>
      </Card>
    </div>
  );
}
