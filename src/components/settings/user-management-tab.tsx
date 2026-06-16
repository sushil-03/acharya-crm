import { Card } from "@/components/ui-kit";
import { Users } from "lucide-react";

export function UserManagementTab() {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="grid size-11 place-items-center rounded-2xl bg-muted">
          <Users className="size-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-display text-[16px] font-semibold">User Management</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            This tab is ready for the next user-facing settings work. Role management is wired in
            the first tab, and this section can hold user assignment, membership, and permissions
            next.
          </p>
        </div>
      </div>
    </Card>
  );
}
