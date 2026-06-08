import { Handle, Position } from "@xyflow/react";
import {
  Plus,
  Scale,
  Search,
  GitBranch,
  Network,
  MessageSquare,
  Users,
  TrendingUp,
  Settings,
  Megaphone,
  Video,
  Send,
  Clock,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NodeProps } from "@xyflow/react";

interface AddButtonData extends Record<string, unknown> {
  onAdd: (
    type: "condition" | "wait" | "action" | "end",
    sourceNodeId: string,
    subType?: string,
    sourceHandle?: string,
  ) => void;
  sourceNodeId: string;
  sourceHandle?: string;
  branchType?: "yes" | "no";
}

const CONDITIONS = [
  { subType: "compare", label: "Compare", icon: Scale },
  { subType: "if-lead-exists", label: "If Lead Exists", icon: Search },
  { subType: "if-else", label: "If/Else", icon: GitBranch },
  { subType: "multi-if-else", label: "Multi If/Else", icon: Network },
];

const ACTIONS = [
  { subType: "messaging", label: "Messaging", icon: MessageSquare },
  { subType: "lead-actions", label: "Lead Actions", icon: Users },
  { subType: "sales-execution", label: "Sales Execution", icon: TrendingUp },
  { subType: "custom", label: "Custom", icon: Settings },
  { subType: "online-ads", label: "Online Ads", icon: Megaphone },
  { subType: "online-meeting", label: "Online Meeting", icon: Video },
];

export function AddButtonNode({ data }: NodeProps) {
  const d = (data || {}) as AddButtonData;
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function pick(type: "condition" | "wait" | "action", subType?: string) {
    if (d && typeof d.onAdd === "function") {
      d.onAdd(type, d.sourceNodeId, subType, d.sourceHandle);
    }
    setOpen(false);
  }

  const isYes = d?.branchType === "yes";
  const isNo = d?.branchType === "no";
  const btnBorderClass = isYes
    ? "border-success/60 hover:border-success hover:bg-success/10"
    : isNo
      ? "border-danger/60 hover:border-danger hover:bg-danger/10"
      : "border-primary/50 hover:border-primary hover:bg-primary/10";
  const iconClass = isYes ? "text-success" : isNo ? "text-danger" : "text-primary";

  return (
    <div ref={menuRef} className={`relative flex flex-col items-center nowheel ${open ? "z-50" : "z-30"}`} style={{ pointerEvents: "all" }}>
      <Handle type="target" position={Position.Top} className="!opacity-0 !w-1 !h-1" />

      <button
        onClick={() => setOpen((v) => !v)}
        className={`size-7 rounded-full bg-card border-2 flex items-center justify-center shadow-elev-1 transition-all ${btnBorderClass}`}
      >
        <Plus className={`size-3.5 ${iconClass}`} />
      </button>

      {open && (
        <div className="absolute top-9 left-1/2 -translate-x-1/2 z-50 bg-popover border border-border rounded-xl shadow-elev-3 w-72 max-h-[26rem] overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-border sticky top-0 bg-popover">
            <span className="font-semibold text-sm text-foreground">Choose Condition or Action</span>
          </div>

          {/* Conditions */}
          <div className="p-1.5">
            <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">Conditions</div>
            {CONDITIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.subType}
                  onClick={() => pick("condition", opt.subType)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/60 transition-colors text-left"
                >
                  <Icon className="size-4 text-muted-foreground shrink-0" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="p-1.5 border-t border-border">
            <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">Actions</div>
            {ACTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.subType}
                  onClick={() => pick("action", opt.subType)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/60 transition-colors text-left"
                >
                  <Icon className="size-4 text-muted-foreground shrink-0" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Wait */}
          <div className="p-1.5 border-t border-border">
            <button
              onClick={() => pick("wait")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/60 transition-colors text-left"
            >
              <Clock className="size-4 text-muted-foreground shrink-0" />
              <span>Wait / Delay</span>
            </button>
          </div>

          {/* Sub-Automation */}
          <div className="p-1.5 border-t border-border">
            <button
              onClick={() => pick("action", "sub-automation")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/60 transition-colors text-left"
            >
              <Send className="size-4 text-muted-foreground shrink-0" />
              <span>Send to Sub-Automation</span>
            </button>
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!opacity-0 !w-1 !h-1" />
    </div>
  );
}
