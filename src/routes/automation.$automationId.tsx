import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Connection,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Home, Pencil, Undo2, Redo2, X, Save, Zap, BarChart2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { TriggerNode } from "../components/automation/nodes/TriggerNode";
import { ConditionNode } from "../components/automation/nodes/ConditionNode";
import { WaitNode } from "../components/automation/nodes/WaitNode";
import { ActionNode } from "../components/automation/nodes/ActionNode";
import { EndNode } from "../components/automation/nodes/EndNode";
import { AddButtonNode } from "../components/automation/nodes/AddButtonNode";
import { TriggerSelectModal } from "../components/automation/TriggerSelectModal";
import { ConditionPanel } from "../components/automation/panels/ConditionPanel";
import { WaitPanel } from "../components/automation/panels/WaitPanel";
import { ActionPanel } from "../components/automation/panels/ActionPanel";
import { getAutomation, saveAutomation, createBlankAutomation } from "../store/automation-store";
import type { AutomationFlow, AutomationNodeData } from "../types/automation-types";
import type { Node, Edge } from "@xyflow/react";

export const Route = createFileRoute("/automation/$automationId")({
  component: AutomationBuilder,
});

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  wait: WaitNode,
  action: ActionNode,
  end: EndNode,
  "add-button": AddButtonNode,
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AutomationBuilder() {
  const { automationId } = Route.useParams();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<AutomationFlow | null>(null);
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<AutomationNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // panel state
  const [triggerModalOpen, setTriggerModalOpen] = useState(false);
  const [conditionPanelOpen, setConditionPanelOpen] = useState(false);
  const [waitPanelOpen, setWaitPanelOpen] = useState(false);
  const [actionPanelOpen, setActionPanelOpen] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const activeNodeData = activeNodeId
    ? (nodes.find((n) => n.id === activeNodeId)?.data ?? null)
    : null;

  // load — create a blank flow if not found (handles race conditions on first nav)
  useEffect(() => {
    let f = getAutomation(automationId);
    if (!f) {
      f = { ...createBlankAutomation(), id: automationId };
      saveAutomation(f);
    }
    setFlow(f);
    setName(f.name);
    setNodes(f.nodes as Node<AutomationNodeData>[]);
    setEdges(f.edges);
  }, [automationId]);

  // debounced auto-save
  function triggerSave(updatedNodes: Node<AutomationNodeData>[], updatedEdges: Edge[]) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!flow) return;
      const updated: AutomationFlow = {
        ...flow,
        name,
        nodes: updatedNodes,
        edges: updatedEdges,
        modifiedOn: new Date().toISOString(),
      };
      saveAutomation(updated);
      setFlow(updated);
    }, 500);
  }

  function handleNodesChange(changes: Parameters<typeof onNodesChange>[0]) {
    onNodesChange(changes);
  }

  function handleEdgesChange(changes: Parameters<typeof onEdgesChange>[0]) {
    onEdgesChange(changes);
  }

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const next = addEdge({ ...params, type: "smoothstep" }, eds);
        triggerSave(nodes, next);
        return next;
      });
    },
    [nodes],
  );

  // node click
  const onNodeClick: NodeMouseHandler = useCallback((_evt, node) => {
    const d = node.data as AutomationNodeData;
    setActiveNodeId(node.id);
    if (d.kind === "trigger") setTriggerModalOpen(true);
    else if (d.kind === "condition") setConditionPanelOpen(true);
    else if (d.kind === "wait") setWaitPanelOpen(true);
    else if (d.kind === "action") setActionPanelOpen(true);
  }, []);

  function patchNode(id: string, patch: Partial<AutomationNodeData>) {
    setNodes((nds) => {
      const next = nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
      ) as Node<AutomationNodeData>[];
      triggerSave(next, edges);
      return next;
    });
  }

  // add node below a source node
  function addNodeBelow(type: "condition" | "wait" | "action" | "end", sourceNodeId: string) {
    const sourceNode = nodes.find((n) => n.id === sourceNodeId);
    if (!sourceNode) return;

    const newId = `${type}-${makeId()}`;
    const newY = sourceNode.position.y + 160;
    const newX = sourceNode.position.x;

    const kindMap = { condition: "condition", wait: "wait", action: "action", end: "end" } as const;
    const labelMap = { condition: "If/Else", wait: "Wait", action: "Action", end: "End" } as const;

    const newNode: Node<AutomationNodeData> = {
      id: newId,
      type,
      position: { x: newX, y: newY },
      data: { kind: kindMap[type], label: labelMap[type] },
    };

    const newEdge: Edge = {
      id: `${sourceNodeId}-${newId}`,
      source: sourceNodeId,
      target: newId,
      type: "smoothstep",
    };

    setNodes((nds) => {
      const next = [...nds, newNode] as Node<AutomationNodeData>[];
      triggerSave(next, [...edges, newEdge]);
      return next;
    });
    setEdges((eds) => [...eds, newEdge]);

    // open config panel
    setActiveNodeId(newId);
    if (type === "condition") setConditionPanelOpen(true);
    else if (type === "wait") setWaitPanelOpen(true);
    else if (type === "action") setActionPanelOpen(true);
  }

  function handleSave() {
    if (!flow) return;
    const updated: AutomationFlow = {
      ...flow,
      name,
      nodes,
      edges,
      modifiedOn: new Date().toISOString(),
    };
    saveAutomation(updated);
    setFlow(updated);
  }

  function handlePublish() {
    if (!flow) return;
    const updated: AutomationFlow = {
      ...flow,
      name,
      nodes,
      edges,
      status: flow.status === "published" ? "draft" : "published",
      lastPublishedOn: flow.status === "draft" ? new Date().toISOString() : flow.lastPublishedOn,
      modifiedOn: new Date().toISOString(),
    };
    saveAutomation(updated);
    setFlow(updated);
  }

  // inject onAdd into add-button nodes
  const displayNodes = nodes.map((n) => {
    if (n.type === "add-button") {
      return {
        ...n,
        data: {
          ...n.data,
          onAdd: addNodeBelow,
          sourceNodeId: (n.data as AutomationNodeData & { sourceNodeId: string }).sourceNodeId,
        },
      };
    }
    return n;
  }) as Node<AutomationNodeData>[];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* top bar */}
      <header className="h-14 shrink-0 border-b border-border bg-card flex items-center px-4 gap-3 z-10">
        <button
          onClick={() => navigate({ to: "/automation" })}
          className="size-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Home className="size-4 text-muted-foreground" />
        </button>
        <div className="w-px h-5 bg-border" />
        <div className="flex items-center gap-2">
          <div
            className={`size-2 rounded-full ${flow?.status === "published" ? "bg-success" : "bg-muted-foreground/40"}`}
          />
          {editingName ? (
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
              className="h-7 text-sm w-64"
            />
          ) : (
            <span className="text-sm font-medium text-foreground">
              {name || "Loading…"}{" "}
              <span className="text-muted-foreground font-normal">
                ({flow?.status === "published" ? "Published" : "Draft"})
              </span>
            </span>
          )}
          <button
            onClick={() => setEditingName(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="size-3.5" />
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="size-8" title="Reports">
            <BarChart2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" title="Undo">
            <Undo2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" title="Redo">
            <Redo2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => navigate({ to: "/automation" })}
          >
            <X className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} className="gap-1.5">
            <Save className="size-3.5" /> Save
          </Button>
          {flow?.status === "published" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handlePublish}
              className="gap-1.5 border-warning text-warning hover:bg-warning/10"
            >
              Unpublish
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handlePublish}
              className="gap-1.5 bg-success hover:bg-success/90 text-white"
            >
              <Zap className="size-3.5" /> Publish
            </Button>
          )}
        </div>
      </header>

      {/* canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={displayNodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          defaultEdgeOptions={{ type: "smoothstep", animated: flow?.status === "draft" }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-40" />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable className="!bg-card !border-border" />

          {/* "Your Automation starts here" label */}
          {nodes.length <= 1 && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none text-xs text-muted-foreground font-medium">
              Your Automation starts here
            </div>
          )}
        </ReactFlow>
      </div>

      {/* modals & panels */}
      <TriggerSelectModal
        open={triggerModalOpen}
        onClose={() => setTriggerModalOpen(false)}
        onSelect={(category, actName, displayName, description) => {
          if (activeNodeId) {
            patchNode(activeNodeId, {
              label: displayName,
              description,
              triggerCategory: category,
              triggerActName: actName,
            });
            // update flow triggerType
            if (flow) {
              const updated = { ...flow, triggerType: displayName };
              saveAutomation(updated);
              setFlow(updated);
            }
          }
        }}
      />
      <ConditionPanel
        open={conditionPanelOpen}
        data={activeNodeData}
        onClose={() => setConditionPanelOpen(false)}
        onSave={(patch) => activeNodeId && patchNode(activeNodeId, patch)}
      />
      <WaitPanel
        open={waitPanelOpen}
        data={activeNodeData}
        onClose={() => setWaitPanelOpen(false)}
        onSave={(patch) => activeNodeId && patchNode(activeNodeId, patch)}
      />
      <ActionPanel
        open={actionPanelOpen}
        data={activeNodeData}
        onClose={() => setActionPanelOpen(false)}
        onSave={(patch) => activeNodeId && patchNode(activeNodeId, patch)}
      />
    </div>
  );
}
