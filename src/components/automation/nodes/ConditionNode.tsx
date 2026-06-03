import { Handle, Position } from "@xyflow/react";
import { GitMerge } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import type { AutomationNodeData } from "../../../types/automation-types";

export function ConditionNode({ data, selected }: NodeProps) {
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
        className="!bg-danger !border-danger !w-3 !h-3"
      />
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 size-6 rounded-full bg-danger/15 flex items-center justify-center shrink-0">
            <GitMerge className="size-3.5 text-danger" />
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">If/Else</div>
            {d.description && (
              <div className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                {d.description}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-1.5 rounded-b-xl bg-danger" />
      {/* Yes handle — left */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: "30%" }}
        className="!bg-success !border-success !w-3 !h-3"
      />
      {/* No handle — right */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: "70%" }}
        className="!bg-danger !border-danger !w-3 !h-3"
      />
      {/* yes/no labels */}
      <div className="absolute -bottom-5 left-0 right-0 flex justify-around pointer-events-none text-[10px] font-semibold">
        <span className="text-success ml-2">Yes</span>
        <span className="text-danger mr-2">No</span>
      </div>
    </div>
  );
}
