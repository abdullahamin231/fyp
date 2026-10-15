"use client";

import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Background,
  BackgroundVariant,
  EdgeLabelRenderer,
  Handle,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getBezierPath,
  useInternalNode,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
  useStore,
  type Edge,
  type EdgeProps,
  type InternalNode,
  type Node,
  type NodeProps,
  type PanelPosition,
} from "@xyflow/react";
import { Icon } from "@/components/ui/icon";
import type { Point } from "./geometry";
import { eligibilityStyle, kindIcon, kindTone, toneClasses, toolName } from "./graph-styles";
import type { ExplorerEdge, ExplorerNode, NodeTone } from "@/lib/domain/graph";
import { isDecisive } from "@/lib/domain/graph";

/**
 * The pan-and-zoom canvas both graph explorers draw on (React Flow).
 *
 * Wheel / trackpad scrolls the canvas, Ctrl/⌘ + wheel or a pinch zooms, and
 * dragging the background pans. Nodes can be dragged to untangle a region;
 * "Reset layout" puts them back. Hovering or selecting a node dims everything
 * that is not one hop away, so a dense graph still reads as a chain.
 */

/** Design-token colours as CSS variables, for SVG paint and the minimap. */
const toneVar: Record<NodeTone, string> = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  tertiary: "var(--color-tertiary)",
  error: "var(--color-error)",
  outline: "var(--color-outline)",
};

interface CardData extends Record<string, unknown> {
  node: ExplorerNode;
  dimmed: boolean;
  marked: boolean;
}

interface LinkData extends Record<string, unknown> {
  edge: ExplorerEdge;
  dimmed: boolean;
  focused: boolean;
  showLabel: boolean;
}

type CardNode = Node<CardData, "card">;
type LinkEdge = Edge<LinkData, "link">;

const hiddenHandle =
  "w-1! h-1! min-w-0! min-h-0! border-0! bg-transparent! opacity-0! pointer-events-none!";

