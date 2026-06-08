import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
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
import { Home, Pencil, Undo2, Redo2, X, Save, Zap, BarChart2, Wand2 } from "lucide-react";
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
import { AddableEdge } from "../components/automation/edges/AddableEdge";

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

const edgeTypes = {
  "addable-edge": AddableEdge,
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
    setName(f.name || "Untitled Automation");
    setNodes((f.nodes || []) as Node<AutomationNodeData>[]);
    setEdges(f.edges || []);
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
    // Virtual add-button nodes are not in state; ignore any changes targeting them
    onNodesChange((changes || []).filter((c) => !("id" in c && (c.id as string).startsWith("__add-btn__"))));
  }

  function handleEdgesChange(changes: Parameters<typeof onEdgesChange>[0]) {
    onEdgesChange((changes || []).filter((c) => !("id" in c && (c.id as string).startsWith("__add-edge__"))));
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

  // node click — ignore virtual add-button nodes (they handle clicks internally)
  const onNodeClick: NodeMouseHandler = useCallback((_evt, node) => {
    if (node.id.startsWith("__add-btn__")) return;
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
  const addNodeBelow = useCallback(
    (
      type: "condition" | "wait" | "action" | "end",
      sourceNodeId: string,
      subType?: string,
      sourceHandle?: string,
    ) => {
      const safeNodes = nodes || [];
      const sourceNode = safeNodes.find((n) => n.id === sourceNodeId);
      if (!sourceNode) return;

      const newId = `${type}-${makeId()}`;
      const newY = (sourceNode.position?.y ?? 0) + 160;
      const newX = sourceNode.position?.x ?? 0;

      const subtypeLabelMap: Record<string, string> = {
        compare: "Compare",
        "if-lead-exists": "If Lead Exists",
        "if-else": "If/Else",
        "multi-if-else": "Multi If/Else",
        messaging: "Messaging",
        "lead-actions": "Lead Actions",
        "sales-execution": "Sales Execution",
        custom: "Custom",
        "online-ads": "Online Ads",
        "online-meeting": "Online Meeting",
        "sub-automation": "Sub-Automation",
      };
      const defaultLabelMap = { condition: "If/Else", wait: "Wait", action: "Action", end: "End" } as const;
      const label = (subType && subtypeLabelMap[subType]) || defaultLabelMap[type];

      const newNode: Node<AutomationNodeData> = {
        id: newId,
        type,
        position: { x: newX, y: newY },
        data: {
          kind: type,
          label,
          ...(subType && type === "condition" ? { conditionSubType: subType } : {}),
          ...(subType && type === "action" ? { actionType: subType } : {}),
        },
      };

      const newEdge: Edge = {
        id: `${sourceNodeId}-${newId}${sourceHandle ? `-${sourceHandle}` : ""}`,
        source: sourceNodeId,
        ...(sourceHandle ? { sourceHandle } : {}),
        target: newId,
        type: "smoothstep",
      };

      // Add-buttons are virtual (derived at render time from leaf nodes), so no cleanup needed.
      const nextNodes = [...nodes, newNode] as Node<AutomationNodeData>[];
      const nextEdges = [...edges, newEdge];

      setNodes(nextNodes);
      setEdges(nextEdges);
      triggerSave(nextNodes, nextEdges);

      // open config panel
      setActiveNodeId(newId);
      if (type === "condition") setConditionPanelOpen(true);
      else if (type === "wait") setWaitPanelOpen(true);
      else if (type === "action") setActionPanelOpen(true);
    },
    [nodes, edges],
  );

  // add node between source and target
  const addNodeBetween = useCallback(
    (
      type: "condition" | "wait" | "action",
      subType?: string,
      sourceId?: string,
      targetId?: string,
      edgeId?: string,
      sourceHandle?: string,
    ) => {
      if (!sourceId || !targetId) return;
      const safeNodes = nodes || [];
      const sourceNode = safeNodes.find((n) => n.id === sourceId);
      if (!sourceNode) return;

      const newId = `${type}-${makeId()}`;
      const newY = (sourceNode.position?.y ?? 0) + 160;
      const newX = sourceNode.position?.x ?? 0;

      const subtypeLabelMap: Record<string, string> = {
        compare: "Compare",
        "if-lead-exists": "If Lead Exists",
        "if-else": "If/Else",
        "multi-if-else": "Multi If/Else",
        messaging: "Messaging",
        "lead-actions": "Lead Actions",
        "sales-execution": "Sales Execution",
        custom: "Custom",
        "online-ads": "Online Ads",
        "online-meeting": "Online Meeting",
        "sub-automation": "Sub-Automation",
      };
      const defaultLabelMap = { condition: "If/Else", wait: "Wait", action: "Action" } as const;
      const label = (subType && subtypeLabelMap[subType]) || defaultLabelMap[type];

      const newNode: Node<AutomationNodeData> = {
        id: newId,
        type,
        position: { x: newX, y: newY },
        data: {
          kind: type,
          label,
          ...(subType && type === "condition" ? { conditionSubType: subType } : {}),
          ...(subType && type === "action" ? { actionType: subType } : {}),
        },
      };

      // Create edge 1: A -> C (with A's sourceHandle if it existed)
      const edge1: Edge = {
        id: `${sourceId}-${newId}${sourceHandle ? `-${sourceHandle}` : ""}`,
        source: sourceId,
        ...(sourceHandle ? { sourceHandle } : {}),
        target: newId,
        type: "smoothstep",
      };

      // Create edge 2: C -> B (if C is condition, connect Yes branch to B)
      const edge2: Edge = {
        id: `${newId}-${targetId}${type === "condition" ? "-yes" : ""}`,
        source: newId,
        ...(type === "condition" ? { sourceHandle: "yes", label: "Yes" } : {}),
        target: targetId,
        type: "smoothstep",
      };

      // Shift all nodes situated below sourceNode down by 160px
      const nextNodes = nodes.map((n) => {
        if (n.id === sourceId) return n;
        if (n.position.y > sourceNode.position.y) {
          return {
            ...n,
            position: { ...n.position, y: n.position.y + 160 },
          };
        }
        return n;
      });

      // Filter out the original edge between sourceId and targetId
      const nextEdges = edges
        .filter(
          (e) =>
            e.id !== edgeId &&
            !(e.source === sourceId && e.target === targetId && e.sourceHandle === sourceHandle),
        )
        .concat(edge1, edge2);

      const finalNodes = [...nextNodes, newNode];

      setNodes(finalNodes);
      setEdges(nextEdges);
      triggerSave(finalNodes, nextEdges);

      // open config panel
      setActiveNodeId(newId);
      if (type === "condition") setConditionPanelOpen(true);
      else if (type === "wait") setWaitPanelOpen(true);
      else if (type === "action") setActionPanelOpen(true);
    },
    [nodes, edges],
  );

  function autoFormatLayout() {
    // Find the trigger node
    const triggerNode = nodes.find((n) => n.type === "trigger");
    if (!triggerNode) return;

    // Build adjacency list of outgoing edges: source -> array of { target, handle }
    const adj: Record<string, { target: string; handle?: string }[]> = {};
    for (const edge of edges) {
      if (!adj[edge.source]) adj[edge.source] = [];
      adj[edge.source].push({ target: edge.target, handle: edge.sourceHandle ?? undefined });
    }

    // Compute levels (Y coordinates) using BFS/longest path
    const level: Record<string, number> = {};
    const path: Record<string, string> = {};

    level[triggerNode.id] = 0;
    path[triggerNode.id] = "";

    const queue: string[] = [triggerNode.id];
    const visited = new Set<string>([triggerNode.id]);

    while (queue.length > 0) {
      const u = queue.shift()!;
      const children = adj[u] ?? [];

      const sortedChildren = [...children].sort((a, b) => {
        if (a.handle === "yes") return -1;
        if (b.handle === "yes") return 1;
        if (a.handle === "no") return 1;
        if (b.handle === "no") return -1;
        return 0;
      });

      for (const child of sortedChildren) {
        const v = child.target;
        const uLevel = level[u];
        const uPath = path[u];

        const nextLevel = uLevel + 1;
        if (level[v] === undefined || nextLevel > level[v]) {
          level[v] = nextLevel;
        }

        if (path[v] === undefined) {
          if (child.handle === "yes") {
            path[v] = uPath + "L";
          } else if (child.handle === "no") {
            path[v] = uPath + "R";
          } else {
            path[v] = uPath;
          }
        }

        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
        }
      }
    }

    for (const n of nodes) {
      if (level[n.id] === undefined) {
        level[n.id] = 0;
        path[n.id] = "";
      }
    }

    const INITIAL_OFFSET = 300;
    const MIN_OFFSET = 165;
    const DECAY_FACTOR = 0.75;

    const formattedNodes = nodes.map((n) => {
      const nodePath = path[n.id];
      let nodeX = 250;
      let currentOffset = INITIAL_OFFSET;
      for (const char of nodePath) {
        if (char === "L") {
          nodeX -= currentOffset;
        } else if (char === "R") {
          nodeX += currentOffset;
        }
        currentOffset = Math.max(MIN_OFFSET, currentOffset * DECAY_FACTOR);
      }

      if (n.type === "end") {
        const parents = edges.filter((e) => e.target === n.id).map((e) => e.source);
        if (parents.length > 0) {
          let sumX = 0;
          let count = 0;
          for (const parentId of parents) {
            const parentPath = path[parentId] || "";
            let pX = 250;
            let offset = INITIAL_OFFSET;
            for (const char of parentPath) {
              if (char === "L") pX -= offset;
              else if (char === "R") pX += offset;
              offset = Math.max(MIN_OFFSET, offset * DECAY_FACTOR);
            }
            sumX += pX;
            count++;
          }
          nodeX = sumX / count;
        }
      }

      const nodeY = level[n.id] * 160;

      return {
        ...n,
        position: { x: nodeX, y: nodeY },
      };
    });

    setNodes(formattedNodes);
    triggerSave(formattedNodes, edges);
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

  // Dynamically inject virtual add-button nodes for leaf handles.
  // Condition nodes have two handles (yes/no) so we check each independently.
  // All other nodes have a single default handle.
  const { virtualAddBtns, displayEdges } = useMemo(() => {
    const safeNodes = nodes || [];
    const safeEdges = edges || [];
    const nodeIds = new Set(safeNodes.map((n) => n.id));
    const validEdges = safeEdges.filter((e) => e && nodeIds.has(e.source) && nodeIds.has(e.target));

    const nodesWithOutgoingEdge = new Set(validEdges.map((e) => e.source));
    const yesConnected = new Set(validEdges.filter((e) => e.sourceHandle === "yes").map((e) => e.source));
    const noConnected = new Set(validEdges.filter((e) => e.sourceHandle === "no").map((e) => e.source));

    const virtualAddBtns: Node<AutomationNodeData>[] = [];
    const virtualAddBtnEdges: Edge[] = [];

    for (const n of safeNodes) {
      if (n.type === "end") continue;

      const nX = n.position && !isNaN(n.position.x) ? n.position.x : 0;
      const nY = n.position && !isNaN(n.position.y) ? n.position.y : 0;

      if (n.type === "condition") {
        // Yes branch — green, centered under yes handle (30% of 240px = 72px, minus half button 14px = 58px)
        if (!yesConnected.has(n.id)) {
          const btnId = `__add-btn__${n.id}__yes`;
          virtualAddBtns.push({
            id: btnId,
            type: "add-button",
            position: { x: nX + 58, y: nY + 160 },
            width: 28,
            height: 28,
            measured: { width: 28, height: 28 },
            draggable: false,
            selectable: false,
            data: { kind: "trigger" as const, label: "Add", onAdd: addNodeBelow, sourceNodeId: n.id, sourceHandle: "yes", branchType: "yes" },
          });
          virtualAddBtnEdges.push({ id: `__add-edge__${n.id}__yes`, source: n.id, sourceHandle: "yes", target: btnId, type: "smoothstep" });
        }
        // No branch — red, centered under no handle (70% of 240px = 168px, minus half button 14px = 154px)
        if (!noConnected.has(n.id)) {
          const btnId = `__add-btn__${n.id}__no`;
          virtualAddBtns.push({
            id: btnId,
            type: "add-button",
            position: { x: nX + 154, y: nY + 160 },
            width: 28,
            height: 28,
            measured: { width: 28, height: 28 },
            draggable: false,
            selectable: false,
            data: { kind: "trigger" as const, label: "Add", onAdd: addNodeBelow, sourceNodeId: n.id, sourceHandle: "no", branchType: "no" },
          });
          virtualAddBtnEdges.push({ id: `__add-edge__${n.id}__no`, source: n.id, sourceHandle: "no", target: btnId, type: "smoothstep" });
        }
      } else if (!nodesWithOutgoingEdge.has(n.id)) {
        // If it's a trigger node and it has no trigger selected yet, do not show the + button below it
        if (n.type === "trigger" && !n.data.triggerActName) {
          continue;
        }

        // Single-handle leaf node — centered below (240px node, 28px button → offset 106px)
        const btnId = `__add-btn__${n.id}`;
        virtualAddBtns.push({
          id: btnId,
          type: "add-button",
          position: { x: nX + 106, y: nY + 160 },
          width: 28,
          height: 28,
          measured: { width: 28, height: 28 },
          draggable: false,
          selectable: false,
          data: { kind: "trigger" as const, label: "Add", onAdd: addNodeBelow, sourceNodeId: n.id },
        });
        virtualAddBtnEdges.push({ id: `__add-edge__${n.id}`, source: n.id, target: btnId, type: "smoothstep" });
      }
    }

    const displayEdges = [
      ...validEdges.map((e) => ({
        ...e,
        type: "addable-edge",
        animated: flow?.status === "draft",
        data: {
          onAddBetween: addNodeBetween,
        },
      })),
      ...virtualAddBtnEdges.map((e) => ({
        ...e,
        type: "addable-edge",
        animated: flow?.status === "draft",
      })),
    ];

    return { virtualAddBtns, displayEdges };
  }, [nodes, edges, flow, addNodeBelow, addNodeBetween]);

  const displayNodes = nodes as Node<AutomationNodeData>[];

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
          <Button variant="outline" size="sm" onClick={autoFormatLayout} className="gap-1.5">
            <Wand2 className="size-3.5" /> Auto Format
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
          nodes={[...displayNodes, ...virtualAddBtns]}
          edges={displayEdges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          defaultEdgeOptions={{ type: "addable-edge", animated: flow?.status === "draft" }}
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
            const updatedNodes = nodes.map((n) =>
              n.id === activeNodeId
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      label: displayName,
                      description,
                      triggerCategory: category,
                      triggerActName: actName,
                    },
                  }
                : n,
            ) as Node<AutomationNodeData>[];

            setNodes(updatedNodes);

            if (flow) {
              const updatedFlow = {
                ...flow,
                triggerType: displayName,
                nodes: updatedNodes,
                modifiedOn: new Date().toISOString(),
              };
              saveAutomation(updatedFlow);
              setFlow(updatedFlow);
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
