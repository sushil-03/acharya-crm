import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
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

export function AddableEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  sourceHandleId,
  data,
}: EdgeProps) {
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

  if (
    sourceX === undefined ||
    sourceY === undefined ||
    targetX === undefined ||
    targetY === undefined ||
    sourcePosition === undefined ||
    targetPosition === undefined ||
    isNaN(sourceX) ||
    isNaN(sourceY) ||
    isNaN(targetX) ||
    isNaN(targetY)
  ) {
    return <path id={id} d="" />;
  }

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  if (id.startsWith("__add-edge__") || target.startsWith("__add-btn__")) {
    return (
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
    );
  }

  const onAddBetween = data?.onAddBetween as (
    type: "condition" | "wait" | "action",
    subType?: string,
    source?: string,
    target?: string,
    edgeId?: string,
    sourceHandle?: string
  ) => void;

  function pick(type: "condition" | "wait" | "action", subType?: string) {
    if (onAddBetween) {
      onAddBetween(type, subType, source, target, id, sourceHandleId || undefined);
    }
    setOpen(false);
  }

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${sourceX}px,${sourceY + 25}px)`,
            pointerEvents: "all",
          }}
          className={`nodrag nopan nowheel ${open ? "z-50" : "z-30"}`}
        >
          <button
            onClick={() => setOpen((v) => !v)}
            className="size-6 rounded-full bg-card border-2 border-primary/50 hover:border-primary hover:bg-primary/10 flex items-center justify-center shadow-elev-1 transition-all cursor-pointer"
          >
            <Plus className="size-3.5 text-primary" />
          </button>

          {open && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-popover border border-border rounded-xl shadow-elev-3 w-72 max-h-[26rem] overflow-y-auto">
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
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
