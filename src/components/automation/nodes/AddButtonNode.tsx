import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Plus, GitMerge, Clock, Play } from "lucide-react";
import { useState } from "react";
import type { NodeProps } from "@xyflow/react";

interface AddButtonData extends Record<string, unknown> {
  onAdd: (type: "condition" | "wait" | "action" | "end", sourceNodeId: string) => void;
  sourceNodeId: string;
}

export function AddButtonNode({ data }: NodeProps) {
  const d = data as AddButtonData;
  const [open, setOpen] = useState(false);

  const options = [
    {
      type: "condition" as const,
      label: "If / Else Condition",
      icon: GitMerge,
      color: "text-danger",
    },
    { type: "wait" as const, label: "Wait", icon: Clock, color: "text-warning" },
    { type: "action" as const, label: "Add Action", icon: Play, color: "text-info" },
    { type: "end" as const, label: "End Automation", icon: Plus, color: "text-muted-foreground" },
  ];

  return (
    <div className="relative flex flex-col items-center" style={{ pointerEvents: "all" }}>
      <Handle type="target" position={Position.Top} className="!opacity-0 !w-1 !h-1" />
      <button
        onClick={() => setOpen((v) => !v)}
        className="size-7 rounded-full bg-card border-2 border-primary/50 hover:border-primary hover:bg-primary/10 flex items-center justify-center shadow-elev-1 transition-all"
      >
        <Plus className="size-3.5 text-primary" />
      </button>

      {open && (
        <div className="absolute top-9 z-50 bg-popover border border-border rounded-xl shadow-elev-3 p-1.5 w-52">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type}
                onClick={() => {
                  d.onAdd(opt.type, d.sourceNodeId);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-muted/60 transition-colors text-left"
              >
                <Icon className={`size-4 ${opt.color}`} />
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!opacity-0 !w-1 !h-1" />
    </div>
  );
}
