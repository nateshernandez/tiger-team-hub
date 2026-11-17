import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
} from "@xyflow/react"

import { type DiagramEdge as DiagramEdgeConfig } from "@/features/agent-works/lib/diagram-schema"
import { roundedEdgePath } from "@/features/agent-works/lib/edge-path"
import { type Box, type Point } from "@/features/agent-works/lib/layout-diagram"
import { cn } from "@/lib/utils"

type DiagramEdgeData = {
  config: DiagramEdgeConfig
  points: Point[]
  labelBox: Box | undefined
  isHighlighted: boolean
  isDimmed: boolean
}

export type DiagramFlowEdge = Edge<DiagramEdgeData, "routed">

// The repeat arrow is the only colored line, so the loop is unmistakable;
// exits and pauses are dashed, because they leave the loop.
const STROKES: Record<DiagramEdgeConfig["kind"], string> = {
  flow: "var(--muted-foreground)",
  repeat: "var(--role-decide)",
  exit: "var(--muted-foreground)",
  pause: "var(--role-oversight)",
}

export function edgeStroke(kind: DiagramEdgeConfig["kind"]): string {
  return STROKES[kind]
}

// Draws ELK's route rather than React Flow's own, so arrows never cross a box.
export function DiagramEdge({
  id,
  data,
  markerEnd,
}: EdgeProps<DiagramFlowEdge>) {
  if (!data) {
    return null
  }
  const { config, points, labelBox, isHighlighted, isDimmed } = data
  const isRepeat = config.kind === "repeat"
  const isDashed = config.kind === "exit" || config.kind === "pause"

  return (
    <>
      <BaseEdge
        id={id}
        path={roundedEdgePath(points)}
        {...(markerEnd ? { markerEnd } : {})}
        className={cn(
          "transition-opacity duration-200",
          isDimmed && "opacity-30"
        )}
        style={{
          stroke:
            isHighlighted && !isRepeat
              ? "var(--foreground)"
              : STROKES[config.kind],
          strokeWidth: isRepeat || isHighlighted ? 2.25 : 1.5,
          strokeDasharray: isDashed ? "6 5" : undefined,
        }}
      />
      {labelBox ? (
        <EdgeLabelRenderer>
          <div
            className={cn(
              "nodrag nopan pointer-events-none absolute flex items-center justify-center transition-opacity duration-200",
              isDimmed && "opacity-70"
            )}
            style={{
              transform: `translate(${String(labelBox.x)}px, ${String(labelBox.y)}px)`,
              width: labelBox.width,
              height: labelBox.height,
            }}
          >
            <span
              className={cn(
                "rounded-md border bg-background px-2 py-0.5 text-xs whitespace-nowrap",
                isRepeat
                  ? "border-role-decide/50 font-semibold text-role-decide-foreground"
                  : "text-muted-foreground"
              )}
            >
              {config.label}
            </span>
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  )
}
