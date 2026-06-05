/**
 * @file React Flow visualizer for nested template objects
 *  - Shows parent/child edges
 *  - Info icon on each node → detail modal
 *  - Right panel = draggable object palette
 *  - Drag palette item onto a node → adds as child
 *  - Drag node onto another node → reparent
 */
import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  addEdge,
  Panel,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Types, Type } from "./TemplateTypes";
import {
  Card,
  CardHeader,
  Label,
  makeStyles,
  Text,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  flowContainer: {
    width: "100%",
    height: "600px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    background: "#fafafa",
  },
  detailPanel: {
    width: "280px",
    padding: "16px",
    background: "#fff",
    borderLeft: "1px solid #e0e0e0",
    overflowY: "auto" as const,
    height: "600px",
  },
  wrapper: {
    display: "flex",
    gap: "16px",
    marginTop: "16px",
  },
  fieldRow: {
    marginBottom: "8px",
  },
  chip: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "12px",
    background: "#e3f2fd",
    color: "#1565c0",
    fontSize: "12px",
    marginRight: "4px",
    marginBottom: "4px",
  },
  dragHint: {
    fontSize: "12px",
    color: "#666",
    marginTop: "4px",
  },
  paletteItem: {
    padding: "10px 12px",
    marginBottom: "8px",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    background: "#fff",
    cursor: "grab",
    fontSize: "13px",
    transition: "box-shadow 0.15s",
    ":hover": {
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    },
  },
});

/* ------------------------------------------------------------------ */
/*  Palette objects that can be dragged into the flow                 */
/* ------------------------------------------------------------------ */
const PALETTE: Types[] = [
  {
    UniqueID: "palette-text",
    display: true,
    description: "Single line text input",
    type: Type.RequirementObject,
    UPDATED_ON: new Date(),
    sponsoring_customer: "",
    node_type: Type.RequirementObject,
    isDeleted2: false,
    header: "Text Field",
    inputType: "textbox",
    id: -1,
    choices: [],
    hasInput: true,
    prompt: "Enter value",
    children: [],
  },
  {
    UniqueID: "palette-textarea",
    display: true,
    description: "Multi-line text input",
    type: Type.RequirementObject,
    UPDATED_ON: new Date(),
    sponsoring_customer: "",
    node_type: Type.RequirementObject,
    isDeleted2: false,
    header: "Text Area",
    inputType: "textarea",
    id: -2,
    choices: [],
    hasInput: true,
    prompt: "Enter detailed text",
    children: [],
  },
  {
    UniqueID: "palette-select",
    display: true,
    description: "Single select dropdown",
    type: Type.RequirementObject,
    UPDATED_ON: new Date(),
    sponsoring_customer: "",
    node_type: Type.RequirementObject,
    isDeleted2: false,
    header: "Select Dropdown",
    inputType: "select",
    id: -3,
    choices: ["Option A", "Option B", "Option C"],
    hasInput: true,
    prompt: "Select an option",
    children: [],
  },
  {
    UniqueID: "palette-multiselect",
    display: true,
    description: "Multiple selection dropdown",
    type: Type.RequirementObject,
    UPDATED_ON: new Date(),
    sponsoring_customer: "",
    node_type: Type.RequirementObject,
    isDeleted2: false,
    header: "Multi Select",
    inputType: "multiselect",
    id: -4,
    choices: ["Choice 1", "Choice 2", "Choice 3"],
    hasInput: true,
    prompt: "Select multiple options",
    children: [],
  },
  {
    UniqueID: "palette-date",
    display: true,
    description: "Date selection field",
    type: Type.RequirementObject,
    UPDATED_ON: new Date(),
    sponsoring_customer: "",
    node_type: Type.RequirementObject,
    isDeleted2: false,
    header: "Date Picker",
    inputType: "date",
    id: -5,
    choices: [],
    hasInput: true,
    prompt: "Pick a date",
    children: [],
  },
  {
    UniqueID: "palette-number",
    display: true,
    description: "Numeric input field",
    type: Type.RequirementObject,
    UPDATED_ON: new Date(),
    sponsoring_customer: "",
    node_type: Type.RequirementObject,
    isDeleted2: false,
    header: "Number Field",
    inputType: "number",
    id: -6,
    choices: [],
    hasInput: true,
    prompt: "Enter a number",
    children: [],
  },
  {
    UniqueID: "palette-attachment",
    display: true,
    description: "File attachment input",
    type: Type.RequirementObject,
    UPDATED_ON: new Date(),
    sponsoring_customer: "",
    node_type: Type.RequirementObject,
    isDeleted2: false,
    header: "Attachment",
    inputType: "attachments",
    id: -7,
    choices: [],
    hasInput: true,
    prompt: "Upload files",
    children: [],
  },
  {
    UniqueID: "palette-section",
    display: true,
    description: "Group related fields",
    type: Type.RequirementObject,
    UPDATED_ON: new Date(),
    sponsoring_customer: "",
    node_type: Type.RequirementObject,
    isDeleted2: false,
    header: "Section Divider",
    inputType: "section",
    id: -8,
    choices: [],
    hasInput: false,
    prompt: "Section header",
    children: [],
  },
];

