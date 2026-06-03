import { LOCAL_STORAGE_KEY } from "@/lib/config";
import type { AutomationFlow, AutomationNodeData } from "../types/automation-types";
import type { Node, Edge } from "@xyflow/react";

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function now() {
  return new Date().toISOString();
}

// ─── mock seed data ────────────────────────────────────────────────────────────

function makeTriggerNode(
  id: string,
  label: string,
  description: string,
  triggerCategory: string,
  triggerActName: string,
  x = 0,
  y = 0,
): Node<AutomationNodeData> {
  return {
    id,
    type: "trigger",
    position: { x, y },
    data: { kind: "trigger", label, description, triggerCategory, triggerActName },
  };
}

function makeConditionNode(
  id: string,
  field: string,
  op: string,
  value: string,
  x = 0,
  y = 0,
): Node<AutomationNodeData> {
  return {
    id,
    type: "condition",
    position: { x, y },
    data: {
      kind: "condition",
      label: "If/Else",
      description: `${field} ${op} ${value}`,
      conditionField: field,
      conditionOp: op,
      conditionValue: value,
    },
  };
}

function makeWaitNode(
  id: string,
  duration: number,
  unit: "minutes" | "hours" | "days",
  x = 0,
  y = 0,
): Node<AutomationNodeData> {
  return {
    id,
    type: "wait",
    position: { x, y },
    data: {
      kind: "wait",
      label: "Wait",
      description: `Wait for ${duration} ${unit}`,
      waitDuration: duration,
      waitUnit: unit,
    },
  };
}

function makeActionNode(
  id: string,
  actionType: string,
  description: string,
  x = 0,
  y = 0,
): Node<AutomationNodeData> {
  return {
    id,
    type: "action",
    position: { x, y },
    data: { kind: "action", label: actionType, description, actionType },
  };
}

function makeEndNode(id: string, x = 0, y = 0): Node<AutomationNodeData> {
  return { id, type: "end", position: { x, y }, data: { kind: "end", label: "End" } };
}

function edge(source: string, target: string, label?: string, sourceHandle?: string): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    ...(label ? { label } : {}),
    ...(sourceHandle ? { sourceHandle } : {}),
    type: "smoothstep",
    animated: false,
  };
}

