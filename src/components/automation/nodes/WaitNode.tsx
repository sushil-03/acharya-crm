import { Handle, Position } from "@xyflow/react";
import { Clock } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import type { AutomationNodeData } from "../../../types/automation-types";

export function WaitNode({ data, selected }: NodeProps) {
  const d = data as AutomationNodeData;

  return (
    <div
      className={`w-60 rounded-xl bg-card shadow-elev-2 border transition-all ${
        selected ? "border-primary" : "border-border"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-warning !border-warning !w-3 !h-3"
      />
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 size-6 rounded-full bg-warning/15 flex items-center justify-center shrink-0">
            <Clock className="size-3.5 text-warning" />
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">Wait</div>
            {d.waitDuration != null && d.waitUnit ? (
              <div className="text-xs text-muted-foreground mt-0.5">
                Wait for {d.waitDuration} {d.waitUnit}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground mt-0.5">Configure wait duration</div>
            )}
          </div>
        </div>
      </div>
      <div className="h-1.5 rounded-b-xl bg-warning" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-warning !border-warning !w-3 !h-3"
      />
    </div>
  );
}