/* ------------------------------------------------------------------ */
/*  Build flat nodes + edges from recursive Types tree                */
/* ------------------------------------------------------------------ */
function buildFlowData(
  root: Types,
  onInfoClick: (item: Types) => void,
  parentId: string | null = null,
  depth = 0,
  siblingIndex = 0,
): { nodes: Node[]; edges: Edge[] } {
  const nodeId = root.UniqueID || `node-${depth}-${siblingIndex}`;
  const x = depth * 280 + 20;
  const y = siblingIndex * 140 + 20;

  const node: Node = {
    id: nodeId,
    position: { x, y },
    data: { item: root, parentId, onInfoClick },
    type: "templateNode",
    draggable: true,
  };

  const nodes: Node[] = [node];
  const edges: Edge[] = [];

  if (parentId) {
    edges.push({
      id: `e-${parentId}-${nodeId}`,
      source: parentId,
      target: nodeId,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#1976d2", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed", color: "#1976d2" },
    });
  }

  root.children?.forEach((child, idx) => {
    const childData = buildFlowData(child, onInfoClick, nodeId, depth + 1, idx);
    nodes.push(...childData.nodes);
    edges.push(...childData.edges);
  });

  return { nodes, edges };
}

/* ------------------------------------------------------------------ */
/*  Tree helpers for reparenting                                      */
/* ------------------------------------------------------------------ */
function findNodeInTree(root: Types, uniqueId: string): Types | null {
  if (root.UniqueID === uniqueId) return root;
  for (const child of root.children || []) {
    const found = findNodeInTree(child, uniqueId);
    if (found) return found;
  }
  return null;
}

function removeNodeFromParent(root: Types, uniqueId: string): Types {
  if (!root.children) return root;
  root.children = root.children.filter((c) => c.UniqueID !== uniqueId);
  root.children.forEach((c) => removeNodeFromParent(c, uniqueId));
  return root;
}

function addNodeToParent(root: Types, parentId: string, node: Types): Types {
  if (root.UniqueID === parentId) {
    root.children = root.children || [];
    root.children.push(node);
    return root;
  }
  for (const child of root.children || []) {
    addNodeToParent(child, parentId, node);
  }
  return root;
}

function cloneTree(root: Types): Types {
  return JSON.parse(JSON.stringify(root));
}

