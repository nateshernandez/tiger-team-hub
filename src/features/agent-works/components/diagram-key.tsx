import { ToolTypeBadge } from "@/components/term/tool-type-badge"
import { edgeStroke } from "@/features/agent-works/components/diagram-edge"
import { type DiagramEdge } from "@/features/agent-works/lib/diagram-schema"

// What each kind of arrow means. The key lists only the kinds the diagram
// draws, so it can't describe an arrow that isn't there.
const EDGE_KIND_LABELS: Record<DiagramEdge["kind"], string> = {
  flow: "On to the next step",
  repeat: "The loop goes around again",
  exit: "A way out of the loop",
  pause: "Waits for a person",
}

type DiagramKeyProps = {
  edgeKinds: DiagramEdge["kind"][]
}

// Pinned to the canvas's corner, so it stays put while the reader pans.
export function DiagramKey({ edgeKinds }: DiagramKeyProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card/95 px-3 py-2.5 text-[11.5px] text-muted-foreground shadow-sm backdrop-blur-sm">
      <p className="text-[11px] font-semibold tracking-wide uppercase">Key</p>
      <ul className="flex flex-col gap-1.5">
        {edgeKinds.map((kind) => (
          <li key={kind} className="flex items-center gap-2">
            <svg aria-hidden="true" width="26" height="8" className="shrink-0">
              <line
                x1="0"
                y1="4"
                x2="26"
                y2="4"
                stroke={edgeStroke(kind)}
                strokeWidth={kind === "repeat" ? 2.25 : 1.5}
                strokeDasharray={
                  kind === "exit" || kind === "pause" ? "5 4" : undefined
                }
              />
            </svg>
            {EDGE_KIND_LABELS[kind]}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-1.5">
        <ToolTypeBadge toolType="mcp" />
        <ToolTypeBadge toolType="agent" />
      </div>
    </div>
  )
}
