import { Handle, Position } from "@xyflow/react";
import {
  Play,
  Mail,
  MessageSquare,
  Phone,
  UserCheck,
  ClipboardList,
  FileText,
  Send,
  Webhook,
  Zap,
} from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import type { AutomationNodeData } from "../../../types/automation-types";

const ACTION_ICONS: Record<string, React.ElementType> = {
  "Send Email": Mail,
  "Send SMS": Phone,
  "Send WhatsApp": MessageSquare,
  "Assign Lead": UserCheck,
  "Update Lead": Zap,
  "Assign Task": ClipboardList,
  "Log Activity": FileText,
  "Send Document Request": Send,
  "Push to ERP": Webhook,
  Webhook: Webhook,
};

export function ActionNode({ data, selected }: NodeProps) {
  const d = data as AutomationNodeData;
  const Icon = (d.actionType && ACTION_ICONS[d.actionType]) || Play;

  return (
    <div
      className={`w-60 rounded-xl bg-card shadow-elev-2 border transition-all ${
        selected ? "border-primary" : "border-border"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-info !border-info !w-3 !h-3" />
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 size-6 rounded-full bg-info/15 flex items-center justify-center shrink-0">
            <Icon className="size-3.5 text-info" />
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">
              {d.label || d.actionType || "Action"}
            </div>
            {d.description && (
              <div className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                {d.description}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-1.5 rounded-b-xl bg-info" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-info !border-info !w-3 !h-3"
      />
    </div>
  );
}
