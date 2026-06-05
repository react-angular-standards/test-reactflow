/**
 * @file React Flow visualizer for nested template objects
 *  - Shows parent/child edges
 *  - Info icon on each node → detail modal
 *  - Right panel = grouped + searchable draggable object palette
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
import { Label, makeStyles, Text, Input } from "@fluentui/react-components";
import { SearchRegular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  flowContainer: {
    width: "100%",
    height: "600px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    background: "#fafafa",
  },
  detailPanel: {
    width: "300px",
    padding: "16px",
    background: "#fff",
    borderLeft: "1px solid #e0e0e0",
    overflowY: "auto" as const,
    height: "600px",
    display: "flex",
    flexDirection: "column",
  },
  wrapper: {
    display: "flex",
    gap: "16px",
    marginTop: "16px",
  },
  fieldRow: {
    marginBottom: "10px",
  },
  chip: {
    display: "inline-block",
    padding: "3px 10px",
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
  paletteGroup: {
    marginBottom: "16px",
  },
  paletteGroupTitle: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#555",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "8px",
    paddingBottom: "4px",
    borderBottom: "2px solid #e0e0e0",
  },
  paletteItem: {
    padding: "10px 12px",
    marginBottom: "6px",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    background: "#fff",
    cursor: "grab",
    fontSize: "13px",
    transition: "all 0.15s ease",
  },
  searchBox: {
    marginBottom: "12px",
  },
  noResults: {
    fontSize: "13px",
    color: "#888",
    textAlign: "center" as const,
    padding: "12px 0",
  },
});

/* ------------------------------------------------------------------ */
/*  Palette objects grouped by category                               */
/* ------------------------------------------------------------------ */
interface PaletteGroup {
  title: string;
  color: string;
  items: Types[];
}

