import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../ui/sheet";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import type { AutomationNodeData } from "../../../types/automation-types";

interface Props {
  open: boolean;
  data: AutomationNodeData | null;
  onClose: () => void;
  onSave: (patch: Partial<AutomationNodeData>) => void;
}

export function WaitPanel({ open, data, onClose, onSave }: Props) {
  const [duration, setDuration] = useState(1);
  const [unit, setUnit] = useState<"minutes" | "hours" | "days">("days");

  useEffect(() => {
    if (data) {
      setDuration(data.waitDuration ?? 1);
      setUnit(data.waitUnit ?? "days");
    }
  }, [data]);

  function handleSave() {
    onSave({
      waitDuration: duration,
      waitUnit: unit,
      description: `Wait for ${duration} ${unit}`,
    });
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Configure Wait</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            The automation will pause for{" "}
            <strong>
              {duration} {unit}
            </strong>{" "}
            before continuing to the next step.
          </p>
        </div>
        <div className="absolute bottom-6 left-6 right-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
