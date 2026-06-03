import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

export function EndNode({ selected }: NodeProps) {
  return (
    <div
      className={`w-16 h-16 rounded-full bg-card shadow-elev-1 border-2 flex items-center justify-center transition-all ${
        selected ? "border-primary" : "border-muted-foreground/30"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-muted-foreground !border-muted-foreground !w-3 !h-3"
      />
      <span className="text-xs font-semibold text-muted-foreground">End</span>
    </div>
  );
}