const MOCK_AUTOMATIONS: AutomationFlow[] = [
  {
    id: "auto-001",
    name: "New Lead Auto-Assign & Welcome",
    status: "published",
    triggerType: "Lead Created",
    triggerCount: 237334,
    lastPublishedOn: "2025-04-30T00:00:00.000Z",
    modifiedOn: "2026-05-18T00:00:00.000Z",
    modifiedBy: "Admin",
    nodes: [
      makeTriggerNode(
        "t1",
        "New Lead",
        "When a new Lead is created or added",
        "Lead",
        "Lead Created",
        250,
        0,
      ),
      makeConditionNode("c1", "Lead Source", "is", "Facebook", 100, 160),
      makeActionNode("a1", "Assign Lead", "Assign to Digital Team", 0, 320),
      makeActionNode("a2", "Send WhatsApp", "Welcome message via WhatsApp", 0, 460),
      makeActionNode("a3", "Assign Lead", "Assign round-robin", 220, 320),
      makeActionNode("a4", "Send SMS", "Welcome SMS to lead", 220, 460),
      makeEndNode("e1", 110, 590),
    ],
    edges: [
      edge("t1", "c1"),
      edge("c1", "a1", "Yes", "yes"),
      edge("c1", "a3", "No", "no"),
      edge("a1", "a2"),
      edge("a3", "a4"),
      edge("a2", "e1"),
      edge("a4", "e1"),
    ],
  },
  {
    id: "auto-002",
    name: "Application Follow-up",
    status: "published",
    triggerType: "On Opportunity Added",
    triggerCount: 82222,
    lastPublishedOn: "2026-04-18T00:00:00.000Z",
    modifiedOn: "2026-05-18T00:00:00.000Z",
    modifiedBy: "Admin",
    nodes: [
      makeTriggerNode(
        "t1",
        "New Opportunity on Lead",
        "When a new opportunity is created",
        "Opportunity",
        "On Opportunity Added",
        200,
        0,
      ),
      makeWaitNode("w1", 1, "days", 200, 160),
      makeActionNode("a1", "Send WhatsApp", "Follow-up on application status", 200, 300),
      makeWaitNode("w2", 2, "days", 200, 440),
      makeConditionNode("c1", "Application Stage", "is", "Submitted", 200, 580),
      makeActionNode("a2", "Send Email", "Application acknowledgement", 50, 740),
      makeActionNode("a3", "Assign Task", "Counsellor: Call within 24 hrs", 350, 740),
      makeEndNode("e1", 200, 880),
    ],
    edges: [
      edge("t1", "w1"),
      edge("w1", "a1"),
      edge("a1", "w2"),
      edge("w2", "c1"),
      edge("c1", "a2", "Yes", "yes"),
      edge("c1", "a3", "No", "no"),
      edge("a2", "e1"),
      edge("a3", "e1"),
    ],
  },
  {
    id: "auto-003",
    name: "Admission Decision Notify + ERP Sync",
    status: "published",
    triggerType: "Lead Updated",
    triggerCount: 13616,
    lastPublishedOn: "2026-04-30T00:00:00.000Z",
    modifiedOn: "2026-04-30T00:00:00.000Z",
    modifiedBy: "System",
    nodes: [
      makeTriggerNode(
        "t1",
        "Lead Update",
        "When a Lead field is updated or changed",
        "Lead",
        "Lead Updated",
        200,
        0,
      ),
      makeConditionNode("c1", "Admission Decision", "is", "Approved", 200, 160),
      makeActionNode("a1", "Send Email", "Send Offer Letter to student", 50, 320),
      makeActionNode("a2", "Push to ERP", "Sync admitted student to college ERP", 50, 460),
      makeActionNode("a3", "Send Email", "Send rejection notification", 350, 320),
      makeActionNode("a4", "Update Lead", "Update stage to Rejected", 350, 460),
      makeEndNode("e1", 200, 600),
    ],
    edges: [
      edge("t1", "c1"),
      edge("c1", "a1", "Yes", "yes"),
      edge("c1", "a3", "No", "no"),
      edge("a1", "a2"),
      edge("a3", "a4"),
      edge("a2", "e1"),
      edge("a4", "e1"),
    ],
  },
  {
    id: "auto-004",
    name: "Document Pending Reminder",
    status: "draft",
    triggerType: "Lead Updated",
    triggerCount: 0,
    lastPublishedOn: null,
    modifiedOn: "2026-05-10T00:00:00.000Z",
    modifiedBy: "Admin",
    nodes: [
      makeTriggerNode(
        "t1",
        "Lead Update",
        "When a Lead field is updated or changed",
        "Lead",
        "Lead Updated",
        200,
        0,
      ),
      makeWaitNode("w1", 2, "days", 200, 160),
      makeActionNode("a1", "Send SMS", "Documents pending reminder", 200, 300),
      makeWaitNode("w2", 3, "days", 200, 440),
      makeActionNode("a2", "Assign Task", "Counsellor: Follow up on documents", 200, 580),
      makeEndNode("e1", 200, 720),
    ],
    edges: [
      edge("t1", "w1"),
      edge("w1", "a1"),
      edge("a1", "w2"),
      edge("w2", "a2"),
      edge("a2", "e1"),
    ],
  },
  {
    id: "auto-005",
    name: "Fee Payment Nudge",
    status: "published",
    triggerType: "On Opportunity Added",
    triggerCount: 4759,
    lastPublishedOn: "2026-02-21T00:00:00.000Z",
    modifiedOn: "2026-02-21T00:00:00.000Z",
    modifiedBy: "Admin",
    nodes: [
      makeTriggerNode(
        "t1",
        "New Opportunity on Lead",
        "When fee is pending for opportunity",
        "Opportunity",
        "On Opportunity Added",
        200,
        0,
      ),
      makeWaitNode("w1", 1, "days", 200, 160),
      makeActionNode("a1", "Send WhatsApp", "Fee payment reminder", 200, 300),
      makeWaitNode("w2", 2, "days", 200, 440),
      makeActionNode("a2", "Send Email", "Fee deadline reminder", 200, 580),
      makeWaitNode("w3", 3, "days", 200, 720),
      makeActionNode("a3", "Assign Task", "Counsellor: Escalate fee follow-up", 200, 860),
      makeEndNode("e1", 200, 1000),
    ],
    edges: [
      edge("t1", "w1"),
      edge("w1", "a1"),
      edge("a1", "w2"),
      edge("w2", "a2"),
      edge("a2", "w3"),
      edge("w3", "a3"),
      edge("a3", "e1"),
    ],
  },
  {
    id: "auto-006",
    name: "Walk-in Registration",
    status: "published",
    triggerType: "On Activity Added",
    triggerCount: 187053,
    lastPublishedOn: "2026-03-19T00:00:00.000Z",
    modifiedOn: "2026-05-14T00:00:00.000Z",
    modifiedBy: "Admin",
    nodes: [
      makeTriggerNode(
        "t1",
        "New Activity on Lead",
        "Walk-in visit activity logged",
        "Activity",
        "On Activity Added",
        200,
        0,
      ),
      makeActionNode("a1", "Update Lead", "Set Lead Source = Walk-in", 200, 160),
      makeActionNode("a2", "Assign Lead", "Assign to front desk counsellor", 200, 300),
      makeActionNode("a3", "Send SMS", "Welcome SMS to walk-in lead", 200, 440),
      makeEndNode("e1", 200, 580),
    ],
    edges: [edge("t1", "a1"), edge("a1", "a2"), edge("a2", "a3"), edge("a3", "e1")],
  },
];