const PALETTE_GROUPS: PaletteGroup[] = [
  {
    title: "All",
    color: "#1976d2",
    items: [],
  },
  {
    title: "Text Inputs",
    color: "#4caf50",
    items: [
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
    ],
  },
  {
    title: "Selection",
    color: "#ff9800",
    items: [
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
        UniqueID: "palette-autocomplete",
        display: true,
        description: "Auto-complete name search",
        type: Type.RequirementObject,
        UPDATED_ON: new Date(),
        sponsoring_customer: "",
        node_type: Type.RequirementObject,
        isDeleted2: false,
        header: "Name Autocomplete",
        inputType: "autoComplete",
        id: -5,
        choices: [],
        hasInput: true,
        prompt: "Search for name",
        children: [],
      },
    ],
  },
  {
    title: "Numeric & Date",
    color: "#2196f3",
    items: [
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
        id: -6,
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
        id: -7,
        choices: [],
        hasInput: true,
        prompt: "Enter a number",
        children: [],
      },
    ],
  },
  {
    title: "Special",
    color: "#9c27b0",
    items: [
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
        id: -8,
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
        id: -9,
        choices: [],
        hasInput: false,
        prompt: "Section header",
        children: [],
      },
    ],
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

  const inputTypeColors: Record<string, string> = {
    textbox: "#4caf50",
    textarea: "#4caf50",
    select: "#ff9800",
    multiselect: "#ff9800",
    autoComplete: "#ff9800",
    date: "#2196f3",
    number: "#2196f3",
    attachments: "#9c27b0",
    section: "#9c27b0",
    template: "#1976d2",
  };

  const accentColor = inputTypeColors[item.inputType] || "#666";

  return (
    <div
      style={{
        padding: "10px 28px 10px 14px",
        borderRadius: "8px",
        background: selected ? "#e3f2fd" : "#fff",
        border: selected
          ? `2px solid ${accentColor}`
          : `1px solid ${accentColor}40`,
        minWidth: "160px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
        cursor: "grab",
        position: "relative",
        borderLeft: `4px solid ${accentColor}`,
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
          fontSize: 14,
          color: accentColor,
          lineHeight: 1,
          fontWeight: 700,
        }}
      >
        ⓘ
      </button>

      {/* Target handle (left) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: accentColor, width: 8, height: 8 }}
      />

      <div
        style={{
          fontWeight: 600,
          fontSize: "13px",
          marginBottom: "4px",
          color: "#222",
        }}
      >
        {item.header || "Untitled"}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: accentColor,
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
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
        style={{ background: accentColor, width: 8, height: 8 }}
      />
    </div>
  );
};

const nodeTypes = { templateNode: TemplateNode };

/* ------------------------------------------------------------------ */
/*  Wrapper so useReactFlow works                                     */
/* ------------------------------------------------------------------ */
export default function TemplateFlow({
  root,
  onTreeChange,
}: {
  root: Types;
  onTreeChange?: (tree: Types) => void;
}) {
  return (
    <ReactFlowProvider>
      <TemplateFlowInner root={root} onTreeChange={onTreeChange} />
    </ReactFlowProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Main inner component                                              */
/* ------------------------------------------------------------------ */
function TemplateFlowInner({
  root,
  onTreeChange,
}: {
  root: Types;
  onTreeChange?: (tree: Types) => void;
}) {
  const styles = useStyles();
  const [detailItem, setDetailItem] = useState<Types | null>(null);
  const [treeRoot, setTreeRoot] = useState<Types>(root);
  const [dragMsg, setDragMsg] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
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
      onTreeChange?.(newTree);
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
      onTreeChange?.(newTree);
      const rebuilt = buildFlowData(newTree, onInfoClick);
      setNodes(rebuilt.nodes);
      setEdges(rebuilt.edges);
      const targetHeader = (closest.data.item as Types).header;
      setDragMsg(`Added "${newItem.header}" under "${targetHeader}"`);
      setTimeout(() => setDragMsg(""), 3000);
    },
    [getNodes, screenToFlowPosition, treeRoot, onInfoClick, setNodes, setEdges],
  );

  /* ---- Tabs + search for palette -------------------------------- */
  const [activeTab, setActiveTab] = useState<string>("All");

  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let groups = PALETTE_GROUPS;
    if (q) {
      groups = PALETTE_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            item.header.toLowerCase().includes(q) ||
            item.inputType.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q),
        ),
      })).filter((g) => g.items.length > 0);
    }
    return groups;
  }, [searchQuery]);

  const activeGroup = useMemo(() => {
    const found = filteredGroups.find((g) => g.title === activeTab);
    if (found) return found;
    // "All" tab: merge every item from every group
    if (activeTab === "All") {
      const allItems = filteredGroups
        .filter((g) => g.title !== "All")
        .flatMap((g) => g.items);
      return { title: "All", color: "#1976d2", items: allItems };
    }
    return filteredGroups[0];
  }, [filteredGroups, activeTab]);

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

        {/* Right panel — tabbed + searchable palette */}
        <div className={styles.detailPanel}>
          <Label weight="semibold" size="large" style={{ marginBottom: 4 }}>
            Object Palette
          </Label>
          <Text size={200} style={{ color: "#666", marginBottom: 10 }}>
            Drag items into the flow
          </Text>

          <div className={styles.searchBox}>
            <Input
              placeholder="Search objects..."
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              contentBefore={
                <SearchRegular style={{ fontSize: 14, color: "#888" }} />
              }
              style={{
                width: "100%",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* Category tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 10,
              borderBottom: "1px solid #e0e0e0",
              paddingBottom: 6,
            }}
          >
            {filteredGroups.map((group) => (
              <button
                key={group.title}
                onClick={() => setActiveTab(group.title)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "16px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background:
                    activeTab === group.title ? group.color : "transparent",
                  color: activeTab === group.title ? "#fff" : group.color,
                  transition: "all 0.15s",
                }}
              >
                {group.title}
              </button>
            ))}
          </div>

          {filteredGroups.length === 0 && (
            <div className={styles.noResults}>No matching objects</div>
          )}

          {activeGroup && (
            <div style={{ overflowY: "auto", flex: 1 }}>
              {activeGroup.items.map((obj) => (
                <div
                  key={obj.UniqueID}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify(obj),
                    );
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className={styles.paletteItem}
                >
                  <div style={{ fontWeight: 600, color: "#222" }}>
                    {obj.header}
                  </div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                    {obj.inputType}
                    {obj.choices.length > 0 &&
                      ` • ${obj.choices.length} options`}
                  </div>
                </div>
              ))}
            </div>
          )}
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
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(3px)",
          }}
          onClick={() => setDetailItem(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 0,
              width: 460,
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
              animation: "fadeIn 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #eee",
                background: "linear-gradient(135deg, #1976d2, #1565c0)",
                borderRadius: "12px 12px 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#fff",
                  }}
                >
                  {detailItem.header || "Untitled"}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.8)",
                    marginTop: 2,
                  }}
                >
                  {detailItem.inputType || detailItem.node_type} • ID:{" "}
                  {detailItem.id}
                </div>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 20,
                  color: "#fff",
                  lineHeight: 1,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px" }}>
              <NodeDetails item={detailItem} />
            </div>
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

  const typeColorMap: Record<string, string> = {
    textbox: "#4caf50",
    textarea: "#4caf50",
    select: "#ff9800",
    multiselect: "#ff9800",
    autoComplete: "#ff9800",
    date: "#2196f3",
    number: "#2196f3",
    attachments: "#9c27b0",
    section: "#9c27b0",
    template: "#1976d2",
    RequirementObject: "#e91e63",
    Template: "#1976d2",
  };

  const accent =
    typeColorMap[item.inputType] || typeColorMap[item.node_type] || "#666";

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "0.6px",
          color: accent,
          marginBottom: 8,
          paddingBottom: 4,
          borderBottom: `2px solid ${accent}30`,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );

  const Row = ({
    label,
    value,
    badge,
  }: {
    label: string;
    value: any;
    badge?: boolean;
  }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <span style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>
        {label}
      </span>
      {badge ? (
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: value === "Yes" || value === true ? "#2e7d32" : "#c62828",
            background:
              value === "Yes" || value === true ? "#e8f5e9" : "#ffebee",
            padding: "2px 10px",
            borderRadius: 12,
          }}
        >
          {value === true ? "Yes" : value === false ? "No" : value}
        </span>
      ) : (
        <span
          style={{
            fontSize: 13,
            color: "#222",
            fontWeight: 600,
            textAlign: "right",
          }}
        >
          {value ?? "—"}
        </span>
      )}
    </div>
  );

  return (
    <div>
      <Section title="Basic Info">
        <Row label="Unique ID" value={item.UniqueID} />
        <Row label="Type" value={item.type} />
        <Row label="Node Type" value={item.node_type} />
        <Row label="Input Type" value={item.inputType} />
        <Row label="Order" value={item.order ?? "—"} />
      </Section>

      <Section title="Configuration">
        <Row label="Prompt" value={item.prompt} />
        <Row label="Description" value={item.description || "—"} />
        <Row label="Has Input" value={item.hasInput} badge />
        <Row label="Display" value={item.display} badge />
        <Row label="Deleted" value={item.isDeleted2} badge />
      </Section>

      {item.choices?.length > 0 && (
        <Section title="Choices">
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}
          >
            {item.choices.map((c) => (
              <span
                key={c}
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 16,
                  background: `${accent}15`,
                  color: accent,
                  fontSize: 12,
                  fontWeight: 600,
                  border: `1px solid ${accent}40`,
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </Section>
      )}

      {item.children?.length > 0 && (
        <Section title={`Children (${item.children.length})`}>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}
          >
            {item.children.map((child) => (
              <span
                key={child.UniqueID}
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 16,
                  background: "#f5f5f5",
                  color: "#444",
                  fontSize: 12,
                  fontWeight: 600,
                  border: "1px solid #e0e0e0",
                }}
              >
                {child.header}
              </span>
            ))}
          </div>
        </Section>
      )}

      {item.Tag && item.Tag.length > 0 && (
        <Section title="Tags">
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}
          >
            {item.Tag.map((t) => (
              <span
                key={t.id}
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 16,
                  background: "#fff3e0",
                  color: "#e65100",
                  fontSize: 12,
                  fontWeight: 600,
                  border: "1px solid #ffcc80",
                }}
              >
                {t.NAME}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
