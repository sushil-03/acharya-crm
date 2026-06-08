import { Handle, Position } from "@xyflow/react";
import { Zap } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import type { AutomationNodeData } from "../../../types/automation-types";

export function TriggerNode({ data, selected }: NodeProps) {
  const d = (data || {}) as AutomationNodeData;
  const isEmpty = !d.triggerActName;

  return (
    <div
      className={`w-60 rounded-xl bg-card shadow-elev-2 border-2 transition-all ${
        selected ? "border-primary" : isEmpty ? "border-dashed border-border" : "border-border"
      }`}
    >
      <div className="px-4 pt-3 pb-2">
        {isEmpty ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
            <Zap className="size-4" />
            <span className="text-sm font-medium">+ Add your Trigger</span>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 size-6 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                <Zap className="size-3.5 text-success" />
              </div>
              <div>
                <div className="font-semibold text-sm leading-tight">{d.label}</div>
                {d.description && (
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                    {d.description}
                  </div>
                )}
                {d.triggerCategory && (
                  <div className="text-[11px] text-muted-foreground/60 mt-1">
                    {d.triggerCategory}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="h-1.5 rounded-b-xl bg-success" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-success !border-success !w-3 !h-3"
      />
    </div>
  );
}
