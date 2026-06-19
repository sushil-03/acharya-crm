import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import type { CrmRole, NavSubMenuWithRoles } from "@/types/nav";

interface AssignRolesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submenu: NavSubMenuWithRoles | null;
  allRoles: CrmRole[];
  onSubmit: (roleIds: number[]) => Promise<void>;
  isPending: boolean;
}

export function AssignRolesModal({
  open, onOpenChange, submenu, allRoles, onSubmit, isPending,
}: AssignRolesModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open && submenu) {
      const current = new Set((submenu.roleAssignments ?? []).map((ra) => ra.role.roleId));
      setSelectedIds(current);
    }
  }, [open, submenu]);

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    await onSubmit(Array.from(selectedIds));
    onOpenChange(false);
  };

  const activeRoles = allRoles.filter((r) => r.isActive);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Assign Roles</DialogTitle>
          <DialogDescription>
            Select which roles can see <span className="font-medium">"{submenu?.name}"</span>.
            This replaces the full set.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-72 overflow-y-auto space-y-1 py-2 pr-1">
          {activeRoles.map((role) => {
            const checked = selectedIds.has(role.roleId);
            return (
              <label
                key={role.roleId}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors select-none",
                  checked ? "bg-primary/8" : "hover:bg-muted/50",
                )}
                onClick={() => toggle(role.roleId)}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggle(role.roleId)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="flex-1 text-[13px] font-mono">{role.roleName}</span>
                {role.isSystem && (
                  <Badge tone="muted" className="text-[10px]">System</Badge>
                )}
              </label>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground">
          {selectedIds.size} role{selectedIds.size !== 1 ? "s" : ""} selected
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isPending}>Save Assignments</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
