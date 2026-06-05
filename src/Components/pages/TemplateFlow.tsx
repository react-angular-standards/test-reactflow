/**
 * @file React Flow visualizer for nested template objects
 *  - Shows parent/child edges
 *  - Click node → detail panel
 *  - Drag node onto another node → reparent (move to different parent)
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
import { Types } from "./TemplateTypes";
import {
  Card,
  CardHeader,
  Label,
  makeStyles,
  Text,
  Button,
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
    width: "320px",
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
});

/* ------------------------------------------------------------------ */
/*  Build flat nodes + edges from recursive Types tree                */
/* ------------------------------------------------------------------ */
function buildFlowData(
  root: Types,
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
    data: { item: root, parentId },
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
    const childData = buildFlowData(child, nodeId, depth + 1, idx);
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
/*  Custom node with Handles                                          */
/* ------------------------------------------------------------------ */
const TemplateNode = ({ data, selected }: any) => {
  const item: Types = data.item;
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "8px",
        background: selected ? "#e3f2fd" : "#fff",
        border: selected ? "2px solid #1976d2" : "1px solid #ccc",
        minWidth: "160px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
        cursor: "grab",
        position: "relative",
      }}
    >
      {/* Target handle (left) — parent connects here */}
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

      {/* Source handle (right) — connects to children */}
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
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
/* Wrapper so useReactFlow works */
export default function TemplateFlow({ root }: { root: Types }) {
  return (
    <ReactFlowProvider>
      <TemplateFlowInner root={root} />
    </ReactFlowProvider>
  );
}

function TemplateFlowInner({ root }: { root: Types }) {
  const styles = useStyles();
  const [selectedNode, setSelectedNode] = useState<Types | null>(null);
  const [treeRoot, setTreeRoot] = useState<Types>(root);
  const [dragMsg, setDragMsg] = useState<string>("");
  const flowRef = useRef<HTMLDivElement>(null);

  const initial = useMemo(() => buildFlowData(treeRoot), [treeRoot]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  const { getNodes } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node.data.item as Types);
  }, []);

  /* ---- Drag-to-reparent ------------------------------------------ */
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

      // Prevent dropping onto self or own descendant
      const isDescendant = (parent: Types, childId: string): boolean => {
        if (parent.UniqueID === childId) return true;
        return (parent.children || []).some((c) => isDescendant(c, childId));
      };
      const targetItem = findNodeInTree(treeRoot, targetId);
      if (targetItem && isDescendant(targetItem, draggedId)) {
        setDragMsg("Cannot move a node into its own child.");
        return;
      }

      // Perform reparent
      const newTree = cloneTree(treeRoot);
      const nodeToMove = findNodeInTree(newTree, draggedId);
      if (!nodeToMove) return;

      removeNodeFromParent(newTree, draggedId);
      addNodeToParent(newTree, targetId, nodeToMove);

      setTreeRoot(newTree);
      const rebuilt = buildFlowData(newTree);
      setNodes(rebuilt.nodes);
      setEdges(rebuilt.edges);
      const targetHeader = (closestNode.data.item as Types).header;
      setDragMsg(`Moved "${nodeToMove.header}" under "${targetHeader}"`);
      setTimeout(() => setDragMsg(""), 3000);
    },
    [getNodes, treeRoot, setNodes, setEdges],
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

        <div className={styles.detailPanel}>
          {selectedNode ? (
            <NodeDetails item={selectedNode} />
          ) : (
            <Text size={300} style={{ color: "#888" }}>
              Click a node to view details
            </Text>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail side-panel                                                  */
/* ------------------------------------------------------------------ */
function NodeDetails({ item }: { item: Types }) {
  const styles = useStyles();
  return (
    <Card>
      <CardHeader
        header={
          <Label weight="semibold" size="large">
            {item.header || "Untitled"}
          </Label>
        }
        description={
          <Text size={200} style={{ color: "#666" }}>
            {item.description || "No description"}
          </Text>
        }
      />
      <div style={{ marginTop: "12px" }}>
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
    </Card>
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