function NodeCard({ data, selected }: NodeProps<CardNode>) {
  const { node, dimmed, marked } = data;
  const tone = toneClasses[kindTone[node.kind]];
  return (
    <div
      title={`${node.kindLabel} · ${node.label}`}
      className={[
        "w-56 flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-surface-container border text-left transition-all duration-150",
        node.conflict ? "border-error ring-2 ring-error/40" : "border-outline-variant",
        selected
          ? "border-primary! ring-4 ring-primary/25 shadow-2xl"
          : "shadow-lg hover:border-outline",
        marked ? "ring-4 ring-secondary/50" : "",
        dimmed ? "opacity-25" : "opacity-100",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={false}
        className={hiddenHandle}
      />
      <span
        className={`w-8 h-8 shrink-0 rounded-md border flex items-center justify-center ${tone.border} ${tone.bg}`}
      >
        <Icon name={kindIcon[node.kind]} className={`${tone.text} text-[18px]`} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] leading-tight font-semibold text-on-surface truncate">
          {node.label.split(" · ").slice(1).join(" · ") || node.label}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 font-mono-code text-micro-label text-muted">
          <span className="truncate">{node.kindLabel}</span>
          <span className="shrink-0">· {toolName(node.tool)}</span>
        </span>
      </span>
      {node.conflict ? (
        <span className="shrink-0 w-2 h-2 rounded-full bg-error animate-pulse" title={node.meta} />
      ) : null}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={false}
        className={hiddenHandle}
      />
    </div>
  );
}

function centreOf(node: InternalNode): Point & { w: number; h: number } {
  const w = node.measured.width ?? 224;
  const h = node.measured.height ?? 52;
  return {
    x: node.internals.positionAbsolute.x + w / 2,
    y: node.internals.positionAbsolute.y + h / 2,
    w,
    h,
  };
}

/**
 * Floating edge: leaves whichever side of the card faces the other end, so it
 * reads correctly in any layout (and after a drag), not only left-to-right.
 */
function LinkPath({ id, source, target, data }: EdgeProps<LinkEdge>) {
  const from = useInternalNode(source);
  const to = useInternalNode(target);
  if (!from || !to || !data) return null;
  const a = centreOf(from);
  const b = centreOf(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const horizontal = Math.abs(dx) > (a.w + b.w) / 2;
  const [path, labelX, labelY] = horizontal
    ? getBezierPath({
        sourceX: a.x + (Math.sign(dx) * a.w) / 2,
        sourceY: a.y,
        sourcePosition: dx > 0 ? Position.Right : Position.Left,
        targetX: b.x - (Math.sign(dx) * b.w) / 2,
        targetY: b.y,
        targetPosition: dx > 0 ? Position.Left : Position.Right,
      })
    : getBezierPath({
        sourceX: a.x,
        sourceY: a.y + (Math.sign(dy || 1) * a.h) / 2,
        sourcePosition: dy >= 0 ? Position.Bottom : Position.Top,
        targetX: b.x,
        targetY: b.y - (Math.sign(dy || 1) * b.h) / 2,
        targetPosition: dy >= 0 ? Position.Top : Position.Bottom,
      });
  const { edge, dimmed, focused, showLabel } = data;
  const style = eligibilityStyle[edge.eligibility];
  return (
    <>
      <path
        id={id}
        d={path}
        fill="none"
        strokeWidth={focused ? 3 : isDecisive(edge.eligibility) ? 2 : 1.5}
        strokeLinecap="round"
        strokeDasharray={style.dash}
        className={`${style.strokeClass} transition-opacity`}
        opacity={dimmed ? 0.08 : focused ? 1 : 0.7}
      />
      {showLabel && !dimmed ? (
        <EdgeLabelRenderer>
          <div
            className="absolute px-1.5 py-0.5 rounded border border-outline-variant bg-surface-container-high font-mono-code text-micro-label font-bold text-on-surface-variant pointer-events-none"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {edge.label} · {style.label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

const nodeTypes = { card: NodeCard };
const edgeTypes = { link: LinkPath };

function CanvasControls({ position, onReset }: { position: PanelPosition; onReset: () => void }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const zoom = useStore((state) => state.transform[2]);
  const button =
    "p-1.5 rounded hover:bg-surface-container-high text-muted hover:text-on-surface transition-colors";
  return (
    <Panel position={position}>
      <div className="flex items-center bg-surface-container/90 border border-outline-variant/60 rounded-lg p-0.5 backdrop-blur shadow-lg">
        <button
          className={button}
          title="Zoom out (Ctrl/⌘ + scroll)"
          onClick={() => zoomOut({ duration: 200 })}
        >
          <Icon name="remove" className="text-[16px]" />
        </button>
        <span className="w-12 text-center font-mono-code text-micro-label text-on-surface">
          {Math.round(zoom * 100)}%
        </span>
        <button
          className={button}
          title="Zoom in (Ctrl/⌘ + scroll)"
          onClick={() => zoomIn({ duration: 200 })}
        >
          <Icon name="add" className="text-[16px]" />
        </button>
        <div className="h-3 w-px bg-outline-variant/60 mx-0.5" />
        <button
          className={button}
          title="Fit graph to screen"
          onClick={() => fitView({ duration: 300, padding: 0.15 })}
        >
          <Icon name="fit_screen" className="text-[16px]" />
        </button>
        <button className={button} title="Reset layout (undo dragged nodes)" onClick={onReset}>
          <Icon name="restart_alt" className="text-[16px]" />
        </button>
      </div>
    </Panel>
  );
}

export interface GraphCanvasProps {
  nodes: ExplorerNode[];
  edges: ExplorerEdge[];
  positions: Map<string, Point>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Extra highlight ring (e.g. the source node while drawing a manual link). */
  markedId?: string | null;
  /** Always label edges, rather than only those touching the focused node. */
  alwaysLabelEdges?: boolean;
  controlsPosition?: PanelPosition;
  minimapPosition?: PanelPosition;
  minimap?: boolean;
  /** Overlay panels — rendered inside the canvas, above the graph. */
  children?: ReactNode;
}

function Canvas({
  nodes,
  edges,
  positions,
  selectedId,
  onSelect,
  markedId = null,
  alwaysLabelEdges = false,
  controlsPosition = "bottom-left",
  minimapPosition = "bottom-right",
  minimap = true,
  children,
}: GraphCanvasProps) {
  const { fitView, getNode, setCenter, getZoom } = useReactFlow();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const clickedId = useRef<string | null>(null);

  const layoutNodes = useMemo<CardNode[]>(
    () =>
      nodes.map((node) => ({
        id: node.id,
        type: "card",
        position: positions.get(node.id) ?? { x: 0, y: 0 },
        data: { node, dimmed: false, marked: false },
      })),
    [nodes, positions],
  );
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<CardNode>(layoutNodes);

  // A new layout (mode, filters, data) replaces dragged positions, keeping the
  // measured sizes so cards stay visible, then refits once every card is measured.
  const initialized = useNodesInitialized();
  const pendingFit = useRef(true);
  const applyLayout = useCallback(() => {
    setFlowNodes((previous) => {
      const measured = new Map(previous.map((node) => [node.id, node.measured]));
      return layoutNodes.map((node) =>
        measured.get(node.id) ? { ...node, measured: measured.get(node.id) } : node,
      );
    });
    pendingFit.current = true;
  }, [layoutNodes, setFlowNodes]);
  useEffect(applyLayout, [applyLayout]);
  useEffect(() => {
    if (!initialized || !pendingFit.current) return;
    pendingFit.current = false;
    fitView({ duration: 300, padding: 0.15 });
  }, [initialized, flowNodes, fitView]);

  // Selection from outside the canvas (inspector links, search) pans to the node.
  useEffect(() => {
    if (!selectedId || selectedId === clickedId.current) {
      clickedId.current = null;
      return;
    }
    const target = getNode(selectedId);
    if (!target) return;
    // nodeOrigin is the centre, so `position` already is the point to centre on.
    setCenter(target.position.x, target.position.y, {
      zoom: Math.max(getZoom(), 0.9),
      duration: 400,
    });
  }, [selectedId, getNode, setCenter, getZoom]);

  const focusId = hoveredId ?? selectedId;
  const focusSet = useMemo(() => {
    if (!focusId) return null;
    const ids = new Set([focusId]);
    for (const edge of edges) {
      if (edge.from === focusId) ids.add(edge.to);
      if (edge.to === focusId) ids.add(edge.from);
    }
    return ids;
  }, [focusId, edges]);

  const renderedNodes = useMemo(
    () =>
      flowNodes.map((node) => ({
        ...node,
        selected: node.id === selectedId,
        data: {
          ...node.data,
          dimmed: focusSet !== null && !focusSet.has(node.id),
          marked: node.id === markedId,
        },
      })),
    [flowNodes, selectedId, focusSet, markedId],
  );

  const flowEdges = useMemo<LinkEdge[]>(
    () =>
      edges.map((edge, index) => {
        const focused = focusId !== null && (edge.from === focusId || edge.to === focusId);
        return {
          id: `${edge.from}-${edge.to}-${edge.label}-${index}`,
          source: edge.from,
          target: edge.to,
          type: "link",
          zIndex: focused ? 1 : 0,
          data: {
            edge,
            focused,
            dimmed: focusId !== null && !focused,
            showLabel: alwaysLabelEdges || focused,
          },
        };
      }),
    [edges, focusId, alwaysLabelEdges],
  );

  return (
    <ReactFlow
      nodes={renderedNodes}
      edges={flowEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      nodeOrigin={[0.5, 0.5]}
      colorMode="dark"
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.1}
      maxZoom={2.5}
      panOnScroll
      zoomOnScroll={false}
      zoomOnPinch
      zoomOnDoubleClick={false}
      selectionOnDrag={false}
      nodesConnectable={false}
      elementsSelectable
      onlyRenderVisibleElements={nodes.length > 300}
      onNodeClick={(_, node) => {
        clickedId.current = node.id;
        onSelect(node.id);
      }}
      onPaneClick={() => onSelect(null)}
      onNodeMouseEnter={(_, node) => setHoveredId(node.id)}
      onNodeMouseLeave={() => setHoveredId(null)}
      proOptions={{ hideAttribution: true }}
      className="unify-flow"
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={22}
        size={1.2}
        color="var(--color-outline-variant)"
      />
      {minimap ? (
        <MiniMap
          position={minimapPosition}
          pannable
          zoomable
          nodeColor={(node) => toneVar[kindTone[(node as CardNode).data.node.kind]]}
          nodeStrokeWidth={0}
          nodeBorderRadius={6}
          bgColor="var(--color-surface-container-low)"
          style={{ width: 168, height: 112 }}
          maskColor="rgb(5 5 6 / 0.65)"
          className="rounded-lg! border! border-outline-variant/60! overflow-hidden"
        />
      ) : null}
      <CanvasControls position={controlsPosition} onReset={applyLayout} />
      {children}
    </ReactFlow>
  );
}

export function GraphCanvas(props: GraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}
