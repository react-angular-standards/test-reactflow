/**
 * @file React Flow visualizer for nested template objects
 */
import React, { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Types } from "./TemplateTypes";
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
  nodeLabel: {
    fontWeight: 600,
    fontSize: "13px",
  },
  nodeType: {
    fontSize: "11px",
    color: "#666",
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
  const y = siblingIndex * 120 + 20;

  const node: Node = {
    id: nodeId,
    position: { x, y },
    data: { item: root },
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
/*  Custom node                                                        */
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
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
        {item.header || "Untitled"}
      </div>
      <div style={{ fontSize: "11px", color: "#666" }}>
        {item.inputType || item.node_type}
      </div>
      {item.children?.length > 0 && (
        <div
          style={{
            marginTop: "6px",
            fontSize: "10px",
            color: "#888",
          }}
        >
          {item.children.length} child
          {item.children.length > 1 ? "ren" : ""}
        </div>
      )}
    </div>
  );
};

const nodeTypes = { templateNode: TemplateNode };

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function TemplateFlow({ root }: { root: Types }) {
  const styles = useStyles();
  const [selectedNode, setSelectedNode] = useState<Types | null>(null);

  const initial = useMemo(() => buildFlowData(root), [root]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node.data.item as Types);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.flowContainer}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background gap={16} />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
          <Panel position="top-left">
            <Text weight="semibold" size={400}>
              Template Structure
            </Text>
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