/* ------------------------------------------------------------------ */
/*  Custom node with info icon + Handles                              */
/* ------------------------------------------------------------------ */
const TemplateNode = ({ data, selected }: any) => {
  const item: Types = data.item;
  const onInfo = data.onInfoClick as (item: Types) => void;

  return (
    <div
      style={{
        padding: "10px 28px 10px 14px",
        borderRadius: "8px",
        background: selected ? "#e3f2fd" : "#fff",
        border: selected ? "2px solid #1976d2" : "1px solid #ccc",
        minWidth: "160px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
        cursor: "grab",
        position: "relative",
      }}
    >
      {/* Info icon — top-right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onInfo?.(item);
        }}
        title="View details"
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px 5px",
          borderRadius: "50%",
          fontSize: 13,
          color: "#666",
          lineHeight: 1,
        }}
      >
        ⓘ
      </button>

      {/* Target handle (left) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#1976d2", width: 8, height: 8 }}
      />

      <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
        {item.header || "Untitled"}
      </div>
      <div style={{ fontSize: "11px", color: "#666" }}>
        {item.inputType || item.node_type}
      </div>
      {item.children?.length > 0 && (
        <div style={{ marginTop: "6px", fontSize: "10px", color: "#888" }}>
          {item.children.length} child{item.children.length > 1 ? "ren" : ""}
        </div>
      )}

      {/* Source handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#1976d2", width: 8, height: 8 }}
      />
    </div>
  );
};

const nodeTypes = { templateNode: TemplateNode };

/* ------------------------------------------------------------------ */
/*  Wrapper so useReactFlow works                                     */
/* ------------------------------------------------------------------ */
export default function TemplateFlow({ root }: { root: Types }) {
  return (
    <ReactFlowProvider>
      <TemplateFlowInner root={root} />
    </ReactFlowProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Main inner component                                              */
/* ------------------------------------------------------------------ */
function TemplateFlowInner({ root }: { root: Types }) {
  const styles = useStyles();
  const [detailItem, setDetailItem] = useState<Types | null>(null);
  const [treeRoot, setTreeRoot] = useState<Types>(root);
  const [dragMsg, setDragMsg] = useState<string>("");
  const flowRef = useRef<HTMLDivElement>(null);

  const onInfoClick = useCallback((item: Types) => {
    setDetailItem(item);
  }, []);

  const initial = useMemo(
    () => buildFlowData(treeRoot, onInfoClick),
    [treeRoot, onInfoClick],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  const { getNodes, screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    // Node selection no longer shows detail panel — info icon does that
    void node;
  }, []);

  /* ---- Drag a node onto another → reparent ----------------------- */
  const onNodeDragStop = useCallback(
    (_event: any, draggedNode: Node) => {
      const allNodes = getNodes();
      let closestNode: Node | null = null;
      let minDist = Infinity;

      const dx = draggedNode.position.x;
      const dy = draggedNode.position.y;

      for (const n of allNodes) {
        if (n.id === draggedNode.id) continue;
        const dist = Math.hypot(n.position.x - dx, n.position.y - dy);
        if (dist < minDist && dist < 120) {
          minDist = dist;
          closestNode = n;
        }
      }

      if (!closestNode) {
        setDragMsg("");
        return;
      }

      const draggedId = draggedNode.id;
      const targetId = closestNode.id;

      const isDescendant = (parent: Types, childId: string): boolean => {
        if (parent.UniqueID === childId) return true;
        return (parent.children || []).some((c) => isDescendant(c, childId));
      };
      const targetItem = findNodeInTree(treeRoot, targetId);
      if (targetItem && isDescendant(targetItem, draggedId)) {
        setDragMsg("Cannot move a node into its own child.");
        setTimeout(() => setDragMsg(""), 3000);
        return;
      }

      const newTree = cloneTree(treeRoot);
      const nodeToMove = findNodeInTree(newTree, draggedId);
      if (!nodeToMove) return;

      removeNodeFromParent(newTree, draggedId);
      addNodeToParent(newTree, targetId, nodeToMove);

      setTreeRoot(newTree);
      const rebuilt = buildFlowData(newTree, onInfoClick);
      setNodes(rebuilt.nodes);
      setEdges(rebuilt.edges);
      const targetHeader = (closestNode.data.item as Types).header;
      setDragMsg(`Moved "${nodeToMove.header}" under "${targetHeader}"`);
      setTimeout(() => setDragMsg(""), 3000);
    },
    [getNodes, treeRoot, onInfoClick, setNodes, setEdges],
  );

  /* ---- Drag from palette onto canvas → add as child -------------- */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const json = e.dataTransfer.getData("application/json");
      if (!json) return;

      const droppedItem: Types = JSON.parse(json);
      const pos = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      const allNodes = getNodes();
      let closest: Node | null = null;
      let minDist = Infinity;

      for (const n of allNodes) {
        const dist = Math.hypot(n.position.x - pos.x, n.position.y - pos.y);
        if (dist < minDist) {
          minDist = dist;
          closest = n;
        }
      }

      if (!closest || minDist > 150) {
        setDragMsg("Drop near a node to attach");
        setTimeout(() => setDragMsg(""), 2000);
        return;
      }

      const newTree = cloneTree(treeRoot);
      const newItem = {
        ...droppedItem,
        UniqueID: droppedItem.UniqueID + "-" + Date.now(),
      };
      addNodeToParent(newTree, closest.id, newItem);

      setTreeRoot(newTree);
      const rebuilt = buildFlowData(newTree, onInfoClick);
      setNodes(rebuilt.nodes);
      setEdges(rebuilt.edges);
      const targetHeader = (closest.data.item as Types).header;
      setDragMsg(`Added "${newItem.header}" under "${targetHeader}"`);
      setTimeout(() => setDragMsg(""), 3000);
    },
    [getNodes, screenToFlowPosition, treeRoot, onInfoClick, setNodes, setEdges],
  );

  return (
    <div>
      <div className={styles.wrapper}>
        <div className={styles.flowContainer} ref={flowRef}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[10, 10]}
          >
            <Background gap={16} />
            <Controls />
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
            <Panel position="top-left">
              <div>
                <Text weight="semibold" size={400}>
                  Template Structure
                </Text>
                <div className={styles.dragHint}>
                  Drag a node onto another to reparent
                </div>
                <div className={styles.dragHint}>
                  Drag palette items into the flow
                </div>
                {dragMsg && (
                  <div
                    style={{
                      marginTop: 4,
                      color: "#2e7d32",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {dragMsg}
                  </div>
                )}
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Right panel — draggable palette */}
        <div className={styles.detailPanel}>
          <Label weight="semibold" size="large">
            Object Palette
          </Label>
          <Text size={200} style={{ color: "#666", marginBottom: 12 }}>
            Drag items into the flow
          </Text>
          {PALETTE.map((obj) => (
            <div
              key={obj.UniqueID}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/json", JSON.stringify(obj));
                e.dataTransfer.effectAllowed = "move";
              }}
              className={styles.paletteItem}
            >
              <div style={{ fontWeight: 600 }}>{obj.header}</div>
              <div style={{ fontSize: 11, color: "#888" }}>
                {obj.inputType}
                {obj.choices.length > 0 && ` • ${obj.choices.length} options`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {detailItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setDetailItem(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 24,
              width: 420,
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Label weight="semibold" size="large">
                {detailItem.header || "Untitled"}
              </Label>
              <button
                onClick={() => setDetailItem(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 20,
                  color: "#666",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <NodeDetails item={detailItem} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail renderer (used in modal)                                   */
/* ------------------------------------------------------------------ */
function NodeDetails({ item }: { item: Types }) {
  const styles = useStyles();
  return (
    <div>
      <DetailField label="ID" value={item.id} />
      <DetailField label="UniqueID" value={item.UniqueID} />
      <DetailField label="Type" value={item.type} />
      <DetailField label="Node Type" value={item.node_type} />
      <DetailField label="Input Type" value={item.inputType} />
      <DetailField label="Prompt" value={item.prompt} />
      <DetailField label="Has Input" value={item.hasInput ? "Yes" : "No"} />
      <DetailField label="Display" value={item.display ? "Yes" : "No"} />
      <DetailField label="Order" value={item.order ?? "—"} />
      <DetailField label="Deleted" value={item.isDeleted2 ? "Yes" : "No"} />

      {item.choices?.length > 0 && (
        <div className={styles.fieldRow}>
          <Label size="small" weight="semibold">
            Choices
          </Label>
          <div style={{ marginTop: "4px" }}>
            {item.choices.map((c) => (
              <span key={c} className={styles.chip}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {item.children?.length > 0 && (
        <div className={styles.fieldRow}>
          <Label size="small" weight="semibold">
            Children
          </Label>
          <div style={{ marginTop: "4px" }}>
            {item.children.map((child) => (
              <span key={child.UniqueID} className={styles.chip}>
                {child.header}
              </span>
            ))}
          </div>
        </div>
      )}

      {item.Tag && item.Tag.length > 0 && (
        <div className={styles.fieldRow}>
          <Label size="small" weight="semibold">
            Tags
          </Label>
          <div style={{ marginTop: "4px" }}>
            {item.Tag?.map((t) => (
              <span key={t.id} className={styles.chip}>
                {t.NAME}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: any }) {
  const styles = useStyles();
  return (
    <div className={styles.fieldRow}>
      <Label size="small" weight="semibold">
        {label}
      </Label>
      <div>
        <Text size={200}>{value ?? "—"}</Text>
      </div>
    </div>
  );
}
