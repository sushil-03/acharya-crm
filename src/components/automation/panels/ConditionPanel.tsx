import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../ui/sheet";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import type { AutomationNodeData } from "../../../types/automation-types";

const FIELDS = [
  "Lead Source",
  "Lead Stage",
  "Assigned To",
  "Program",
  "Campus",
  "Application Stage",
  "Admission Decision",
  "Intent Score",
  "Country",
];

const OPERATORS = ["is", "is not", "contains", "does not contain", "is defined", "is not defined"];

interface Props {
  open: boolean;
  data: AutomationNodeData | null;
  onClose: () => void;
  onSave: (patch: Partial<AutomationNodeData>) => void;
}

export function ConditionPanel({ open, data, onClose, onSave }: Props) {
  const [field, setField] = useState("");
  const [op, setOp] = useState("is");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (data) {
      setField(data.conditionField ?? "");
      setOp(data.conditionOp ?? "is");
      setValue(data.conditionValue ?? "");
    }
  }, [data]);

  const noValueOps = ["is defined", "is not defined"];

  function handleSave() {
    onSave({
      conditionField: field,
      conditionOp: op,
      conditionValue: noValueOps.includes(op) ? undefined : value,
      description: noValueOps.includes(op) ? `${field} ${op}` : `${field} ${op} ${value}`,
    });
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Configure If / Else</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Condition Field</Label>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {FIELDS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Operator</Label>
            <Select value={op} onValueChange={setOp}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPERATORS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!noValueOps.includes(op) && (
            <div className="space-y-1.5">
              <Label>Value</Label>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
              />
            </div>
          )}
        </div>
        <div className="absolute bottom-6 left-6 right-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={!field}>
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
