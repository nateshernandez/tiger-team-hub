import "@xyflow/react/dist/base.css"

import {
  Background,
  BackgroundVariant,
  type FitViewOptions,
  MarkerType,
  type Node,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import { RotateCcw } from "lucide-react"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import {
  DiagramEdge,
  type DiagramFlowEdge,
  edgeStroke,
} from "@/features/agent-works/components/diagram-edge"
import { DiagramKey } from "@/features/agent-works/components/diagram-key"
import {
  type DiagramFlowNode,
  DiagramNode,
  type DiagramSelection,
} from "@/features/agent-works/components/diagram-node"
import {
  type LoopGroupFlowNode,
  LoopGroupNode,
} from "@/features/agent-works/components/loop-group-node"
import { type Diagram } from "@/features/agent-works/lib/diagram-schema"
import { type DiagramLayout } from "@/features/agent-works/lib/layout-diagram"
import { cn } from "@/lib/utils"
import { type TermId } from "@/lib/vocabulary/term-schema"

const NODE_TYPES = { part: DiagramNode, loop: LoopGroupNode }
const EDGE_TYPES = { routed: DiagramEdge }
const LOOP_NODE_ID = "loop"
// The key is pinned to the bottom-left corner at a fixed size on screen, so
// the fit leaves room for it: beside the diagram or below it, whichever
// leaves the diagram bigger in the canvas it has.
const EDGE_ROOM_PX = 16
const KEY_ROOM_PX = { width: 236, height: 180 }

function fitAroundKey(
  canvas: { width: number; height: number },
  diagram: { width: number; height: number }
): FitViewOptions {
  const px = (value: number): `${number}px` =>
    // React Flow's padding type is `${number}px`, which only a number builds.
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    `${value}px`
  const zoomWithKeyBeside = Math.min(
    (canvas.width - KEY_ROOM_PX.width - EDGE_ROOM_PX) / diagram.width,
    (canvas.height - 2 * EDGE_ROOM_PX) / diagram.height
  )
  const zoomWithKeyBelow = Math.min(
    (canvas.width - 2 * EDGE_ROOM_PX) / diagram.width,
    (canvas.height - KEY_ROOM_PX.height - EDGE_ROOM_PX) / diagram.height
  )
  const edge = px(EDGE_ROOM_PX)
  return zoomWithKeyBeside >= zoomWithKeyBelow
    ? {
        padding: {
          top: edge,
          right: edge,
          bottom: edge,
          left: px(KEY_ROOM_PX.width),
        },
      }
    : {
        padding: {
          top: edge,
          right: edge,
          bottom: px(KEY_ROOM_PX.height),
          left: edge,
        },
      }
}

const DEFAULT_FIT_VIEW_OPTIONS = fitAroundKey(
  { width: 1000, height: 640 },
  { width: 1, height: 1 }
)

type AgentDiagramProps = {
  diagram: Diagram
  layout: DiagramLayout
  // The parts lit up: steps by id, and terms wherever they're drawn.
  highlightedNodeIds?: ReadonlySet<string>
  highlightedTermIds?: ReadonlySet<TermId>
  selection?: DiagramSelection | undefined
  // Leave out to draw a picture nobody can click.
  onSelect?: (selection: DiagramSelection) => void
  // Back to the start: nothing selected, the whole diagram in view.
  onClearSelection?: () => void
  label: string
  className?: string
}

const NO_IDS: ReadonlySet<never> = new Set()

export function AgentDiagram(props: AgentDiagramProps) {
  return (
    <ReactFlowProvider>
      <AgentDiagramCanvas {...props} />
    </ReactFlowProvider>
  )
}

function AgentDiagramCanvas({
  diagram,
  layout,
  highlightedNodeIds = NO_IDS,
  highlightedTermIds = NO_IDS,
  selection,
  onSelect,
  onClearSelection,
  label,
  className,
}: AgentDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { fitView } = useReactFlow()

  const litNodeIds = new Set(
    diagram.nodes
      .filter(
        (node) =>
          highlightedNodeIds.has(node.id) ||
          node.termIds.some((termId) => highlightedTermIds.has(termId))
      )
      .map((node) => node.id)
  )
  const isLoopLit = highlightedTermIds.has(diagram.loop.termId)
  const isHighlighting = litNodeIds.size > 0 || isLoopLit
  // React Flow turns off pointer events on nodes nobody can select or drag;
  // the buttons inside still need clicks.
  const interactiveStyle = onSelect
    ? { style: { pointerEvents: "all" as const } }
    : {}

  const loopNode: LoopGroupFlowNode = {
    id: LOOP_NODE_ID,
    type: "loop",
    position: { x: layout.loop.x, y: layout.loop.y },
    width: layout.loop.width,
    height: layout.loop.height,
    zIndex: -1,
    ...interactiveStyle,
    data: {
      loop: diagram.loop,
      actorKey: diagram.actorKey,
      isHighlighted: isLoopLit,
      onSelect,
    },
  }

  const partNodes: DiagramFlowNode[] = diagram.nodes.flatMap((node) => {
    const box = layout.nodes[node.id]
    if (!box) {
      return []
    }
    const isStep = node.kind === "step"
    return [
      {
        id: node.id,
        type: "part",
        // Steps sit inside the loop, so React Flow wants them relative to it.
        position: isStep
          ? { x: box.x - layout.loop.x, y: box.y - layout.loop.y }
          : { x: box.x, y: box.y },
        ...(isStep ? { parentId: LOOP_NODE_ID } : {}),
        width: box.width,
        height: box.height,
        ...interactiveStyle,
        data: {
          config: node,
          isHighlighted: litNodeIds.has(node.id),
          isDimmed: isHighlighting && !litNodeIds.has(node.id),
          isSelected:
            selection?.type === "node" && selection.nodeId === node.id,
          highlightedTermIds,
          onSelect,
        },
      },
    ]
  })

  // React Flow fits to nodes, not to arrow labels. This invisible node spans
  // the whole layout, labels included, so a fit never cuts a label off.
  const boundsNode: Node = {
    id: "bounds",
    position: { x: 0, y: 0 },
    width: layout.width,
    height: layout.height,
    zIndex: -2,
    selectable: false,
    focusable: false,
    style: { opacity: 0, pointerEvents: "none" },
    data: {},
  }

  const nodes: Node[] = [boundsNode, loopNode, ...partNodes]
  const edgeKinds = [...new Set(diagram.edges.map((edge) => edge.kind))]

  const edges: DiagramFlowEdge[] = diagram.edges.map((edge) => {
    const route = layout.edges[edge.id]
    const isHighlighted = litNodeIds.has(edge.from) && litNodeIds.has(edge.to)
    return {
      id: edge.id,
      source: edge.from,
      target: edge.to,
      type: "routed",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color:
          isHighlighted && edge.kind !== "repeat"
            ? "var(--foreground)"
            : edgeStroke(edge.kind),
      },
      data: {
        config: edge,
        points: route?.points ?? [],
        labelBox: route?.label,
        isHighlighted,
        isDimmed: isHighlighting && !isHighlighted && edge.kind !== "repeat",
      },
    }
  })

  // The fit that suits the canvas's shape right now.
  function currentFit(): FitViewOptions {
    const canvas = ref.current?.getBoundingClientRect()
    if (!canvas) {
      return DEFAULT_FIT_VIEW_OPTIONS
    }
    return fitAroundKey(canvas, layout)
  }

  function handleReset() {
    onClearSelection?.()
    void fitView({ ...currentFit(), duration: 300 })
  }

  // Keep the whole diagram in view as its container changes size.
  useEffect(() => {
    const container = ref.current
    if (!container) {
      return
    }
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return
      }
      void fitView(fitAroundKey(entry.contentRect, layout))
    })
    observer.observe(container)
    return () => {
      observer.disconnect()
    }
  }, [fitView, layout])

  return (
    <div
      ref={ref}
      role="figure"
      aria-label={label}
      className={cn("size-full bg-canvas", className)}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        fitView
        fitViewOptions={DEFAULT_FIT_VIEW_OPTIONS}
        minZoom={0.2}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        panOnDrag
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick={false}
        preventScrolling={false}
        {...(onClearSelection ? { onPaneClick: onClearSelection } : {})}
      >
        <Panel position="bottom-left">
          <DiagramKey edgeKinds={edgeKinds} />
        </Panel>
        {onSelect ? (
          <Panel position="top-right">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw data-icon="inline-start" />
              Reset view
            </Button>
          </Panel>
        ) : null}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="var(--canvas-dot)"
        />
      </ReactFlow>
    </div>
  )
}
