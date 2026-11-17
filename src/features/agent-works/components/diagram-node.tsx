import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"

import { ROLE_STYLES } from "@/components/term/role-styles"
import { TermIcon } from "@/components/term/term-icon"
import { type DiagramNode as DiagramNodeConfig } from "@/features/agent-works/lib/diagram-schema"
import { cn } from "@/lib/utils"
import { type TermId } from "@/lib/vocabulary/term-schema"
import { getTerm } from "@/lib/vocabulary/terms"

export type DiagramSelection =
  { type: "node"; nodeId: string } | { type: "term"; termId: TermId }

type DiagramNodeData = {
  config: DiagramNodeConfig
  isHighlighted: boolean
  isDimmed: boolean
  isSelected: boolean
  highlightedTermIds: ReadonlySet<TermId>
  onSelect: ((selection: DiagramSelection) => void) | undefined
}

export type DiagramFlowNode = Node<DiagramNodeData, "part">

// MCP tools are dashed and agent tools solid, here as everywhere else.
const TERM_CHIP_SHAPES: Partial<Record<TermId, string>> = {
  "mcp-tools": "border-dashed",
}

export function DiagramNode({ data }: NodeProps<DiagramFlowNode>) {
  const {
    config,
    isHighlighted,
    isDimmed,
    isSelected,
    highlightedTermIds,
    onSelect,
  } = data
  const isStep = config.kind === "step"
  const isModel = isStep && config.actor === "model"

  return (
    <div
      className={cn(
        "relative flex size-full flex-col border bg-card text-card-foreground transition-[opacity,box-shadow,border-color] duration-200",
        onSelect && "hover:border-foreground/40",
        isStep ? "rounded-xl" : "rounded-2xl",
        config.kind === "person" && "border-dashed",
        config.kind === "exit" && "bg-muted",
        isModel && "border-role-decide/50 bg-role-decide-surface",
        isHighlighted &&
          "ring-2 ring-foreground/80 ring-offset-2 ring-offset-canvas",
        isSelected && "shadow-md",
        isDimmed && "opacity-70"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={false}
        className="invisible"
      />
      <NodeHeader config={config} isSelected={isSelected} onSelect={onSelect} />
      {config.termIds.length > 0 ? (
        // Above the node's click area, so each chip opens its own term;
        // the gaps between chips still select the node.
        <ul className="pointer-events-none relative z-10 flex flex-wrap gap-1.5 px-3 pb-3">
          {config.termIds.map((termId) => (
            <li key={termId}>
              <TermMarker
                termId={termId}
                isHighlighted={highlightedTermIds.has(termId)}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      ) : null}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={false}
        className="invisible"
      />
    </div>
  )
}

type NodeHeaderProps = {
  config: DiagramNodeConfig
  isSelected: boolean
  onSelect: ((selection: DiagramSelection) => void) | undefined
}

function NodeHeader({ config, isSelected, onSelect }: NodeHeaderProps) {
  const isModel = config.kind === "step" && config.actor === "model"
  const content = (
    <>
      {config.kind === "step" ? (
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full font-semibold tabular-nums",
            "size-6 text-xs",
            isModel
              ? "bg-role-decide text-background"
              : "bg-foreground text-background"
          )}
        >
          {config.step}
        </span>
      ) : null}
      <span
        className={cn(
          "min-w-0 truncate text-sm leading-tight font-semibold tracking-tight"
        )}
      >
        {config.title}
      </span>
    </>
  )
  const className = cn(
    "flex h-[46px] w-full shrink-0 items-center gap-2 px-3 text-left",
    config.kind === "step" ? "after:rounded-xl" : "after:rounded-2xl"
  )

  if (!onSelect) {
    return <div className={className}>{content}</div>
  }

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={
        config.kind === "step"
          ? `Step ${String(config.step)}, ${config.title}: show what happens`
          : `${config.title}: show what happens`
      }
      onClick={() => {
        onSelect({ type: "node", nodeId: config.id })
      }}
      className={cn(
        className,
        // The click area stretches over the whole node, not just its title.
        "nodrag nopan cursor-pointer after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
      )}
    >
      {content}
    </button>
  )
}

type TermMarkerProps = {
  termId: TermId
  isHighlighted: boolean
  onSelect: ((selection: DiagramSelection) => void) | undefined
}

function TermMarker({ termId, isHighlighted, onSelect }: TermMarkerProps) {
  const term = getTerm(termId)
  const style = ROLE_STYLES[term.role]
  const className = cn(
    "inline-flex h-[22px] items-center gap-1 rounded-md border px-1.5 text-[11.5px] font-medium whitespace-nowrap",
    style.surface,
    style.foreground,
    style.border,
    TERM_CHIP_SHAPES[termId],
    isHighlighted && ["ring-2", style.ring]
  )
  const content = (
    <>
      <TermIcon termId={termId} className={cn("size-3", style.icon)} />
      {term.label}
    </>
  )

  if (!onSelect) {
    return <span className={className}>{content}</span>
  }

  return (
    <button
      type="button"
      aria-label={`${term.label}: show what it is`}
      onClick={() => {
        onSelect({ type: "term", termId })
      }}
      className={cn(
        className,
        "nodrag nopan pointer-events-auto cursor-pointer hover:brightness-[0.97] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:hover:brightness-110"
      )}
    >
      {content}
    </button>
  )
}
