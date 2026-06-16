import { useNavigate } from "@tanstack/react-router";
import { Settings, Users } from "lucide-react";
import { Card } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";

interface OpenSettingsContentProps {
  onOpenChange: (value: boolean) => void;
}

export function OpenSettingsContent({ onOpenChange }: OpenSettingsContentProps) {
  const navigate = useNavigate();

  const handleOpenSettings = () => {
    onOpenChange(false);
    navigate({ to: "/settings" });
  };

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-[16px] font-semibold">Users & Roles</h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Open the full settings page to manage ERP role mappings and the user management tabs
              in one place.
            </p>
            <div className="mt-4">
              <Button onClick={handleOpenSettings}>
                <Settings className="size-4" />
                Open Full Settings
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