// ─── store API ─────────────────────────────────────────────────────────────────

function load(): AutomationFlow[] {
  try {
    const raw = sessionStorage.getItem(LOCAL_STORAGE_KEY.STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AutomationFlow[];
  } catch {}
  return [];
}

function save(flows: AutomationFlow[]) {
  try {
    sessionStorage.setItem(LOCAL_STORAGE_KEY.STORAGE_KEY, JSON.stringify(flows));
  } catch {}
}

export function getAutomations(): AutomationFlow[] {
  let flows = load();
  if (flows.length === 0) {
    flows = MOCK_AUTOMATIONS;
    save(flows);
  }
  return flows;
}

export function getAutomation(id: string): AutomationFlow | undefined {
  return getAutomations().find((f) => f.id === id);
}

export function saveAutomation(flow: AutomationFlow) {
  const flows = getAutomations();
  const idx = flows.findIndex((f) => f.id === flow.id);
  if (idx >= 0) flows[idx] = flow;
  else flows.unshift(flow);
  save(flows);
}

export function deleteAutomation(id: string) {
  const flows = getAutomations().filter((f) => f.id !== id);
  save(flows);
}

export function createBlankAutomation(name = "Untitled Automation"): AutomationFlow {
  return {
    id: `auto-${makeId()}`,
    name,
    status: "draft",
    triggerType: "",
    triggerCount: 0,
    lastPublishedOn: null,
    modifiedOn: now(),
    modifiedBy: "Admin",
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 0, y: 0 },
        data: { kind: "trigger", label: "+ Add your Trigger" },
      },
    ],
    edges: [],
  };
}

export function cloneAutomation(source: AutomationFlow, name?: string): AutomationFlow {
  return {
    ...source,
    id: `auto-${makeId()}`,
    name: name ?? `${source.name} — Clone`,
    status: "draft",
    triggerCount: 0,
    lastPublishedOn: null,
    modifiedOn: now(),
  };
}

export { MOCK_AUTOMATIONS };
