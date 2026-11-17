import { type Node, type NodeProps } from "@xyflow/react"

import { ROLE_STYLES } from "@/components/term/role-styles"
import { TermIcon } from "@/components/term/term-icon"
import { type DiagramSelection } from "@/features/agent-works/components/diagram-node"
import { type Diagram } from "@/features/agent-works/lib/diagram-schema"
import { cn } from "@/lib/utils"
import { getTerm } from "@/lib/vocabulary/terms"

type LoopGroupNodeData = {
  loop: Diagram["loop"]
  actorKey: Diagram["actorKey"]
  isHighlighted: boolean
  onSelect: ((selection: DiagramSelection) => void) | undefined
}

export type LoopGroupFlowNode = Node<LoopGroupNodeData, "loop">

// The box the steps sit in. It names the loop, so no single step has to, and
// carries the one-line key for who does what.
export function LoopGroupNode({ data }: NodeProps<LoopGroupFlowNode>) {
  const { loop, actorKey, isHighlighted, onSelect } = data
  const term = getTerm(loop.termId)
  const style = ROLE_STYLES[term.role]

  const title = (
    <>
      <TermIcon termId={loop.termId} className={cn("size-4", style.icon)} />
      <span className="text-sm font-semibold tracking-tight">{loop.title}</span>
    </>
  )

  return (
    <div
      className={cn(
        "size-full rounded-2xl border-2 border-dashed border-role-decide/40 bg-role-decide-surface/30",
        isHighlighted && "border-role-decide"
      )}
    >
      <div className="flex items-center justify-between gap-4 px-5 pt-3.5">
        {onSelect ? (
          <button
            type="button"
            aria-label={`${loop.title}: show what it is`}
            onClick={() => {
              onSelect({ type: "term", termId: loop.termId })
            }}
            className="nodrag nopan inline-flex cursor-pointer items-center gap-2 rounded-md text-role-decide-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {title}
          </button>
        ) : (
          <span className="inline-flex items-center gap-2 text-role-decide-foreground">
            {title}
          </span>
        )}
        <span className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full bg-role-decide"
            />
            {actorKey.model}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full bg-foreground"
            />
            {actorKey.agent}
          </span>
        </span>
      </div>
    </div>
  )
}
