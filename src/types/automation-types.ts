import type { Node, Edge } from "@xyflow/react";

export type NodeKind = "trigger" | "condition" | "wait" | "action" | "end";

export interface AutomationNodeData extends Record<string, unknown> {
  kind: NodeKind;
  label: string;
  description?: string;
  // trigger
  triggerCategory?: string;
  triggerActName?: string;
  // condition
  conditionSubType?: string;
  conditionField?: string;
  conditionOp?: string;
  conditionValue?: string;
  // wait
  waitDuration?: number;
  waitUnit?: "minutes" | "hours" | "days";
  // action
  actionType?: string;
  actionConfig?: Record<string, string>;
}

export interface AutomationFlow {
  id: string;
  name: string;
  status: "draft" | "published";
  triggerType: string;
  triggerCount: number;
  lastPublishedOn: string | null;
  modifiedOn: string;
  modifiedBy: string;
  nodes: Node<AutomationNodeData>[];
  edges: Edge[];
}
